/**
 * The origin of a genome, either from crossover, mutation or initial.
 *
 * @category Genome
 * @category Statistics
 */
export type GenomeOrigin = "crossover" | "mutation" | "initial";

/**
 * Represents the statistics of a genome.
 *
 * @category Genome
 * @category Statistics
 */
export type GenomeStats = {
  /**
   * The age of the genome.
   */
  age: number;

  /**
   * The fitness score of the genome.
   */
  fitness: number;

  /**
   * The phenome associated with the genome.
   */
  phenome: PhenomeRow;

  /**
   * The origin of the genome, indicating how it was created.
   */
  origin: GenomeOrigin;

  /**
   * The number of times the genome was created through crossover and mutation.
   */
  originCounters: {
    crossover: number;
    mutation: number;
  };

  /**
   * The IDs of the parents of the genome.
   */
  parentIds: number[];
}

/**
 * The base interface for a genome.
 *
 * A genome is a candidate solution in a genetic search.
 *
 * @category Genome
 * @category Genetic Algorithm Components
 */
export type BaseGenome = {
  /**
   * The unique identifier of the genome.
   */
  id: number;

  /**
   * The statistics of the genome, which is automatically generated
   * when the genome participates in the genetic algorithm.
   */
  stats?: GenomeStats;
}

/**
 * Represents a population of genomes in a genetic algorithm.
 *
 * @template TGenome The specific type of genome within the population.
 *
 * @category Genome
 * @category Genetic Algorithm Components
 */
export type Population<TGenome extends BaseGenome> = TGenome[];

/**
 * Represents a row of phenome associated with a genome.
 *
 * Each number in the array corresponds to a specific metric value
 * calculated for the genome.
 *
 * @category Genome
 * @category Genetic Algorithm Components
 */
export type PhenomeRow = number[];

/**
 * Represents a column of fitness scores for a generation.
 *
 * Each number in the array represents the fitness score of a genome
 * within the generation.
 *
 * @category Genome
 * @category Genetic Algorithm Components
 */
export type GenerationFitnessColumn = number[];

/**
 * Represents a matrix of phenome for a generation of genomes.
 *
 * Each row in the matrix corresponds to a PhenomeRow, storing
 * the phenome for a single genome.
 *
 * @category Genome
 * @category Genetic Algorithm Components
 */
export type GenerationPhenomeMatrix = PhenomeRow[];

/**
 * Represents a genome that has been evaluated.
 *
 * @template TGenome The specific type of genome being evaluated.
 *
 * @category Genome
 * @category Genetic Algorithm Components
 */
export type EvaluatedGenome<TGenome extends BaseGenome> = {
  /**
   * The genome being evaluated.
   */
  genome: TGenome;

  /**
   * The fitness score of the genome.
   */
  fitness: number;

  /**
   * The phenome of the genome.
   */
  phenome: PhenomeRow;
}

/**
 * A callback function that is called before each generation.
 *
 * Used in configuration type {@link GeneticSearchFitConfig}.
 *
 * @param generation The current generation number.
 *
 * @category Genetic Algorithm Components
 * @category Genetic Algorithm Config
 */
export type GenerationBeforeCallback = (generation: number) => void;

/**
 * A callback function that is called after each generation.
 *
 * @param generation The current generation number.
 * @param scores The fitness scores of the current generation.
 *
 * @category Genetic Algorithm Components
 * @category Genetic Algorithm Config
 */
export type GenerationAfterCallback = (generation: number, scores: GenerationFitnessColumn) => void;

/**
 * A function that calculates the phenome for a genome.
 *
 * This function is called for each genome in the population by {@link PhenomeStrategyInterface}.
 *
 * Used in configuration type {@link PhenomeStrategyConfig}.
 *
 * @template TTaskConfig The type of configuration required to execute the task.
 *
 * @param data The configuration required to execute the task.
 *
 * @returns A promise that resolves to the phenome of the genome.
 *
 * @category Genetic Algorithm Components
 * @category Strategies Config
 */
export type CalcPhenomeTask<TTaskConfig> = (data: TTaskConfig) => Promise<PhenomeRow>;

