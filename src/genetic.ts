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
  MetricsCacheInterface,
  GenomeStatsManagerInterface,
  PopulationSummaryManagerInterface,
  PopulationSummary,
  SchedulerInterface,
  GenerationMetricsMatrix,
} from "./types";
import { getRandomArrayItem, IdGenerator } from "./utils";
import { zip, distinctBy, repeat } from "./itertools";
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
 * - A [[MetricsStrategyInterface]] to calculate the metrics of the population.
 * - A [[FitnessStrategyInterface]] to calculate the fitness of the population.
 * - A [[MetricsCacheInterface]] to cache the metrics of the population.
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

  public get generation(): number {
    return this._generation;
  }

  public get bestGenome(): TGenome {
    return this._population[0];
  }

  public get population(): Population<TGenome> {
    return this._population;
  }

  public set population(population: Population<TGenome>) {
    this.setPopulation(population);
  }

  public setPopulation(population: Population<TGenome>, resetIdGenerator: boolean = true): void {
    if (resetIdGenerator) {
      this.idGenerator.reset(population);
    }
    this._populationBuffer = population;
  }

  public get partitions(): [number, number, number] {
    const countToSurvive = Math.round(this.config.populationSize * this.config.survivalRate);
    const countToDie = this.config.populationSize - countToSurvive;

    const countToCross = Math.round(countToDie * this.config.crossoverRate);
    const countToClone = countToDie - countToCross;

    return [countToSurvive, countToCross, countToClone];
  }

  public get cache(): MetricsCacheInterface {
    return this.strategy.cache;
  }

  public getPopulationSummary(roundPrecision?: number): PopulationSummary {
    return roundPrecision === undefined
      ? this.populationSummaryManager.get()
      : this.populationSummaryManager.getRounded(roundPrecision);
  }

  public async fit(config: GeneticSearchFitConfig): Promise<void> {
    const generationsCount = config.generationsCount ?? Infinity;
    for (let i=0; i<generationsCount; i++) {
      const generation = this.generation;
      this.clearCache();
      if (config.beforeStep) {
        config.beforeStep(generation);
      }
      const result = await this.fitStep(config.scheduler);
      if (config.afterStep) {
        config.afterStep(generation, result);
      }
      if (config.stopCondition && config.stopCondition(result)) {
        break;
      }
    }
  }

  public async fitStep(scheduler?: SchedulerInterface): Promise<GenerationFitnessColumn> {
    this.refreshPopulation();

    const metricsMatrix = await this.strategy.metrics.collect(this._population, this.strategy.cache);
    const fitnessColumn = this.strategy.fitness.score(metricsMatrix);

    this.genomeStatsManager.update(this.population, metricsMatrix, fitnessColumn);

    const [sortedPopulation, sortedFitnessColumn] = this.sortPopulation(fitnessColumn, metricsMatrix);
    this.populationSummaryManager.update(sortedPopulation);

    if (scheduler !== undefined) {
      scheduler.step();
    }

    this.refreshPopulationBuffer(sortedPopulation);

    this._generation++;

    return sortedFitnessColumn;
  }

  public clearCache() {
    this.strategy.cache.clear(this.population.map((genome) => genome.id));
  }

  public refreshPopulation(): void {
    this._population = this._populationBuffer;
  }

  protected sortPopulation(
    scores: GenerationFitnessColumn,
    metricsMatrix: GenerationMetricsMatrix,
  ): [Population<TGenome>, GenerationFitnessColumn] {
    const zipped = zip(this._population, scores, metricsMatrix);
    const sorted = this.strategy.sorting.sort([...zipped]);
    return [
      sorted.map((x) => x[0]),
      sorted.map((x) => x[1]),
    ];
  }

  protected crossover(genomes: Population<TGenome>, count: number): Population<TGenome> {
    const newPopulation: Population<TGenome> = [];

    for (let i = 0; i < count; i++) {
      const lhs = getRandomArrayItem(genomes);
      const rhs = getRandomArrayItem(genomes);
      const crossedGenome = this.strategy.crossover.cross(lhs, rhs, this.idGenerator.nextId());
      this.genomeStatsManager.initItem(crossedGenome, 'crossover', [lhs, rhs]);
      newPopulation.push(crossedGenome);
    }

    return newPopulation;
  }

  protected mutate(genomes: Population<TGenome>, count: number): Population<TGenome> {
    const newPopulation: Population<TGenome> = [];

    for (let i = 0; i < count; i++) {
      const genome = getRandomArrayItem(genomes);
      const mutatedGenome = this.strategy.mutation.mutate(genome, this.idGenerator.nextId());
      this.genomeStatsManager.initItem(mutatedGenome, 'mutation', [genome]);
      newPopulation.push(mutatedGenome);
    }

    return newPopulation;
  }

  protected refreshPopulationBuffer(sortedPopulation: Population<TGenome>): void {
    const [countToSurvive, countToCross, countToClone] = this.partitions;

    const survivedPopulation = sortedPopulation.slice(0, countToSurvive);
    const crossedPopulation = this.crossover(survivedPopulation, countToCross);
    const mutatedPopulation = this.mutate(survivedPopulation, countToClone);

    this._population = sortedPopulation;
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
 */
export class ComposedGeneticSearch<TGenome extends BaseGenome> implements GeneticSearchInterface<TGenome> {
  private readonly strategy: GeneticSearchStrategyConfig<TGenome>;
  private readonly eliminators: GeneticSearchInterface<TGenome>[];
  private readonly final: GeneticSearchInterface<TGenome>;
  private readonly idGenerator: IdGeneratorInterface<TGenome>;
  private readonly config: ComposedGeneticSearchConfig;

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

  public get generation(): number {
    return this.final.generation;
  }

  public get bestGenome(): TGenome {
    return this.final.bestGenome;
  }

  public get population(): Population<TGenome> {
    const result: Population<TGenome> = [];
    result.push(...this.final.population.slice(0, this.config.final.populationSize));
    for (const eliminators of this.eliminators) {
      result.push(...eliminators.population);
    }
    return result;
  }

  public set population(population: Population<TGenome>) {
    this.setPopulation(population);
  }

  public setPopulation(population: Population<TGenome>, resetIdGenerator: boolean = true): void {
    if (resetIdGenerator) {
      this.idGenerator.reset(population);
    }
    this.final.setPopulation(population.slice(0, this.final.population.length), false);
    population = population.slice(this.final.population.length);
    for (const eliminator of this.eliminators) {
      eliminator.setPopulation(population.slice(0, eliminator.population.length), false);
      population = population.slice(eliminator.population.length);
    }
  }

  public get partitions(): [number, number, number] {
    const result: [number, number, number] = [0, 0, 0];
    for (const eliminators of this.eliminators) {
      const [countToSurvive, countToCross, countToClone] = eliminators.partitions;
      result[0] += countToSurvive;
      result[1] += countToCross;
      result[2] += countToClone;
    }
    return result;
  }

  public get cache(): MetricsCacheInterface {
    return this.strategy.cache;
  }

  public getPopulationSummary(roundPrecision?: number): PopulationSummary {
    return this.final.getPopulationSummary(roundPrecision);
  }

  public async fit(config: GeneticSearchFitConfig): Promise<void> {
    const generationsCount = config.generationsCount ?? Infinity;
    for (let i=0; i<generationsCount; i++) {
      this.clearCache();
      if (config.beforeStep) {
        config.beforeStep(i);
      }
      const result = await this.fitStep(config.scheduler);
      if (config.afterStep) {
        config.afterStep(i, result);
      }
      if (config.stopCondition && config.stopCondition(result)) {
        break;
      }
    }
  }

  public async fitStep(scheduler?: SchedulerInterface): Promise<GenerationFitnessColumn> {
    for (const eliminators of this.eliminators) {
      await eliminators.fitStep();
    }

    // TODO pop best genomes ???

    this.final.refreshPopulation();
    this.final.setPopulation([...distinctBy([...this.final.population, ...this.bestGenomes], (x) => x.id)], false);
    return await this.final.fitStep(scheduler);
  }

  public clearCache() {
    this.strategy.cache.clear(this.population.map((genome) => genome.id));
  }

  public refreshPopulation() {
    this.final.refreshPopulation();
    for (const eliminator of this.eliminators) {
      eliminator.refreshPopulation();
    }
  }

  protected get bestGenomes(): Population<TGenome> {
    return this.eliminators.map((eliminators) => eliminators.bestGenome);
  }
}
