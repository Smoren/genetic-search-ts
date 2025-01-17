/**
 * The origin of a genome, either from crossover, mutation or initial.
 */
export type GenomeOrigin = "crossover" | "mutation" | "initial";

/**
 * Represents the statistics of a genome.
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
   * The phenotype associated with the genome.
   */
  phenotype: GenomePhenotypeRow;

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
 */
export type Population<TGenome extends BaseGenome> = TGenome[];

/**
 * Represents a row of phenotype associated with a genome.
 *
 * Each number in the array corresponds to a specific metric value
 * calculated for the genome.
 */
export type GenomePhenotypeRow = number[];

/**
 * Represents a column of fitness scores for a generation.
 *
 * Each number in the array represents the fitness score of a genome
 * within the generation.
 */
export type GenerationFitnessColumn = number[];

/**
 * Represents a matrix of phenotype for a generation of genomes.
 *
 * Each row in the matrix corresponds to a GenomePhenotypeRow, storing
 * the phenotype for a single genome.
 */
export type GenerationPhenotypeMatrix = GenomePhenotypeRow[];

/**
 * Represents a genome that has been evaluated.
 *
 * @template TGenome The specific type of genome being evaluated.
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
   * The phenotype of the genome.
   */
  phenotype: GenomePhenotypeRow;
}
/**
 * A callback function that is called before each generation.
 *
 * @param generation The current generation number.
 */
export type GenerationBeforeCallback = (generation: number) => void;

/**
 * A callback function that is called after each generation.
 *
 * @param generation The current generation number.
 * @param scores The fitness scores of the current generation.
 */
export type GenerationAfterCallback = (generation: number, scores: GenerationFitnessColumn) => void;

/**
 * A function that calculates the phenotype for a genome.
 *
 * This function is called for each genome in the population by PhenotypeStrategy.
 *
 * @template TTaskConfig The type of configuration required to execute the task.
 *
 * @param data The configuration required to execute the task.
 *
 * @returns A promise that resolves to the phenotype of the genome.
 */
export type CalcPhenotypeTask<TTaskConfig> = (data: TTaskConfig) => Promise<GenomePhenotypeRow>;

/**
 * The configuration for a genetic search algorithm.
 */
