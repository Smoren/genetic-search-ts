import { Pool } from 'multiprocess-pool';
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
  MetricsCacheInterface,
} from "./types";
import { normalizeMetricsMatrix, arrayBinaryOperation, arraySum } from "./utils";
import { zip } from "./itertools";
import { DummyMetricsCache } from "./cache";

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
  protected readonly cache: MetricsCacheInterface;

  constructor(config: TConfig) {
    this.cache = config.cache ?? new DummyMetricsCache();
    this.config = config;
  }

  public async run(population: Population<TGenome>): Promise<GenerationMetricsMatrix> {
    this.cache.clear(population.map((genome) => genome.id));

    const resultsMap = new Map(population.map((genome) => [genome.id, this.cache.ready(genome.id)]));

    const genomesToRun = population.filter((genome) => resultsMap.get(genome.id) === undefined);
    const newResults = await this.execTasks(genomesToRun.map((genome) => this.createTaskInput(genome)));

    for (const [genome, result] of zip(genomesToRun, newResults)) {
      this.cache.set(genome.id, result);
      resultsMap.set(genome.id, this.cache.get(genome.id, result));
    }

    return population.map((genome) => resultsMap.get(genome.id)!);
  }

  public clone(): MetricsStrategyInterface<TGenome> {
    return new (this.constructor as any)(this.config);
  }

  protected async execTasks(inputs: TTaskConfig[]): Promise<GenerationMetricsMatrix> {
    const result: GenerationMetricsMatrix = [];
    for (const input of inputs) {
      const taskResult = await this.config.task(input);
      this.config.onTaskResult?.(taskResult);
      result.push(taskResult);
    }
    return result;
  }

  protected abstract createTaskInput(genome: TGenome): TTaskConfig;
}

export abstract class BaseMultiprocessingMetricsStrategy<
  TGenome extends BaseGenome,
  TConfig extends MultiprocessingMetricsStrategyConfig<TTaskConfig>,
  TTaskConfig,
> extends BaseMetricsStrategy<TGenome, TConfig, TTaskConfig> {
  protected async execTasks(inputs: TTaskConfig[]): Promise<GenerationMetricsMatrix> {
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
  protected readonly _cache: Map<number, GenomeMetricsRow> = new Map();

  protected abstract getGenomeId(input: TTaskConfig): number;

  protected async execTasks(inputs: TTaskConfig[]): Promise<GenerationMetricsMatrix> {
    const resultsMap = new Map(inputs.map((input) => [
      this.getGenomeId(input),
      this._cache.get(this.getGenomeId(input))
    ]));
    const inputsToRun = inputs.filter((input) => resultsMap.get(this.getGenomeId(input)) === undefined);
    const newResults = await super.execTasks(inputsToRun);

    for (const [input, result] of zip(inputsToRun, newResults)) {
      this.cache.set(this.getGenomeId(input), result);
      resultsMap.set(this.getGenomeId(input), result);
    }

    const results: GenerationMetricsMatrix = [];
    for (const input of inputs) {
      results.push(resultsMap.get(this.getGenomeId(input))!);
    }

    for (const id of this._cache.keys()) {
      if (!resultsMap.has(id)) {
        this._cache.delete(id);
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
