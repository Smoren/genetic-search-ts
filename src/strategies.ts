import type {
  BaseGenome,
  Population,
  BaseMutationStrategyConfig,
  MutationStrategyInterface,
  PhenomeStrategyInterface,
  FitnessStrategyInterface,
  GeneticSearchReferenceConfig,
  PhenomeStrategyConfig,
  GenerationPhenomeMatrix,
  PhenomeRow,
  GenerationFitnessColumn,
  PhenomeCacheInterface,
  SortStrategyInterface,
  SelectionStrategyInterface,
  EvaluatedGenome,
} from "./types";
import { normalizePhenomeMatrix, arrayBinaryOperation, arraySum, getRandomArrayItem } from "./utils";
import {sort, zip} from "./itertools";

/**
 * Base class for mutation strategies.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration for the mutation strategy.
 *
 * @category Strategies
 * @category Mutation
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
 * Base class for phenome strategies.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration for the phenome strategy.
 * @template TTaskConfig The type of configuration required to execute the task of the calculating phenome.
 *
 * @category Strategies
 * @category Phenome
 */
export abstract class BasePhenomeStrategy<
  TGenome extends BaseGenome,
  TConfig extends PhenomeStrategyConfig<TTaskConfig>,
  TTaskConfig,
> implements PhenomeStrategyInterface<TGenome> {
  /**
   * The configuration for the phenome strategy.
   */
  protected readonly config: TConfig;

  /**
   * Constructs a new instance of the phenome strategy.
   *
   * @param config The configuration for the phenome strategy.
   */
  constructor(config: TConfig) {
    this.config = config;
  }

  /**
   * Collects and caches the phenome for a given population of genomes.
   *
   * @param population The population of genomes to collect phenome for.
   * @param cache The cache used to store and retrieve phenomes.
   * @returns A promise that resolves to a matrix of phenomes for the generation.
   */
  public async collect(population: Population<TGenome>, cache: PhenomeCacheInterface): Promise<GenerationPhenomeMatrix> {
    const pairs = population.map((genome) => [genome.id, cache.getReady(genome.id)] as [number, PhenomeRow]);
    const resultsMap: Map<number, PhenomeRow> = new Map(pairs);

    const genomesToRun = population.filter((genome) => resultsMap.get(genome.id) === undefined);
    const newResults = await this.execTasks(genomesToRun.map((genome) => this.createTaskInput(genome)));

    for (const [genome, result] of zip(genomesToRun, newResults)) {
      cache.set((genome as TGenome).id, result);
    }

    for (const [genome, result] of zip(genomesToRun, newResults)) {
      resultsMap.set((genome as TGenome).id, cache.get((genome as TGenome).id, result) as PhenomeRow);
    }

    return population.map((genome) => resultsMap.get(genome.id)!);
  }

  /**
   * Executes the tasks to calculate the phenome of the given genomes.
   *
   * @param inputs The inputs for the tasks to execute.
   * @returns A promise that resolves to an array of phenome for each genome.
   */
  protected async execTasks(inputs: TTaskConfig[]): Promise<GenerationPhenomeMatrix> {
    const result: GenerationPhenomeMatrix = [];
    for (const input of inputs) {
      const taskResult = await this.config.task(input);
      this.config.onTaskResult?.(taskResult, input);
      result.push(taskResult);
    }
    return result;
  }

  /**
   * Creates the task input required for calculating phenome for
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
 *
 * @category Strategies
 * @category Fitness
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

  public score(results: GenerationPhenomeMatrix): GenerationFitnessColumn {
    const normalizedLosses = this.formatLosses(results);
    return normalizedLosses.map((x) => -arraySum(x));
  }

  /**
   * Formats the losses by normalizing the phenome matrix and applying weights to each row.
   *
   * @param results The generation phenome matrix to format.
   * @returns A matrix of formatted losses.
   */
  protected formatLosses(results: GenerationPhenomeMatrix): GenerationPhenomeMatrix {
    return normalizePhenomeMatrix(results, this.referenceConfig.reference).map((result) => this.weighRow(result));
  }

  /**
   * Weighs a row of phenome by multiplying each element with its corresponding weight.
   *
   * @param result The genome phenome row to weigh.
   * @returns A genome phenome row with applied weights.
   */
  protected weighRow(result: PhenomeRow): PhenomeRow {
    return arrayBinaryOperation(result, this.referenceConfig.weights, (x, y) => x * y);
  }
}