export interface GeneticSearchConfig {
  /**
   * The size of the population of genomes.
   */
  populationSize: number;

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
 */
export type GeneticSearchFitConfig = {
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
  scheduler?: SchedulerInterface;
}

/**
 * The configuration for a composed genetic search algorithm.
 *
 * The algorithm is configured by providing a separate configuration for
 * the eliminators and the final population.
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
 * The configuration for a mutation strategy that mutates a genome with a certain probability.
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
 * The configuration for a phenotype strategy.
 *
 * A phenotype strategy is a component of a genetic search algorithm that
 * calculates the phenotype of a population of genomes.
 *
 * @template TTaskConfig The type of configuration required to execute the task.
 */
export type PhenotypeStrategyConfig<TTaskConfig> = {
  /**
   * The function to call to calculate the phenotype for a genome.
   *
   * This function is called for each genome in the population.
   */
  task: CalcPhenotypeTask<TTaskConfig>;

  /**
   * A callback function that is called after the phenotype for a genome has been calculated.
   *
   * @param result The phenotype of the genome.
   * @param input The configuration required to execute the task.
   */
  onTaskResult?: (result: GenomePhenotypeRow, input: TTaskConfig) => void;
}

/**
 * The configuration for a genetic search strategy.
 *
 * This configuration is used to define the behavior of a genetic search algorithm.
 *
 * @template TGenome The type of genome objects in the population.
 */
export type GeneticSearchStrategyConfig<TGenome extends BaseGenome> = {
  /**
   * The strategy to generate the initial population.
   */
  populate: PopulateStrategyInterface<TGenome>;

  /**
   * The strategy to calculate the phenotype of the population.
   */
  phenotype: PhenotypeStrategyInterface<TGenome>;

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
   * The cache to store the phenotype of the population.
   */
  cache: PhenotypeCacheInterface;
}

/**
 * The configuration for a reference loss fitness strategy.
 *
 * This configuration is used to define the reference row and the weights for a reference loss fitness strategy.
 */
export type GeneticSearchReferenceConfig = {
  /**
   * The reference row of phenotype used to calculate the fitness of the population.
   */
  readonly reference: GenomePhenotypeRow;

  /**
   * The weights used to calculate the fitness of the population.
   */
  readonly weights: GenomePhenotypeRow;
}

/**
 * A summary of the statistics of a population of genomes.
 *
 * This object contains the count of genomes in the population,
 * the best and second best values, the mean, median, and worst values.
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
 * The input data for a scheduler rule.
 *
 * This object is passed to the `condition` and `action` functions of
 * a scheduler rule.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration for the genetic search algorithm.
 */
export type SchedulerRuleInput<TGenome extends BaseGenome, TConfig> = {
  /**
   * The genetic search algorithm.
   */
  runner: GeneticSearchInterface<TGenome>;

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
 * A scheduler rule.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration for the genetic search algorithm.
 */
export type SchedulerRule<TGenome extends BaseGenome, TConfig> = {
  /**
   * The condition function for the rule.
   *
   * This function is called with the input data, and should return a boolean value.
   * If the value is true, the action function is called.
   *
   * @param input The input data for the rule.
   */
  condition: (input: SchedulerRuleInput<TGenome, TConfig>) => boolean;

  /**
   * The action function for the rule.
   *
   * This function is called with the input data, if the condition function returns true.
   *
   * @param input The input data for the rule.
   */
  action: (input: SchedulerRuleInput<TGenome, TConfig>) => void;
}

/**
 * The configuration for the scheduler.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration object of macro parameters,
 * which the scheduler will be able to manipulate.
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
   * The rules for the scheduler.
   */
  rules: SchedulerRule<TGenome, TConfig>[];

  /**
   * The maximum length of the generations history summaries array.
   */
  maxHistoryLength: number;
}

/**
 * An interface for a population generator.
 *
 * @template TGenome The type of genome objects in the population.
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
 * @template TGenome The type of genome objects in the population.
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
 * @template TGenome The type of genome objects in the population.
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
 * An interface for a phenotype strategy.
 *
 * @template TGenome The type of genome objects in the population.
 */
export interface PhenotypeStrategyInterface<TGenome extends BaseGenome> {
  /**
   * Collect phenotype for a population.
   *
   * @param population The population to collect phenotype for.
   * @param cache The cache to use for storing the phenotype.
   */
  collect(population: Population<TGenome>, cache: PhenotypeCacheInterface): Promise<GenerationPhenotypeMatrix>;
}

/**
 * An interface for a fitness strategy.
 */
export interface FitnessStrategyInterface {
  /**
   * Score a population.
   *
   * @param results The results of the phenotype collection.
   */
  score(results: GenerationPhenotypeMatrix): GenerationFitnessColumn;
}

/**
 * An interface for a sort strategy.
 *
 * @template TGenome The type of genome objects in the population.
 */
export interface SortStrategyInterface<TGenome extends BaseGenome> {
  /**
   * Sorts a given iterable of genomes, fitness scores, and phenotype rows.
   *
   * @param input The array of genomes extended with fitness scores and phenotype.
   * @returns An array of sorted tuples of genomes, fitness scores, and phenotype rows.
   */
  sort(input: Array<EvaluatedGenome<TGenome>>): Array<EvaluatedGenome<TGenome>>;
}

/**
 * An interface for selection strategy.
 *
 * @template TGenome The type of genome objects in the population.
 */
export interface SelectionStrategyInterface<TGenome extends BaseGenome> {
  /**
   * Selects parents pairs for crossover.
   *
   * @param input The population extended with fitness scores and phenotype to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parent pairs.
   */
  selectForCrossover(input: Array<EvaluatedGenome<TGenome>>, count: number): Array<TGenome[]>;

