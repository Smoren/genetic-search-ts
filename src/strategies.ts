import { Pool } from 'multiprocess-pool';
import { multi } from 'itertools-ts';
import {
  BaseGenome,
  Population,
  BaseMutationStrategyConfig,
  MutationStrategyInterface,
  RunnerStrategyInterface,
  MultiprocessingRunnerStrategyConfig,
  ScoringStrategyInterface,
  GeneticSearchReferenceConfig,
  RunnerStrategyConfig,
  GenerationGradeMatrix,
  GenomeGradeRow,
  GenerationScoreColumn,
} from "./types";
import { normalizeGradeMatrix, arrayBinaryOperation, arraySum } from "./utils";

export abstract class BaseMutationStrategy<
  TGenome extends BaseGenome,
  TConfig extends BaseMutationStrategyConfig,
> implements MutationStrategyInterface<TGenome> {
  protected readonly config: TConfig;

  protected constructor(config: TConfig) {
    this.config = config;
  }

  public abstract mutate(genome: TGenome, newGenomeId: number): TGenome;
}

export abstract class BaseRunnerStrategy<
  TGenome extends BaseGenome,
  TConfig extends RunnerStrategyConfig<TTaskConfig>,
  TTaskConfig,
> implements RunnerStrategyInterface<TGenome> {
  protected readonly config: TConfig;

  constructor(config: TConfig) {
    this.config = config;
  }

  public async run(population: Population<TGenome>): Promise<GenerationGradeMatrix> {
    const inputs = this.createTasksInputList(population);
    return await this.execTask(inputs);
  }

  protected async execTask(inputs: TTaskConfig[]): Promise<GenerationGradeMatrix> {
    const result: GenerationGradeMatrix = [];
    for (const input of inputs) {
      result.push(await this.config.task(input));
    }
    return result;
  }

  protected abstract createTaskInput(genome: TGenome): TTaskConfig;

  protected createTasksInputList(population: Population<TGenome>): TTaskConfig[] {
    return population.map((genome) => this.createTaskInput(genome));
  }
}

export abstract class BaseMultiprocessingRunnerStrategy<
  TGenome extends BaseGenome,
  TConfig extends MultiprocessingRunnerStrategyConfig<TTaskConfig>,
  TTaskConfig,
> extends BaseRunnerStrategy<TGenome, TConfig, TTaskConfig> {
  protected async execTask(inputs: TTaskConfig[]): Promise<GenerationGradeMatrix> {
    const pool = new Pool(this.config.poolSize);
    const result: GenerationGradeMatrix = await pool.map(inputs, this.config.task);
    pool.close();

    return result;
  }
}

export abstract class BaseCachedMultiprocessingRunnerStrategy<
  TGenome extends BaseGenome,
  TConfig extends MultiprocessingRunnerStrategyConfig<TTaskConfig>,
  TTaskConfig,
> extends BaseMultiprocessingRunnerStrategy<TGenome, TConfig, TTaskConfig> {
  protected readonly cache: Map<number, GenomeGradeRow> = new Map();

  protected abstract getGenomeId(input: TTaskConfig): number;

  protected async execTask(inputs: TTaskConfig[]): Promise<GenerationGradeMatrix> {
    const resultsMap = new Map(inputs.map((input) => [
      this.getGenomeId(input),
      this.cache.get(this.getGenomeId(input))
    ]));
    const inputsToRun = inputs.filter((input) => resultsMap.get(this.getGenomeId(input)) === undefined);
    const newResults = await super.execTask(inputsToRun);

    for (const [input, result] of multi.zip(inputsToRun, newResults)) {
      this.cache.set(this.getGenomeId(input), result);
      resultsMap.set(this.getGenomeId(input), result);
    }

    const results: GenerationGradeMatrix = [];
    for (const input of inputs) {
      results.push(resultsMap.get(this.getGenomeId(input))!);
    }

    for (const id of this.cache.keys()) {
      if (!resultsMap.has(id)) {
        this.cache.delete(id);
      }
    }

    return results;
  }
}

export class ReferenceLossScoringStrategy implements ScoringStrategyInterface {
  private referenceConfig: GeneticSearchReferenceConfig;

  constructor(referenceConfig: GeneticSearchReferenceConfig) {
    this.referenceConfig = referenceConfig;
  }

  score(results: GenerationGradeMatrix): GenerationScoreColumn {
    const normalizedLosses = this.formatLosses(results);
    return normalizedLosses.map((x) => -arraySum(x));
  }

  protected formatLosses(results: GenerationGradeMatrix): GenerationGradeMatrix {
    return normalizeGradeMatrix(results, this.referenceConfig.reference).map((result) => this.weighRow(result));
  }

  protected weighRow(result: GenomeGradeRow): GenomeGradeRow {
    return arrayBinaryOperation(result, this.referenceConfig.weights, (x, y) => x * y);
  }
}