/**
 * The main configuration for {@link GeneticSearch}.
 *
 * @category Genetic Algorithm Config
 */
export interface GeneticSearchConfig {
  /**
   * The size of the population of genomes.
   */
  populationSize: number;

  /**
   * The size of the initial population of genomes.
   */
  startPopulationSize?: number;

  /**
   * The rate of survival for the genomes in the population.
   */
  survivalRate: number;

  /**
   * The rate of crossover for the difference between the total population and the survivors.
   */
  crossoverRate: number;
}

/**
 * The configuration for running a genetic search algorithm.
 *
 * Used in {@link GeneticSearchInterface}.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Genetic Algorithm Config
 */
export type GeneticSearchFitConfig<TGenome extends BaseGenome> = {
  /**
   * The number of generations to run the algorithm for.
   *
   * Defaults to Infinity.
   */
  generationsCount?: number;

  /**
   * A callback function that is called before each generation.
   *
   * @param generation The current generation number.
   */
  beforeStep?: GenerationBeforeCallback;

  /**
   * A callback function that is called after each generation.
   *
   * @param generation The current generation number.
   * @param scores The fitness scores of the current generation.
   */
  afterStep?: GenerationAfterCallback;

  /**
   * A callback function that is called after each generation and can cause the algorithm to stop.
   *
   * @param scores The fitness scores of the current generation.
   * @returns Whether to stop the algorithm.
   */
  stopCondition?: (scores: GenerationFitnessColumn) => boolean;

  /**
   * The scheduler to use to schedule the algorithm.
   */
  scheduler?: SchedulerInterface<TGenome>;
}

/**
 * The main configuration for {@link ComposedGeneticSearch}.
 *
 * The algorithm is configured by providing a separate configuration for
 * the eliminators and the final population.
 *
 * @category Genetic Algorithm Config
 */
export type ComposedGeneticSearchConfig = {
  /**
   * The configuration for the eliminator genetic algorithms.
   *
   * The eliminators are separate genetic algorithms that run in parallel, each with their own population
   * and independent selection process.
   *
   * The winners of each are added to the population of the final population.
   */
  eliminators: GeneticSearchConfig;

  /**
   * The configuration for the final genetic algorithm.
   *
   * The final population is used as the final result of the algorithm.
   */
  final: GeneticSearchConfig;
}

/**
 * The configuration for a {@link BaseMutationStrategy} that mutates a genome with a certain probability.
 *
 * @category Strategies Config
 */
export type BaseMutationStrategyConfig = {
  /**
   * The probability of a genome being mutated.
   *
   * Defaults to 1.
   */
  probability: number;
}

/**
 * The configuration for a {@link BasePhenomeStrategy}.
 *
 * A phenome strategy is a component of a genetic search algorithm that
 * calculates the phenome of a population of genomes.
 *
 * @template TTaskConfig The type of configuration required to execute the task.
 *
 * @category Strategies Config
 */
export type PhenomeStrategyConfig<TTaskConfig> = {
  /**
   * The function to call to calculate the phenome for a genome.
   *
   * This function is called for each genome in the population.
   */
  task: CalcPhenomeTask<TTaskConfig>;

  /**
   * A callback function that is called after the phenome for a genome has been calculated.
   *
   * @param result The phenome of the genome.
   * @param input The configuration required to execute the task.
   */
  onTaskResult?: (result: PhenomeRow, input: TTaskConfig) => void;
}

/**
 * The configuration for {@link GeneticSearch} and {@link ComposedGeneticSearch} strategies.
 *
 * This configuration is used to define the behavior of a genetic search algorithm.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Genetic Algorithm Config
 */
export type GeneticSearchStrategyConfig<TGenome extends BaseGenome> = {
  /**
   * The strategy to generate the initial population.
   */
  populate: PopulateStrategyInterface<TGenome>;

  /**
   * The strategy to calculate the phenome of the population.
   */
  phenome: PhenomeStrategyInterface<TGenome>;

  /**
   * The strategy to calculate the fitness of the population.
   */
  fitness: FitnessStrategyInterface;

  /**
   * The strategy to mutate a genome.
   */
  mutation: MutationStrategyInterface<TGenome>;

  /**
   * The strategy to cross over two genomes.
   */
  crossover: CrossoverStrategyInterface<TGenome>;

  /**
   * The strategy to sort the population.
   */
  sorting: SortStrategyInterface<TGenome>;

  /**
   * The strategy to select genomes for crossover and mutation.
   */
  selection: SelectionStrategyInterface<TGenome>;

  /**
   * The cache to store the phenome of the population.
   */
  cache: PhenomeCacheInterface;
}

