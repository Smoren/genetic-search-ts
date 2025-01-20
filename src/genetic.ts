import type {
  GeneticSearchConfig,
  GeneticSearchStrategyConfig,
  GeneticSearchInterface,
  GenerationFitnessColumn,
  Population,
  BaseGenome,
  GeneticSearchFitConfig,
  ComposedGeneticSearchConfig,
  IdGeneratorInterface,
  PhenotypeCacheInterface,
  GenomeStatsManagerInterface,
  PopulationSummaryManagerInterface,
  PopulationSummary,
  SchedulerInterface,
  EvaluatedGenome,
} from "./types";
import {createEvaluatedPopulation, extractEvaluatedPopulation, IdGenerator } from "./utils";
import { distinctBy, repeat } from "./itertools";
import { GenomeStatsManager, PopulationSummaryManager } from "./stats";

/**
 * A genetic search algorithm.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @remarks
 * This class implements the genetic search algorithm. The algorithm is
 * configured using the [[GeneticSearchConfig]] object.
 *
 * The algorithm uses the following components, which can be customized by
 * providing a custom implementation:
 *
 * - A [[PopulateStrategyInterface]] to generate the initial population.
 * - A [[MutationStrategyInterface]] to mutate the population.
 * - A [[CrossoverStrategyInterface]] to cross over the population.
 * - A [[PhenotypeStrategyInterface]] to calculate the phenotype of the population.
 * - A [[FitnessStrategyInterface]] to calculate the fitness of the population.
 * - A [[PhenotypeCacheInterface]] to cache the phenotype of the population.
 *
 * @category Genetic Algorithm
 */
export class GeneticSearch<TGenome extends BaseGenome> implements GeneticSearchInterface<TGenome> {
  protected readonly config: GeneticSearchConfig;
  protected readonly strategy: GeneticSearchStrategyConfig<TGenome>;
  protected readonly idGenerator: IdGeneratorInterface<TGenome>;
  protected readonly genomeStatsManager: GenomeStatsManagerInterface<TGenome>;
  protected readonly populationSummaryManager: PopulationSummaryManagerInterface<TGenome>;
  protected _generation: number = 1;
  protected _population: Population<TGenome>;
  protected _populationBuffer: Population<TGenome> = [];

  /**
   * Constructs a new instance of the GeneticSearch class.
   *
   * @param config - The configuration for the genetic search.
   * @param strategy - The strategy configuration for genetic operations.
   * @param idGenerator - An optional ID generator for the genomes.
   */
  constructor(
    config: GeneticSearchConfig,
    strategy: GeneticSearchStrategyConfig<TGenome>,
    idGenerator?: IdGeneratorInterface<TGenome>,
  ) {
    this.idGenerator = idGenerator ?? new IdGenerator();
    this.genomeStatsManager = new GenomeStatsManager();
    this.populationSummaryManager = new PopulationSummaryManager();
    this.strategy = strategy;
    this.config = config;
    this._population = strategy.populate.populate(config.populationSize, this.idGenerator);
    this._populationBuffer = this.population;
  }

  /**
   * The current generation number.
   *
   * @returns The current generation number.
   */
  public get generation(): number {
    return this._generation;
  }

  /**
   * Gets the best genome from the population.
   *
   * @returns The best genome from the population.
   */
  public get bestGenome(): TGenome {
    return this._population[0];
  }

  /**
   * The current population of genomes.
   *
   * @returns The current population of genomes.
   */
  public get population(): Population<TGenome> {
    return this._population;
  }

  /**
   * Sets the current population of genomes.
   *
   * @param population The new population of genomes.
   */
  public set population(population: Population<TGenome>) {
    this.setPopulation(population);
  }

  /**
   * Sets the current population of genomes.
   *
   * @param population The new population of genomes.
   * @param resetIdGenerator Whether to reset the ID generator. Defaults to true.
   */
  public setPopulation(population: Population<TGenome>, resetIdGenerator: boolean = true): void {
    if (resetIdGenerator) {
      this.idGenerator.reset(population);
    }
    this._populationBuffer = population;
  }