/**
 * Sorts a given iterable of genomes, fitness scores, and phenome rows in ascending order of their fitness scores.
 *
 * @param input An iterable containing tuples of genomes, their fitness scores, and their associated phenome rows.
 * @returns An array of sorted tuples of genomes, fitness scores, and phenome rows.
 *
 * @category Strategies
 * @category Sorting
 */
export class AscendingSortingStrategy<TGenome extends BaseGenome> implements SortStrategyInterface<TGenome> {
  /**
   * Sorts a given iterable of genomes, fitness scores, and phenome rows in ascending order of their fitness scores.
   *
   * @param input An iterable containing tuples of genomes, their fitness scores, and their associated phenome rows.
   * @returns An array of sorted tuples of genomes, fitness scores, and phenome rows.
   */
  sort(input: Array<EvaluatedGenome<TGenome>>): Array<EvaluatedGenome<TGenome>> {
    return [...sort(input, (lhs, rhs) => lhs.fitness - rhs.fitness)];
  }
}

/**
 * Sorts a given iterable of genomes, fitness scores, and phenome rows in descending order of their fitness scores.
 *
 * @param input An iterable containing tuples of genomes, their fitness scores, and their associated phenome rows.
 * @returns An array of sorted tuples of genomes, fitness scores, and phenome rows.
 *
 * @category Strategies
 * @category Sorting
 */
export class DescendingSortingStrategy<TGenome extends BaseGenome> implements SortStrategyInterface<TGenome> {
  /**
   * Sorts a given iterable of genomes, fitness scores, and phenome rows in descending order of their fitness scores.
   *
   * @param input An iterable containing tuples of genomes, their fitness scores, and their associated phenome rows.
   * @returns An array of sorted tuples of genomes, fitness scores, and phenome rows.
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
 *
 * @category Strategies
 * @category Selection
 */
export class RandomSelectionStrategy<TGenome extends BaseGenome> implements SelectionStrategyInterface<TGenome> {
  protected readonly crossoverParentsCount: number;

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
   * @param input The population extended with fitness scores and phenome to select parents from.
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
   * @param input The population extended with fitness scores and phenome to select parents from.
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

/**
 * A truncation selection strategy.
 *
 * This selection strategy selects the top `sliceThresholdRate` fraction of the population
 * as parents for mutation and crossover.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Strategies
 * @category Selection
 */
export class TruncationSelectionStrategy<TGenome extends BaseGenome> extends RandomSelectionStrategy<TGenome> {
  protected readonly sliceThresholdRate: number;

  /**
   * Constructor of the truncation selection strategy.
   *
   * @param crossoverParentsCount The number of parents to select for crossover.
   * @param sliceThresholdRate The rate at which to slice the population.
   */
  constructor(crossoverParentsCount: number, sliceThresholdRate: number) {
    super(crossoverParentsCount);
    this.sliceThresholdRate = sliceThresholdRate;
  }

  /**
   * Selects parents for crossover.
   *
   * @param input The population extended with fitness scores and phenome to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents arrays.
   */
  public selectForCrossover(input: Array<EvaluatedGenome<TGenome>>, count: number): Array<TGenome[]> {
    if (this.sliceThresholdRate) {
      input = input.slice(0, input.length * this.sliceThresholdRate);
    }
    return super.selectForCrossover(input, count);
  }

  /**
   * Selects parents for mutation.
   *
   * @param input The population extended with fitness scores and phenome to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents.
   */
  public selectForMutation(input: Array<EvaluatedGenome<TGenome>>, count: number): TGenome[] {
    if (this.sliceThresholdRate) {
      input = input.slice(0, input.length * this.sliceThresholdRate);
    }
    return super.selectForMutation(input, count);
  }
}

/**
 * A selection strategy that uses a tournament to select parents.
 *
 * This selection strategy runs a tournament between random participants from the population,
 * and selects the best participant as a parent.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Strategies
 * @category Selection
 */
export class TournamentSelectionStrategy<TGenome extends BaseGenome> implements SelectionStrategyInterface<TGenome> {
  protected readonly crossoverParentsCount: number;
  protected readonly tournamentSize: number;

  /**
   * Constructor of the tournament selection strategy.
   *
   * @param crossoverParentsCount The number of parents to select for crossover.
   * @param tournamentSize The number of participants in a tournament.
   */
  constructor(crossoverParentsCount: number, tournamentSize: number) {
    this.crossoverParentsCount = crossoverParentsCount;
    this.tournamentSize = tournamentSize;
  }