/**
 * The configuration for a {@link ReferenceLossFitnessStrategy}.
 *
 * This configuration is used to define the reference row and the weights for a reference loss fitness strategy.
 *
 * @category Strategies Config
 */
export type GeneticSearchReferenceConfig = {
  /**
   * The reference row of phenome used to calculate the fitness of the population.
   */
  readonly reference: PhenomeRow;

  /**
   * The weights used to calculate the fitness of the population.
   */
  readonly weights: PhenomeRow;
}

/**
 * A summary of the statistics of a population of genomes.
 *
 * This object contains the count of genomes in the population,
 * the best and second best values, the mean, median, and worst values.
 *
 * @category Statistics
 */
export type StatSummary = {
  /**
   * The count of genomes in the population.
   */
  readonly count: number;

  /**
   * The best value in the population.
   */
  readonly best: number;

  /**
   * The second best value in the population.
   */
  readonly second: number;

  /**
   * The mean value in the population.
   */
  readonly mean: number;

  /**
   * The median value in the population.
   */
  readonly median: number;

  /**
   * The worst value in the population.
   */
  readonly worst: number;
}

/**
 * Represents a summary of range statistics.
 *
 * This type captures the minimum, mean, and maximum values
 * for a set of numerical data.
 *
 * @category Statistics
 */
export type RangeStatSummary = {
  /**
   * The minimum value in the dataset.
   */
  readonly min: number;

  /**
   * The mean (average) value in the dataset.
   */
  readonly mean: number;

  /**
   * The maximum value in the dataset.
   */
  readonly max: number;
}

/**
 * A summary of the statistics of a population of genomes, grouped by origin.
 *
 * This object contains the count of genomes in the population,
 * the best and second best values, the mean, median, and worst values.
 * It is grouped by origin into three categories: initial, crossover, and mutation.
 *
 * @category Statistics
 */
export type GroupedStatSummary = {
  /**
   * The summary of the initial population.
   */
  readonly initial: StatSummary;

  /**
   * The summary of the crossover population.
   */
  readonly crossover: StatSummary;

  /**
   * The summary of the mutation population.
   */
  readonly mutation: StatSummary;
}

/**
 * A summary of the statistics for a population of genomes.
 *
 * @category Statistics
 */
export type PopulationSummary = {
  /**
   * A summary of fitness statistics for the population.
   */
  readonly fitnessSummary: StatSummary;

  /**
   * A grouped summary of fitness statistics based on genome origin.
   */
  readonly groupedFitnessSummary: GroupedStatSummary;

  /**
   * A summary of age statistics for the population.
   */
  readonly ageSummary: RangeStatSummary;

  /**
   * The counter indicating the number of generations without significant improvement (bestGenome not changing).
   */
  readonly stagnationCounter: number;
}

/**
 * The input for a {@link SchedulerAction}.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration object of macro parameters,
 * which the scheduler will be able to manipulate.
 *
 * @category Scheduler
 */
export type SchedulerActionInput<TGenome extends BaseGenome, TConfig> = {
  /**
   * The genetic search algorithm.
   */
  runner: GeneticSearchInterface<TGenome>;

  /**
   * The current sorted population with stats.
   */
  evaluatedPopulation: EvaluatedGenome<TGenome>[];

  /**
   * The manager for the evaluated population.
   */
  evaluatedPopulationManager: EvaluatedPopulationManagerInterface<TGenome>;

  /**
   * The history of population summaries.
   */
  history: PopulationSummary[];

  /**
   * The configuration for the genetic search algorithm.
   */
  config: TConfig;

  /**
   * The logger function.
   *
   * @param message The message to log.
   */
  logger: (message: string) => void;
}

