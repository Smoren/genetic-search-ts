import type {
  BaseGenome,
  Population,
  BaseMutationStrategyConfig,
  MutationStrategyInterface,
  PhenotypeStrategyInterface,
  FitnessStrategyInterface,
  GeneticSearchReferenceConfig,
  PhenotypeStrategyConfig,
  GenerationPhenotypeMatrix,
  GenomePhenotypeRow,
  GenerationFitnessColumn,
  PhenotypeCacheInterface,
  SortStrategyInterface,
  SelectionStrategyInterface,
  EvaluatedGenome,
} from "./types";
import { normalizePhenotypeMatrix, arrayBinaryOperation, arraySum, getRandomArrayItem } from "./utils";
import {sort, zip} from "./itertools";

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
 * Base class for phenotype strategies.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration for the phenotype strategy.
 * @template TTaskConfig The type of configuration required to execute the task of the calculating phenotype.
 */
export abstract class BasePhenotypeStrategy<
  TGenome extends BaseGenome,
  TConfig extends PhenotypeStrategyConfig<TTaskConfig>,
  TTaskConfig,
> implements PhenotypeStrategyInterface<TGenome> {
  /**
   * The configuration for the phenotype strategy.
   */
  protected readonly config: TConfig;

  /**
   * Constructs a new instance of the phenotype strategy.
   *
   * @param config The configuration for the phenotype strategy.
   */
  constructor(config: TConfig) {
    this.config = config;
  }

  public async collect(population: Population<TGenome>, cache: PhenotypeCacheInterface): Promise<GenerationPhenotypeMatrix> {
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
   * Executes the tasks to calculate the phenotype of the given genomes.
   *
   * @param inputs The inputs for the tasks to execute.
   * @returns A promise that resolves to an array of phenotype for each genome.
   */
  protected async execTasks(inputs: TTaskConfig[]): Promise<GenerationPhenotypeMatrix> {
    const result: GenerationPhenotypeMatrix = [];
    for (const input of inputs) {
      const taskResult = await this.config.task(input);
      this.config.onTaskResult?.(taskResult, input);
      result.push(taskResult);
    }
    return result;
  }

  /**
   * Creates the task input required for calculating phenotype for
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

  public score(results: GenerationPhenotypeMatrix): GenerationFitnessColumn {
    const normalizedLosses = this.formatLosses(results);
    return normalizedLosses.map((x) => -arraySum(x));
  }

  /**
   * Formats the losses by normalizing the phenotype matrix and applying weights to each row.
   *
   * @param results The generation phenotype matrix to format.
   * @returns A matrix of formatted losses.
   */
  protected formatLosses(results: GenerationPhenotypeMatrix): GenerationPhenotypeMatrix {
    return normalizePhenotypeMatrix(results, this.referenceConfig.reference).map((result) => this.weighRow(result));
  }

  /**
   * Weighs a row of phenotype by multiplying each element with its corresponding weight.
   *
   * @param result The genome phenotype row to weigh.
   * @returns A genome phenotype row with applied weights.
   */
  protected weighRow(result: GenomePhenotypeRow): GenomePhenotypeRow {
    return arrayBinaryOperation(result, this.referenceConfig.weights, (x, y) => x * y);
  }
}

/**
 * Sorts a given iterable of genomes, fitness scores, and phenotype rows in ascending order of their fitness scores.
 *
 * @param input An iterable containing tuples of genomes, their fitness scores, and their associated phenotype rows.
 * @returns An array of sorted tuples of genomes, fitness scores, and phenotype rows.
 */
export class AscendingSortingStrategy<TGenome extends BaseGenome> implements SortStrategyInterface<TGenome> {
  /**
   * Sorts a given iterable of genomes, fitness scores, and phenotype rows in ascending order of their fitness scores.
   *
   * @param input An iterable containing tuples of genomes, their fitness scores, and their associated phenotype rows.
   * @returns An array of sorted tuples of genomes, fitness scores, and phenotype rows.
   */
  sort(input: Array<EvaluatedGenome<TGenome>>): Array<EvaluatedGenome<TGenome>> {
    return [...sort(input, (lhs, rhs) => lhs.fitness - rhs.fitness)];
  }
}

/**
 * Sorts a given iterable of genomes, fitness scores, and phenotype rows in descending order of their fitness scores.
 *
 * @param input An iterable containing tuples of genomes, their fitness scores, and their associated phenotype rows.
 * @returns An array of sorted tuples of genomes, fitness scores, and phenotype rows.
 */
export class DescendingSortingStrategy<TGenome extends BaseGenome> implements SortStrategyInterface<TGenome> {
  /**
   * Sorts a given iterable of genomes, fitness scores, and phenotype rows in descending order of their fitness scores.
   *
   * @param input An iterable containing tuples of genomes, their fitness scores, and their associated phenotype rows.
   * @returns An array of sorted tuples of genomes, fitness scores, and phenotype rows.
   */
  sort(input: Array<EvaluatedGenome<TGenome>>): Array<EvaluatedGenome<TGenome>> {
    return [...sort(input, (lhs, rhs) => rhs.fitness - lhs.fitness)];
  }
}

/**
 * A random selection strategy.
 *
 * This selection strategy randomly selects parents for mutation and crossover.
 *
 * @template TGenome The type of genome objects in the population.
 */
export class RandomSelectionStrategy<TGenome extends BaseGenome> implements SelectionStrategyInterface<TGenome> {
  protected crossoverParentsCount: number;

  /**
   * Constructor of the random selection strategy.
   *
   * @param crossoverParentsCount The number of parents to select for crossover.
   */
  constructor(crossoverParentsCount: number) {
    this.crossoverParentsCount = crossoverParentsCount;
  }

  /**
   * Selects parents for crossover.
   *
   * @param input The population extended with fitness scores and phenotype to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents arrays.
   */
  public selectForCrossover(input: Array<EvaluatedGenome<TGenome>>, count: number): Array<TGenome[]> {
    const result: Array<TGenome[]> = [];

    for (let i = 0; i < count; i++) {
      const parents: TGenome[] = []
      for (let j = 0; j < this.crossoverParentsCount; j++) {
        parents.push(getRandomArrayItem(input).genome);
      }

      result.push(parents);
    }

    return result;
  }

  /**
   * Selects parents for mutation.
   *
   * @param input The population extended with fitness scores and phenotype to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents.
   */
  public selectForMutation(input: Array<EvaluatedGenome<TGenome>>, count: number): TGenome[] {
    const result: TGenome[] = [];
    for (let i = 0; i < count; i++) {
      result.push(getRandomArrayItem(input).genome);
    }
    return result;
  }
}