  /**
   * Selects parents for crossover.
   *
   * @param input The population extended with fitness scores and phenome to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents arrays.
   */
  public selectForCrossover(input: Array<EvaluatedGenome<TGenome>>, count: number): Array<TGenome[]> {
    const result: Array<TGenome[]> = [];

    for (let i = 0; i < count; i++) {
      const parents: TGenome[] = [];
      for (let j = 0; j < this.crossoverParentsCount; j++) {
        // Select the best from the tournament
        parents.push(this.runTournament(input).genome);
      }
      result.push(parents);
    }

    return result;
  }

  /**
   * Selects parents for mutation.
   *
   * @param input The population extended with fitness scores and phenome to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents.
   */
  public selectForMutation(input: Array<EvaluatedGenome<TGenome>>, count: number): TGenome[] {
    const result: TGenome[] = [];
    for (let i = 0; i < count; i++) {
      // Select the best from the tournament
      result.push(this.runTournament(input).genome);
    }
    return result;
  }

  /**
   * Conducts a tournament and returns the best participant.
   *
   * @param input The population.
   * @returns The best `EvaluatedGenome` from the tournament.
   */
  private runTournament(input: Array<EvaluatedGenome<TGenome>>): EvaluatedGenome<TGenome> {
    // Select random participants
    const tournamentParticipants: EvaluatedGenome<TGenome>[] = [];
    for (let k = 0; k < this.tournamentSize; k++) {
      tournamentParticipants.push(getRandomArrayItem(input));
    }

    // Sort participants and select the best
    tournamentParticipants.sort((lhs, rhs) => rhs.fitness - lhs.fitness);
    return tournamentParticipants[0]; // Best participant
  }
}

/**
 * A proportional selection strategy.
 *
 * This selection strategy selects parents for mutation and crossover based on their fitness proportion.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Strategies
 * @category Selection
 */
export class ProportionalSelectionStrategy<TGenome extends BaseGenome> implements SelectionStrategyInterface<TGenome> {
  protected crossoverParentsCount: number;

  /**
   * Constructor of the proportional selection strategy.
   *
   * @param crossoverParentsCount The number of parents to select for crossover.
   */
  constructor(crossoverParentsCount: number) {
    this.crossoverParentsCount = crossoverParentsCount;
  }

  /**
   * Selects parents for crossover using proportional selection.
   *
   * @param input The population extended with fitness scores and phenome to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents arrays.
   */
  public selectForCrossover(input: Array<EvaluatedGenome<TGenome>>, count: number): Array<TGenome[]> {
    const result: Array<TGenome[]> = [];

    // Calculate total fitness of the population
    const totalFitness = input.reduce((acc, evaluatedGenome) => acc + evaluatedGenome.fitness, 0);

    for (let i = 0; i < count; i++) {
      const parents: TGenome[] = [];
      for (let j = 0; j < this.crossoverParentsCount; j++) {
        // Roulette wheel selection based on fitness proportion
        const selectedGenome = this.selectByFitness(input, totalFitness);
        parents.push(selectedGenome.genome);
      }
      result.push(parents);
    }

    return result;
  }

  /**
   * Selects parents for mutation using proportional selection.
   *
   * @param input The population extended with fitness scores and phenome to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents.
   */
  public selectForMutation(input: Array<EvaluatedGenome<TGenome>>, count: number): TGenome[] {
    const result: TGenome[] = [];

    // Calculate total fitness of the population
    const totalFitness = input.reduce((acc, evaluatedGenome) => acc + evaluatedGenome.fitness, 0);

    for (let i = 0; i < count; i++) {
      // Roulette wheel selection based on fitness proportion
      const selectedGenome = this.selectByFitness(input, totalFitness);
      result.push(selectedGenome.genome);
    }

    return result;
  }

  /**
   * Helper method to select an individual based on fitness proportion.
   *
   * @param input The population.
   * @param totalFitness The sum of all fitness scores in the population.
   * @returns A selected `EvaluatedGenome`.
   */
  private selectByFitness(input: Array<EvaluatedGenome<TGenome>>, totalFitness: number): EvaluatedGenome<TGenome> {
    let randomValue = Math.random() * totalFitness;
    let result: EvaluatedGenome<TGenome> = input[input.length - 1]; // Fallback value in case of floating-point imprecisions
    for (const evaluatedGenome of input) {
      randomValue -= evaluatedGenome.fitness;
      if (randomValue <= 0) {
        result = evaluatedGenome;
        break;
      }
    }
    return result;
  }
}