/**
 * A single action to be executed by the {@link Scheduler}.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration object of macro parameters,
 * which the scheduler will be able to manipulate.
 *
 * @param input The input data for the action.
 *
 * @category Scheduler
 */
export type SchedulerAction<TGenome extends BaseGenome, TConfig> = (input: SchedulerActionInput<TGenome, TConfig>) => void;

/**
 * The configuration for the {@link Scheduler}.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration object of macro parameters,
 * which the scheduler will be able to manipulate.
 *
 * @category Scheduler
 */
export type SchedulerConfig<TGenome extends BaseGenome, TConfig> = {
  /**
   * The runner for the genetic search algorithm.
   */
  runner: GeneticSearchInterface<TGenome>;

  /**
   * The configuration object of macro parameters, which the scheduler will be able to manipulate.
   */
  config: TConfig;

  /**
   * The actions for the scheduler.
   */
  actions: SchedulerAction<TGenome, TConfig>[];

  /**
   * The maximum length of the generations history summaries array.
   */
  maxHistoryLength: number;
}

/**
 * An interface for a population generator.
 *
 * Used in {@link GeneticSearchStrategyConfig}.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Strategies
 * @category Populate
 */
export interface PopulateStrategyInterface<TGenome extends BaseGenome> {
  /**
   * Generate a population of the given size.
   *
   * @param size The size of the population to generate.
   * @param idGenerator The ID generator to use for generating IDs of the genomes.
   */
  populate(size: number, idGenerator: IdGeneratorInterface<TGenome>): Population<TGenome>;
}

/**
 * An interface for a mutation strategy.
 *
 * Used in {@link GeneticSearchStrategyConfig}.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Strategies
 * @category Mutation
 */
export interface MutationStrategyInterface<TGenome extends BaseGenome> {
  /**
   * Mutate a genome.
   *
   * @param genome The genome to mutate.
   * @param newGenomeId The ID to assign to the new genome.
   */
  mutate(genome: TGenome, newGenomeId: number): TGenome;
}

/**
 * An interface for a crossover strategy.
 *
 * Used in {@link GeneticSearchStrategyConfig}.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Strategies
 * @category Crossover
 */
export interface CrossoverStrategyInterface<TGenome extends BaseGenome> {
  /**
   * Cross two genomes.
   *
   * @param parents The parents to cross.
   * @param newGenomeId The ID to assign to the new genome.
   */
  cross(parents: TGenome[], newGenomeId: number): TGenome;
}

/**
 * An interface for a phenome strategy.
 *
 * Used in {@link GeneticSearchStrategyConfig}.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Strategies
 * @category Phenome
 */
export interface PhenomeStrategyInterface<TGenome extends BaseGenome> {
  /**
   * Collect phenome for a population.
   *
   * @param population The population to collect phenome for.
   * @param cache The cache to use for storing the phenome.
   */
  collect(population: Population<TGenome>, cache: PhenomeCacheInterface): Promise<GenerationPhenomeMatrix>;
}

/**
 * An interface for a fitness strategy.
 *
 * Used in {@link GeneticSearchStrategyConfig}.
 *
 * @category Strategies
 * @category Fitness
 */
export interface FitnessStrategyInterface {
  /**
   * Score a population.
   *
   * @param results The results of the phenome collection.
   */
  score(results: GenerationPhenomeMatrix): Promise<GenerationFitnessColumn>;
}

/**
 * An interface for a sorting strategy.
 *
 * Used in {@link GeneticSearchStrategyConfig}.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Strategies
 * @category Sorting
 */
export interface SortStrategyInterface<TGenome extends BaseGenome> {
  /**
   * Sorts a given iterable of genomes, fitness scores, and phenome rows.
   *
   * @param input The array of genomes extended with fitness scores and phenome.
   * @returns An array of sorted tuples of genomes, fitness scores, and phenome rows.
   */
  sort(input: Array<EvaluatedGenome<TGenome>>): Array<EvaluatedGenome<TGenome>>;
}

/**
 * An interface for selection strategy.
 *
 * Used in {@link GeneticSearchStrategyConfig}.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Strategies
 * @category Selection
 */