  /**
   * Selects parents for mutation.
   *
   * @param input The population extended with fitness scores and phenotype to select parents from.
   * @param count The number of parents to select.
   * @returns An array of parents.
   */
  selectForMutation(input: Array<EvaluatedGenome<TGenome>>, count: number): TGenome[];
}

/**
 * A genetic search algorithm interface.
 *
 * @template TGenome The type of genome objects in the population.
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
   * Phenotype cache.
   */
  readonly cache: PhenotypeCacheInterface;

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
  fitStep(scheduler?: SchedulerInterface): Promise<GenerationFitnessColumn>;

  /**
   * Clears the cache.
   */
  clearCache(): void;

  /**
   * Runs the genetic search algorithm.
   *
   * @param config The configuration.
   */
  fit(config: GeneticSearchFitConfig): Promise<void>;
}

/**
 * Interface for generating unique identifiers for genomes.
 *
 * @template TGenome The type of genome objects.
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
 * Interface for a cache of phenotype associated with genomes.
 *
 * This cache is used by the genetic search algorithm to store and retrieve
 * the phenotype of genomes.
 *
 * @remarks
 * The cache is used to store the phenotype of genomes, which are used to calculate
 * the fitness of the population.
 */
export interface PhenotypeCacheInterface {
  /**
   * Gets the phenotype of a genome, or undefined if the genome is not ready.
   *
   * @param genomeId The ID of the genome.
   * @returns The phenotype of the genome, or undefined if the genome is not ready.
   */
  getReady(genomeId: number): GenomePhenotypeRow | undefined;

  /**
   * Gets the phenotype of a genome.
   *
   * @param genomeId The ID of the genome.
   * @param defaultValue The default value to return if the genome is not found.
   * @returns The phenotype of the genome, or the default value if the genome phenotype is not found.
   */
  get(genomeId: number, defaultValue?: GenomePhenotypeRow): GenomePhenotypeRow | undefined;

  /**
   * Sets the phenotype of a genome.
   *
   * @param genomeId The ID of the genome.
   * @param phenotype The phenotype of the genome.
   */
  set(genomeId: number, phenotype: GenomePhenotypeRow): void;

  /**
   * Clears the cache, excluding the specified genome IDs.
   *
   * @param excludeGenomeIds The IDs of the genomes to exclude from the clear operation.
   */
  clear(excludeGenomeIds: number[]): void;

  /**
   * Exports the cache as a record of genome IDs to phenotype.
   *
   * @returns The cache as a record of genome IDs to phenotype.
   */
  export(): Record<number, unknown>;

  /**
   * Imports the cache from a record of genome IDs to phenotype.
   *
   * @param data The cache as a record of genome IDs to phenotype.
   */
  import(data: Record<number, unknown>): void;
}

/**
 * An interface for a genome stats manager.
 *
 * A genome stats manager is used to manage the statistics of a population of genomes.
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
   * Updates the genome stats manager with the given population, phenotype matrix, and fitness column.
   *
   * @param population The population to update the manager with.
   * @param phenotypeMatrix The phenotype matrix of the population.
   * @param fitnessColumn The fitness column of the population.
   */
  update(
    population: Population<TGenome>,
    phenotypeMatrix: GenerationPhenotypeMatrix,
    fitnessColumn: GenerationFitnessColumn,
  ): void;
}

/**
 * Interface for managing population summaries in a genetic algorithm.
 *
 * @template TGenome The type of genome objects in the population.
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
 */
export interface SchedulerInterface {
  /**
   * An array of log messages generated by the scheduler.
   */
  readonly logs: string[];

  /**
   * Executes a single step or iteration in the scheduler.
   */
  step(): void;
}
