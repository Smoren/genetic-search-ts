import type {
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

/**
 * Base class for mutation strategies.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration for the mutation strategy.
 */
export abstract class BaseMutationStrategy<
  TGenome extends BaseGenome,
  TConfig extends BaseMutationStrategyConfig,
> implements MutationStrategyInterface<TGenome> {
  /**
   * The configuration for the mutation strategy.
   */
  protected readonly config: TConfig;

  /**
   * Constructs a new instance of the mutation strategy.
   *
   * @param config The configuration for the mutation strategy.
   */
  protected constructor(config: TConfig) {
    this.config = config;
  }

  public abstract mutate(genome: TGenome, newGenomeId: number): TGenome;
}

/**
 * Base class for metrics strategies.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration for the metrics strategy.
 * @template TTaskConfig The type of configuration required to execute the task of the calculating metrics.
 */
export abstract class BaseMetricsStrategy<
  TGenome extends BaseGenome,
  TConfig extends MetricsStrategyConfig<TTaskConfig>,
  TTaskConfig,
> implements MetricsStrategyInterface<TGenome> {
  /**
   * The configuration for the metrics strategy.
   */
  protected readonly config: TConfig;

  /**
   * Constructs a new instance of the metrics strategy.
   *
   * @param config The configuration for the metrics strategy.
   */
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

  /**
   * Executes the tasks to calculate the metrics of the given genomes.
   *
   * @param inputs The inputs for the tasks to execute.
   * @returns A promise that resolves to an array of metrics for each genome.
   */
  protected async execTasks(inputs: TTaskConfig[]): Promise<GenerationMetricsMatrix> {
    const result: GenerationMetricsMatrix = [];
    for (const input of inputs) {
      const taskResult = await this.config.task(input);
      this.config.onTaskResult?.(taskResult, input);
      result.push(taskResult);
    }
    return result;
  }

  /**
   * Creates the task input required for calculating metrics for
   * a given genome.
   *
   * @param genome The genome for which to create the task input.
   * @returns The task configuration for the given genome.
   */
  protected abstract createTaskInput(genome: TGenome): TTaskConfig;
}

/**
 * A fitness strategy that calculates the fitness of a genome based on a reference loss.
 *
 * The fitness of a genome is calculated as the negative sum of the absolute differences between the reference loss
 * and the loss calculated for the genome.
 */
export class ReferenceLossFitnessStrategy implements FitnessStrategyInterface {
  /**
   * The configuration for the reference loss fitness strategy.
   */
  private readonly referenceConfig: GeneticSearchReferenceConfig;

  /**
   * Constructor of the reference loss fitness strategy.
   *
   * @param referenceConfig The configuration for the reference loss fitness strategy.
   */
  constructor(referenceConfig: GeneticSearchReferenceConfig) {
    this.referenceConfig = referenceConfig;
  }

  public score(results: GenerationMetricsMatrix): GenerationFitnessColumn {
    const normalizedLosses = this.formatLosses(results);
    return normalizedLosses.map((x) => -arraySum(x));
  }

  /**
   * Formats the losses by normalizing the metrics matrix and applying weights to each row.
   *
   * @param results The generation metrics matrix to format.
   * @returns A matrix of formatted losses.
   */
  protected formatLosses(results: GenerationMetricsMatrix): GenerationMetricsMatrix {
    return normalizeMetricsMatrix(results, this.referenceConfig.reference).map((result) => this.weighRow(result));
  }

  /**
   * Weighs a row of metrics by multiplying each element with its corresponding weight.
   *
   * @param result The genome metrics row to weigh.
   * @returns A genome metrics row with applied weights.
   */
  protected weighRow(result: GenomeMetricsRow): GenomeMetricsRow {
    return arrayBinaryOperation(result, this.referenceConfig.weights, (x, y) => x * y);
  }
}