export interface SelectionStrategyInterface<TGenome extends BaseGenome> {
  /**
   * Selects parents pairs for crossover.
   *
   * @param input The population extended with fitness scores and phenome to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parent pairs.
   */
  selectForCrossover(input: Array<EvaluatedGenome<TGenome>>, count: number): Array<TGenome[]>;

  /**
   * Selects parents for mutation.
   *
   * @param input The population extended with fitness scores and phenome to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents.
   */
  selectForMutation(input: Array<EvaluatedGenome<TGenome>>, count: number): TGenome[];
}

/**
 * A genetic search algorithm interface.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Genetic Algorithm
 */
export interface GeneticSearchInterface<TGenome extends BaseGenome> {
  /**
   * Current best genome in the population.
   */
  readonly bestGenome: TGenome;

  /**
   * Partition sizes of the population.
   *
   * The first element is the size of the elite population, the second element is the size of the
   * crossover population, and the third element is the size of the mutation population.
   */
  readonly partitions: [number, number, number];

  /**
   * Phenome cache.
   */
  readonly cache: PhenomeCacheInterface;

  /**
   * Current generation number.
   */
  readonly generation: number;

  /**
   * Current population.
   */
  population: Population<TGenome>;

  /**
   * Sets the current population.
   *
   * @param population new population.
   * @param resetIdGenerator Whether to reset the ID generator.
   */
  setPopulation(population: Population<TGenome>, resetIdGenerator: boolean): void;

  /**
   * Refreshes the population.
   */
  refreshPopulation(): void;

  /**
   * Gets the population summary.
   *
   * @param roundPrecision The precision to round the summary to.
   * @returns The population summary.
   */
  getPopulationSummary(roundPrecision?: number): PopulationSummary;

  /**
   * Runs a single step of the genetic search algorithm.
   *
   * You need to call `clearCache()` after calling this method.
   *
   * @param scheduler The scheduler.
   * @returns The fitness of the best genome in the population.
   */
  fitStep(scheduler?: SchedulerInterface<TGenome>): Promise<GenerationFitnessColumn>;

  /**
   * Clears the cache.
   */
  clearCache(): void;

  /**
   * Runs the genetic search algorithm.
   *
   * @param config The configuration.
   */
  fit(config: GeneticSearchFitConfig<TGenome>): Promise<void>;
}

/**
 * Interface for generating unique identifiers for genomes.
 *
 * @template TGenome The type of genome objects.
 *
 * @category Utils
 */
export interface IdGeneratorInterface<TGenome extends BaseGenome> {
  /**
   * Generates the next unique identifier.
   *
   * @returns The next unique identifier as a number.
   */
  nextId(): number;

  /**
   * Resets the ID generator based on the provided population.
   *
   * @param population The population of genomes to reset the ID generator with.
   */
  reset(population: TGenome[]): void;
}

/**
 * Interface for a cache of phenome associated with genomes.
 *
 * This cache is used by the genetic search algorithm to store and retrieve
 * the phenome of genomes.
 *
 * Used in {@link GeneticSearchStrategyConfig}.
 *
 * @remarks
 * The cache is used to store the phenome of genomes, which are used to calculate
 * the fitness of the population.
 *
 * @category Cache
 * @category Strategies
 */
export interface PhenomeCacheInterface {
  /**
   * Gets the phenome of a genome, or undefined if the genome is not ready.
   *
   * @param genomeId The ID of the genome.
   * @returns The phenome of the genome, or undefined if the genome is not ready.
   */
  getReady(genomeId: number): PhenomeRow | undefined;

  /**
   * Gets the phenome of a genome.
   *
   * @param genomeId The ID of the genome.
   * @param defaultValue The default value to return if the genome is not found.
   * @returns The phenome of the genome, or the default value if the genome phenome is not found.
   */
  get(genomeId: number, defaultValue?: PhenomeRow): PhenomeRow | undefined;

  /**
   * Sets the phenome of a genome.
   *
   * @param genomeId The ID of the genome.
   * @param phenome The phenome of the genome.
   */
  set(genomeId: number, phenome: PhenomeRow): void;