  /**
   * Calculates and returns the partitions of the population for the genetic operations.
   *
   * @returns A tuple containing:
   * - The number of genomes that will survive.
   * - The number of genomes that will be created by crossover.
   * - The number of genomes that will be created by mutation.
   */
  public get partitions(): [number, number, number] {
    // Calculate the number of genomes that will survive based on the survival rate.
    const countToSurvive = Math.round(this.config.populationSize * this.config.survivalRate);

    // Calculate the number of genomes that will die (not survive).
    const countToDie = this.config.populationSize - countToSurvive;

    // Calculate the number of new genomes that will be created by crossover.
    const countToCross = Math.round(countToDie * this.config.crossoverRate);

    // Calculate the number of new genomes that will be created by mutation.
    const countToMutate = countToDie - countToCross;

    return [countToSurvive, countToCross, countToMutate];
  }

  /**
   * Retrieves the phenotype cache used by the genetic search algorithm.
   *
   * @returns {PhenotypeCacheInterface} The phenotype cache instance.
   */
  public get cache(): PhenotypeCacheInterface {
    return this.strategy.cache;
  }

  /**
   * Retrieves the population summary, optionally rounding the statistics to a specified precision.
   *
   * @param roundPrecision Optional. The number of decimal places to round the summary statistics to.
   *                       If not provided, no rounding is applied.
   * @returns The population summary, with statistics rounded to the specified precision if provided.
   */
  public getPopulationSummary(roundPrecision?: number): PopulationSummary {
    return roundPrecision === undefined
      ? this.populationSummaryManager.get()
      : this.populationSummaryManager.getRounded(roundPrecision);
  }

  /**
   * Runs the genetic search algorithm.
   *
   * @param config The configuration for the genetic search algorithm.
   * @returns A promise that resolves when the algorithm has finished running.
   */
  public async fit(config: GeneticSearchFitConfig): Promise<void> {
    // Determine the number of generations to run, defaulting to Infinity if not specified.
    const generationsCount = config.generationsCount ?? Infinity;
    // Run the genetic search algorithm for the specified number of generations.
    for (let i=0; i<generationsCount; i++) {
      const generation = this.generation;

      // Refresh the population from the population buffer.
      this.refreshPopulation();
      // Clear the cache of phenotype.
      this.clearCache();

      // Run the before step callback if specified.
      if (config.beforeStep) {
        config.beforeStep(generation);
      }

      // Run a step of the genetic search algorithm.
      const result = await this.fitStep(config.scheduler);

      // Run the after step callback if specified.
      if (config.afterStep) {
        config.afterStep(generation, result);
      }

      // Check if the stop condition is met and stop the algorithm if it is.
      if (config.stopCondition && config.stopCondition(result)) {
        break;
      }
    }
  }

  /**
   * Runs a single step of the genetic search algorithm.
   *
   * @param scheduler Optional. The scheduler to use for the genetic search algorithm.
   * @returns A promise that resolves with the fitness of the best genome in the population.
   */
  public async fitStep(scheduler?: SchedulerInterface): Promise<GenerationFitnessColumn> {
    // Refresh population from buffer.
    this.refreshPopulation();

    // Collect phenotype phenotype for the population.
    const phenotypeMatrix = await this.strategy.phenotype.collect(this._population, this.strategy.cache);

    // Calculate fitness for the population.
    const fitnessColumn = this.strategy.fitness.score(phenotypeMatrix);

    // Update genome statistics.
    this.genomeStatsManager.update(this.population, phenotypeMatrix, fitnessColumn);

    // Sort the population by fitness.
    const sortedEvaluatedPopulation = this.strategy.sorting.sort(createEvaluatedPopulation(this._population, fitnessColumn, phenotypeMatrix));
    const [sortedPopulation, sortedFitnessColumn] = extractEvaluatedPopulation(sortedEvaluatedPopulation);

    // Update population summary.
    this.populationSummaryManager.update(sortedPopulation);

    // Step the scheduler if provided.
    if (scheduler !== undefined) {
      scheduler.step();
    }

    // Run crossover and mutation.
    this.refreshPopulationBuffer(sortedEvaluatedPopulation);

    // Increase generation counter.
    this._generation++;

    // Return the sorted fitness column.
    return sortedFitnessColumn;
  }

