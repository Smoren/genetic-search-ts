import { Pool } from 'multiprocess-pool';
import { multi } from 'itertools-ts';
import type {
  Population,
  MutationStrategyConfig,
  MutationStrategyInterface,
  RunnerStrategyInterface,
  ScoringStrategyInterface,
  GeneticSearchReferenceConfig,
  RunnerStrategyConfig,
  BaseGenome,
} from "./types";
import { normalizeGradeMatrix, arrayBinaryOperation, arraySum } from "./utils";

export abstract class BaseMutationStrategy<TGenome extends BaseGenome> implements MutationStrategyInterface<TGenome> {
  protected readonly config: MutationStrategyConfig;

  protected constructor(config: MutationStrategyConfig) {
    this.config = config;
  }

  public abstract mutate(id: number, genome: TGenome): TGenome;
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

  public async run(population: Population<TGenome>): Promise<number[][]> {
    const inputs = this.createTasksInputList(population);
    return await this.execTask(inputs);
  }

  protected async execTask(inputs: TTaskConfig[]): Promise<number[][]> {
    const result = [];
    for (const input of inputs) {
      result.push(await this.config.task(input));
    }
    return result;
  }

  protected abstract createTaskInput(id: number, genome: TGenome): TTaskConfig;

  protected createTasksInputList(population: Population<TGenome>): TTaskConfig[] {
    return population.map((genome) => this.createTaskInput(genome.id, genome));
  }
}

export abstract class BaseMultiprocessingRunnerStrategy<
  TGenome extends BaseGenome,
  TConfig extends RunnerStrategyConfig<TTaskConfig>,
  TTaskConfig,
> extends BaseRunnerStrategy<TGenome, TConfig, TTaskConfig> {
  protected async execTask(inputs: TTaskConfig[]): Promise<number[][]> {
    const pool = new Pool(this.config.poolSize);
    const result: number[][] = await pool.map(inputs, this.config.task);
    pool.close();

    return result;
  }
}

export abstract class BaseCachedMultiprocessingRunnerStrategy<
  TGenome extends BaseGenome,
  TConfig extends RunnerStrategyConfig<TTaskConfig>,
  TTaskConfig,
> extends BaseMultiprocessingRunnerStrategy<TGenome, TConfig, TTaskConfig> {
  protected readonly cache: Map<number, number[]> = new Map();

  protected abstract getTaskId(input: TTaskConfig): number;

  protected async execTask(inputs: TTaskConfig[]): Promise<number[][]> {
    const resultsMap = new Map(inputs.map((input) => [this.getTaskId(input), this.cache.get(this.getTaskId(input))]));
    const inputsToRun = inputs.filter((input) => resultsMap.get(this.getTaskId(input)) === undefined);
    const newResults = await super.execTask(inputsToRun);

    for (const [input, result] of multi.zip(inputsToRun, newResults)) {
      this.cache.set(this.getTaskId(input), result);
      resultsMap.set(this.getTaskId(input), result);
    }

    const results: number[][] = [];
    for (const input of inputs) {
      results.push(resultsMap.get(this.getTaskId(input)) as number[]);
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

  score(results: number[][]): number[] {
    const normalizedLosses = this.getNormalizedLosses(results);
    return normalizedLosses.map((x) => -arraySum(x));
  }

  private getNormalizedLosses(results: number[][]): number[][] {
    return normalizeGradeMatrix(results, this.referenceConfig.reference).map((result) => this.weighRow(result));
  }

  private weighRow(result: number[]): number[] {
    return arrayBinaryOperation(result, this.referenceConfig.weights, (x, y) => x * y);
  }
}