  /**
   * Clears the cache, excluding the specified genome IDs.
   *
   * @param excludeGenomeIds The IDs of the genomes to exclude from the clear operation.
   */
  clear(excludeGenomeIds: number[]): void;

  /**
   * Exports the cache as a record of genome IDs to phenome.
   *
   * @returns The cache as a record of genome IDs to phenome.
   */
  export(): Record<number, unknown>;

  /**
   * Imports the cache from a record of genome IDs to phenome.
   *
   * @param data The cache as a record of genome IDs to phenome.
   */
  import(data: Record<number, unknown>): void;
}

/**
 * An interface for a genome stats manager.
 *
 * A genome stats manager is used to manage the statistics of a population of genomes.
 *
 * @category Statistics
 */
export interface GenomeStatsManagerInterface<TGenome extends BaseGenome> {
  /**
   * Initializes the genome stats manager with the given population and origin.
   *
   * @param population The population to initialize the manager with.
   * @param origin The origin of the population.
   */
  init(population: Population<TGenome>, origin: GenomeOrigin): void;

  /**
   * Initializes the statistics of a genome.
   *
   * @param genome The genome to initialize.
   * @param origin The origin of the genome.
   * @param parents The parents of the genome.
   * @returns The initialized genome statistics.
   */
  initItem(genome: BaseGenome, origin: GenomeOrigin, parents?: BaseGenome[]): GenomeStats

  /**
   * Updates the genome stats manager with the given population, phenome matrix, and fitness column.
   *
   * @param population The population to update the manager with.
   * @param phenomeMatrix The phenome matrix of the population.
   * @param fitnessColumn The fitness column of the population.
   */
  update(
    population: Population<TGenome>,
    phenomeMatrix: GenerationPhenomeMatrix,
    fitnessColumn: GenerationFitnessColumn,
  ): void;
}

/**
 * Interface for managing population summaries in a genetic algorithm.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Statistics
 */
export interface PopulationSummaryManagerInterface<TGenome extends BaseGenome> {
  /**
   * Retrieves the current population summary.
   *
   * @returns The population summary.
   */
  get(): PopulationSummary;

  /**
   * Retrieves the population summary with rounded statistics.
   *
   * @param precision The number of decimal places to round to.
   * @returns The rounded population summary.
   */
  getRounded(precision: number): PopulationSummary;

  /**
   * Updates the population summary based on the provided sorted population.
   *
   * @param sortedPopulation The population sorted by fitness score.
   */
  update(sortedPopulation: Population<TGenome>): void;
}

/**
 * Interface for a scheduler.
 *
 * This interface defines the structure and behavior of a scheduler,
 * which is responsible for executing scheduled tasks or operations.
 *
 * @category Scheduler
 */
export interface SchedulerInterface<TGenome extends BaseGenome> {
  /**
   * An array of log messages generated by the scheduler.
   */
  readonly logs: string[];

  /**
   * Executes a single step or iteration in the scheduler.
   */
  step(evaluatedPopulation: EvaluatedGenome<TGenome>[]): void;
}

/**
 * Interface for managing arrays.
 *
 * @template T The type of objects in the array.
 */
export interface ArrayManagerInterface<T> {
  /**
   * Updates objects in the array based on a filter condition.
   *
   * @param filter - A function to determine which objects to update.
   * @param update - A function to apply to each object that matches the filter.
   *
   * @returns The updated items.
   */
  update(filter: (genome: T) => boolean, update: (genome: T) => void): T[];

  /**
   * Removes objects from the array based on a filter condition, with optional sorting and count limit.
   *
   * @param filter - A function to determine which objects to remove.
   * @param maxCount - An optional maximum number of objects to remove.
   * @param order - An optional sorting order ('asc' or 'desc').
   *
   * @returns The removed items.
   */
  remove(filter: (genome: T) => boolean, maxCount?: number, order?: 'asc' | 'desc'): T[];
}

/**
 * Interface for managing evaluated populations.
 */
export interface EvaluatedPopulationManagerInterface<TGenome extends BaseGenome> extends ArrayManagerInterface<EvaluatedGenome<TGenome>> {}