  /**
   * Clears the cache.
   *
   * @remarks
   * This method clears the cache, which is used to store the phenotype of the genomes.
   * The cache is used to avoid re-calculating the phenotype of the genomes if they remain unchanged.
   */
  public clearCache() {
    this.strategy.cache.clear(this.population.map((genome) => genome.id));
  }

  /**
   * Refreshes the population.
   *
   * @remarks
   * This method is used to refresh the population, which is the array of genomes that are currently being evaluated.
   * The population is refreshed by swapping the current population with the population buffer.
   */
  public refreshPopulation(): void {
    this._population = this._populationBuffer;
  }

  /**
   * Crosses the given input population.
   *
   * @param input The population of genomes to cross.
   * @param count The number of new genomes to create.
   * @returns An array of new genomes created by crossing the input population.
   */
  protected crossover(input: Array<EvaluatedGenome<TGenome>>, count: number): Population<TGenome> {
    const newPopulation: Population<TGenome> = [];

    // Select parents for crossover. Then for each parents array, cross them and create a new genome.
    for (const parents of this.strategy.selection.selectForCrossover(input, count)) {
      const crossedGenome = this.strategy.crossover.cross(parents, this.idGenerator.nextId());

      // Initialize the statistics for the new genome.
      this.genomeStatsManager.initItem(crossedGenome, 'crossover', parents);

      newPopulation.push(crossedGenome);
    }

    return newPopulation;
  }

  /**
   * Mutates the given input population.
   *
   * @param input The population of genomes to mutate.
   * @param count The number of new genomes to create.
   * @returns An array of new genomes created by mutating the input population.
   */
  protected mutate(input: Array<EvaluatedGenome<TGenome>>, count: number): Population<TGenome> {
    const newPopulation: Population<TGenome> = [];

    // Select parents for mutation. Then for each parent, mutate it and create a new genome.
    for (const genome of this.strategy.selection.selectForMutation(input, count)) {
      // Mutate the parent and create a new genome.
      const mutatedGenome = this.strategy.mutation.mutate(genome, this.idGenerator.nextId());

      // Initialize the statistics for the new genome.
      this.genomeStatsManager.initItem(mutatedGenome, 'mutation', [genome]);

      newPopulation.push(mutatedGenome);
    }

    // Return the new population.
    return newPopulation;
  }

  /**
   * Refreshes the population buffer from the evaluated population.
   *
   * @param input The population of genomes to refresh the population buffer with.
   */
  protected refreshPopulationBuffer(input: Array<EvaluatedGenome<TGenome>>): void {
    const [countToSurvive, countToCross, countToMutate] = this.partitions;
    const sortedPopulation = input.map((x) => x.genome);

    // Select the top fittest genomes to survive.
    const survivedEvaluatedPopulation = input.slice(0, countToSurvive);
    const survivedPopulation = survivedEvaluatedPopulation.map((x) => x.genome);

    // Select parents for crossover. Then for each parents array, cross them and create a new genome.
    const crossedPopulation = this.crossover(survivedEvaluatedPopulation, countToCross);

    // Select parents for mutation. Then for each parent, mutate it and create a new genome.
    const mutatedPopulation = this.mutate(survivedEvaluatedPopulation, countToMutate);

    // Set the current population to the sorted population.
    this._population = sortedPopulation;
    // Set the next population to the combination of the survived, crossed, and mutated populations.
    this._populationBuffer = [...survivedPopulation, ...crossedPopulation, ...mutatedPopulation];
  }
}

/**
 * A composed genetic search algorithm that combines multiple genetic search strategies.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @remarks
 * This class implements a composite genetic search algorithm that utilizes multiple
 * genetic search strategies, including eliminators and a final strategy. The algorithm
 * is configured using the [[ComposedGeneticSearchConfig]] object.
 *
 * The algorithm integrates the following components, which can be customized by
 * providing custom implementations:
 *
 * - A [[GeneticSearchStrategyConfig]] to define the strategy for the genetic operations.
 * - An [[IdGeneratorInterface]] to generate unique IDs for the genomes.
 *
 * @category Genetic Algorithm
 */
