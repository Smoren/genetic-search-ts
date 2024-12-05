import {
  BaseGenome,
  Population,
  BaseMutationStrategyConfig,
  MutationStrategyInterface,
  MetricsStrategyInterface,
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

  public async collect(population: Population<TGenome>, cache: MetricsCacheInterface): Promise<GenerationMetricsMatrix> {
    const resultsMap = new Map(population.map((genome) => [genome.id, cache.getReady(genome.id)]));

    const genomesToRun = population.filter((genome) => resultsMap.get(genome.id) === undefined);
    const newResults = await this.execTasks(genomesToRun.map((genome) => this.createTaskInput(genome)));

    for (const [genome, result] of zip(genomesToRun, newResults)) {
      cache.set(genome.id, result);
    }

    for (const [genome, result] of zip(genomesToRun, newResults)) {
      resultsMap.set(genome.id, cache.get(genome.id, result));
    }

    return population.map((genome) => resultsMap.get(genome.id)!);
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
