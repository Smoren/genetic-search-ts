import { Pool } from 'multiprocess-pool';
import { multi } from 'itertools-ts';
import {
  BaseGenome,
  Population,
  BaseMutationStrategyConfig,
  MutationStrategyInterface,
  MetricsStrategyInterface,
  MultiprocessingMetricsStrategyConfig,
  FitnessStrategyInterface,
  GeneticSearchReferenceConfig,
  MetricsStrategyConfig,
  GenerationMetricsMatrix,
  GenomeMetricsRow,
  GenerationFitnessColumn,
} from "./types";
import { normalizeMetricsMatrix, arrayBinaryOperation, arraySum } from "./utils";

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

export abstract class BaseMetricsStrategy<
  TGenome extends BaseGenome,
  TConfig extends MetricsStrategyConfig<TTaskConfig>,
  TTaskConfig,
> implements MetricsStrategyInterface<TGenome> {
  protected readonly config: TConfig;

  constructor(config: TConfig) {
    this.config = config;
  }

  public async run(population: Population<TGenome>): Promise<GenerationMetricsMatrix> {
    const inputs = this.createTasksInputList(population);
    return await this.execTask(inputs);
  }

  public clone(): MetricsStrategyInterface<TGenome> {
    return new (this.constructor as any)(this.config);
  }

  protected async execTask(inputs: TTaskConfig[]): Promise<GenerationMetricsMatrix> {
    const result: GenerationMetricsMatrix = [];
    for (const input of inputs) {
      const taskResult = await this.config.task(input);
      this.config.onTaskResult?.(taskResult);
      result.push(taskResult);
    }
    return result;
  }

  protected abstract createTaskInput(genome: TGenome): TTaskConfig;

  protected createTasksInputList(population: Population<TGenome>): TTaskConfig[] {
    return population.map((genome) => this.createTaskInput(genome));
  }
}

export abstract class BaseMultiprocessingMetricsStrategy<
  TGenome extends BaseGenome,
  TConfig extends MultiprocessingMetricsStrategyConfig<TTaskConfig>,
  TTaskConfig,
> extends BaseMetricsStrategy<TGenome, TConfig, TTaskConfig> {
  protected async execTask(inputs: TTaskConfig[]): Promise<GenerationMetricsMatrix> {
    const pool = new Pool(this.config.poolSize);
    const result: GenerationMetricsMatrix = await pool.map(inputs, this.config.task, {
      onResult: (result: any) => this.config.onTaskResult?.(result as GenomeMetricsRow),
    });
    pool.close();

    return result;
  }
}

export abstract class BaseCachedMultiprocessingMetricsStrategy<
  TGenome extends BaseGenome,
  TConfig extends MultiprocessingMetricsStrategyConfig<TTaskConfig>,
  TTaskConfig,
> extends BaseMultiprocessingMetricsStrategy<TGenome, TConfig, TTaskConfig> {
  protected readonly cache: Map<number, GenomeMetricsRow> = new Map();

  protected abstract getGenomeId(input: TTaskConfig): number;

  protected async execTask(inputs: TTaskConfig[]): Promise<GenerationMetricsMatrix> {
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

    const results: GenerationMetricsMatrix = [];
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

export class ReferenceLossFitnessStrategy implements FitnessStrategyInterface {
  private referenceConfig: GeneticSearchReferenceConfig;

  constructor(referenceConfig: GeneticSearchReferenceConfig) {
    this.referenceConfig = referenceConfig;
  }

  score(results: GenerationMetricsMatrix): GenerationFitnessColumn {
    const normalizedLosses = this.formatLosses(results);
    return normalizedLosses.map((x) => -arraySum(x));
  }

  protected formatLosses(results: GenerationMetricsMatrix): GenerationMetricsMatrix {
    return normalizeMetricsMatrix(results, this.referenceConfig.reference).map((result) => this.weighRow(result));
  }

  protected weighRow(result: GenomeMetricsRow): GenomeMetricsRow {
    return arrayBinaryOperation(result, this.referenceConfig.weights, (x, y) => x * y);
  }
}