export class ComposedGeneticSearch<TGenome extends BaseGenome> implements GeneticSearchInterface<TGenome> {
  private readonly strategy: GeneticSearchStrategyConfig<TGenome>;
  private readonly eliminators: GeneticSearchInterface<TGenome>[];
  private readonly final: GeneticSearchInterface<TGenome>;
  private readonly idGenerator: IdGeneratorInterface<TGenome>;
  private readonly config: ComposedGeneticSearchConfig;

  /**
   * Constructs a new instance of the ComposedGeneticSearch class.
   *
   * @param config - The configuration for the composed genetic search algorithm.
   * @param strategy - The strategy configuration for genetic operations.
   * @param idGenerator - An optional ID generator for the genomes.
   */
  constructor(
    config: ComposedGeneticSearchConfig,
    strategy: GeneticSearchStrategyConfig<TGenome>,
    idGenerator?: IdGenerator<TGenome>,
  ) {
    this.config = config;
    this.strategy = strategy;
    this.idGenerator = idGenerator ?? new IdGenerator<TGenome>();
    this.eliminators = [...repeat(
      () => new GeneticSearch(config.eliminators, strategy, this.idGenerator),
      config.final.populationSize,
    )].map((factory) => factory());
    this.final = new GeneticSearch(config.final, strategy, this.idGenerator);
  }

  /**
   * The current generation number.
   *
   * @returns The current generation number.
   */
  public get generation(): number {
    return this.final.generation;
  }

  /**
   * Gets the best genome from the population.
   *
   * @returns The best genome from the population.
   */
  public get bestGenome(): TGenome {
    return this.final.bestGenome;
  }

  /**
   * The current population of genomes.
   *
   * @returns The current population of genomes.
   */
  public get population(): Population<TGenome> {
    // Initialize an empty population result array.
    const result: Population<TGenome> = [];

    // Add genomes from the final population, limited to the configured size.
    result.push(...this.final.population.slice(0, this.config.final.populationSize));

    // Add genomes from each eliminator's population.
    for (const eliminators of this.eliminators) {
      result.push(...eliminators.population);
    }

    // Return the combined population result.
    return result;
  }

  public set population(population: Population<TGenome>) {
    this.setPopulation(population);
  }

  /**
   * Sets the current population of genomes.
   *
   * @param population The new population of genomes.
   * @param resetIdGenerator Whether to reset the ID generator. Defaults to true.
   */
  public setPopulation(population: Population<TGenome>, resetIdGenerator: boolean = true): void {
    // If the resetIdGenerator option is specified, reset the ID generator.
    if (resetIdGenerator) {
      this.idGenerator.reset(population);
    }

    // Set the population of the final search algorithm.
    this.final.setPopulation(population.slice(0, this.final.population.length), false);

    // Remove the genomes that were assigned to the final search algorithm.
    population = population.slice(this.final.population.length);

    // Assign the remaining genomes to the eliminators.
    for (const eliminator of this.eliminators) {
      // Set the population of the eliminator.
      eliminator.setPopulation(population.slice(0, eliminator.population.length), false);

      // Remove the genomes that were assigned to the eliminator.
      population = population.slice(eliminator.population.length);
    }
  }

  /**
   * Calculates and returns the partitions of the population for the genetic operations.
   *
   * @returns A tuple containing:
   * - The number of genomes that will survive.
   * - The number of genomes that will be created by crossover.
   * - The number of genomes that will be created by mutation.
   */
  public get partitions(): [number, number, number] {
    // Calculate the total number of genomes that will survive, be crossed, and be mutated.
    // This is the sum of the counts from each eliminator.
    const result: [number, number, number] = [0, 0, 0];
    for (const eliminators of this.eliminators) {
      const [countToSurvive, countToCross, countToMutate] = eliminators.partitions;

      // Add the counts from the current eliminator to the result.
      result[0] += countToSurvive;
      result[1] += countToCross;
      result[2] += countToMutate;
    }
    return result;
  }

  /**
   * Retrieves the phenotype cache used by the genetic search algorithm.
   *
   * @returns {PhenotypeCacheInterface} The phenotype cache instance.
   */
  public get cache(): PhenotypeCacheInterface {
    return this.strategy.cache;
  }

  /**
   * Retrieves the population summary, optionally rounding the statistics to a specified precision.
   *
   * @param roundPrecision Optional. The number of decimal places to round the summary statistics to.
   *                       If not provided, no rounding is applied.
   * @returns The population summary, with statistics rounded to the specified precision if provided.
   */
  public getPopulationSummary(roundPrecision?: number): PopulationSummary {
    return this.final.getPopulationSummary(roundPrecision);
  }

  /**
   * Runs the genetic search algorithm.
   *
   * @param config The configuration for the genetic search algorithm.
   * @returns A promise that resolves when the algorithm has finished running.
   */
  public async fit(config: GeneticSearchFitConfig): Promise<void> {
    // Determine the number of generations to run, defaulting to Infinity if not specified.
    const generationsCount = config.generationsCount ?? Infinity;

    // Iterate through each generation until the specified count is reached.
    for (let i = 0; i < generationsCount; i++) {
      // Refresh the population for the current generation.
      this.refreshPopulation();

      // Clear any cached phenotype to ensure accurate calculations.
      this.clearCache();

      // Execute the before-step callback if it is provided in the config.
      if (config.beforeStep) {
        config.beforeStep(i);
      }

      // Run a single step of the genetic search algorithm using the scheduler.
      const result = await this.fitStep(config.scheduler);

      // Execute the after-step callback if it is provided in the config.
      if (config.afterStep) {
        config.afterStep(i, result);
      }

      // Check if the stop condition is met, and break the loop if so.
      if (config.stopCondition && config.stopCondition(result)) {
        break;
      }
    }
  }

  /**
   * Runs a single step of the genetic search algorithm.
   *
   * @param scheduler Optional. The scheduler to use for the genetic search algorithm.
   * @returns A promise that resolves with the fitness of the best genome in the population.
   */
  public async fitStep(scheduler?: SchedulerInterface): Promise<GenerationFitnessColumn> {
    // Run a single step of the genetic search algorithm for each eliminator.
    for (const eliminators of this.eliminators) {
      await eliminators.fitStep();
    }

    // Run crossing and mutation for the final population.
    this.final.refreshPopulation();

    // Set the population for the final population by combining the best genomes from the eliminators
    // with the current population.
    this.final.setPopulation([...distinctBy([...this.final.population, ...this.bestGenomes], (x) => x.id)], false);

    // Run the final step of the genetic search algorithm.
    return await this.final.fitStep(scheduler);
  }

  /**
   * Clears the cache.
   *
   * @remarks
   * This method clears the cache, which is used to store the phenotype of the genomes.
   * The cache is used to avoid re-calculating the phenotype of the genomes if they remain unchanged.
   */
  public clearCache() {
    this.strategy.cache.clear(this.population.map((genome) => genome.id));
  }

  /**
   * Refreshes the population.
   *
   * @remarks
   * This method is used to refresh the population, which is the array of genomes that are currently being evaluated.
   * The population is refreshed by swapping the current population with the population buffer.
   */
  public refreshPopulation() {
    // Refresh the population for the final search algorithm.
    this.final.refreshPopulation();

    // Refresh the population for each eliminator.
    for (const eliminator of this.eliminators) {
      eliminator.refreshPopulation();
    }
  }

  /**
   * Gets the best genomes from the eliminators.
   *
   * @remarks
   * This method returns the best genomes from each eliminator.
   * The best genomes are the genomes that have the highest fitness score.
   * The best genomes are determined by calling {@link GeneticSearch.bestGenome} on each eliminator.
   *
   * @returns The best genomes from the eliminators.
   */
  protected get bestGenomes(): Population<TGenome> {
    return this.eliminators.map((eliminators) => eliminators.bestGenome);
  }
}
