import {
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
} from "./types";
import { getRandomArrayItem, IdGenerator } from "./utils";
import { zip, distinctBy, sort, repeat } from "./itertools";
import { GenomeStatsManager } from "./stats";

export class GeneticSearch<TGenome extends BaseGenome> implements GeneticSearchInterface<TGenome> {
  protected readonly config: GeneticSearchConfig;
  protected readonly strategy: GeneticSearchStrategyConfig<TGenome>;
  protected readonly idGenerator: IdGeneratorInterface<TGenome>;
  protected readonly statsManager: GenomeStatsManagerInterface<TGenome>;
  protected _generation: number = 0;
  protected _population: Population<TGenome>;

  constructor(
    config: GeneticSearchConfig,
    strategy: GeneticSearchStrategyConfig<TGenome>,
    idGenerator?: IdGeneratorInterface<TGenome>,
  ) {
    this.idGenerator = idGenerator ?? new IdGenerator();
    this.statsManager = new GenomeStatsManager();
    this.strategy = strategy;
    this.config = config;
    this._population = strategy.populate.populate(config.populationSize, this.idGenerator);
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
    this._population = population;
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

  public async fit(config: GeneticSearchFitConfig): Promise<void> {
    const generationsCount = config.generationsCount ?? Infinity;
    for (let i=0; i<generationsCount; i++) {
      const generation = this.generation;
      this.clearCache();
      if (config.beforeStep) {
        config.beforeStep(generation);
      }
      const result = await this.fitStep();
      if (config.afterStep) {
        config.afterStep(generation, result);
      }
      if (config.stopCondition && config.stopCondition(result)) {
        break;
      }
    }
  }

  public async fitStep(): Promise<GenerationFitnessColumn> {
    const metricsMatrix = await this.strategy.metrics.collect(this._population, this.strategy.cache);
    const fitnessColumn = this.strategy.fitness.score(metricsMatrix);

    this.statsManager.update(this.population, metricsMatrix, fitnessColumn);

    const [sortedPopulation, sortedFitnessColumn] = this.sortPopulation(fitnessColumn);
    this.refreshPopulation(sortedPopulation);

    this._generation++;

    return sortedFitnessColumn;
  }

  public clearCache() {
    this.strategy.cache.clear(this.population.map((genome) => genome.id));
  }

  protected sortPopulation(scores: GenerationFitnessColumn): [Population<TGenome>, GenerationFitnessColumn] {
    const zipped = zip(this._population, scores);
    const sorted = sort(zipped, (lhs, rhs) => rhs[1] - lhs[1]);
    const sortedArray = [...sorted];
    return [
      sortedArray.map((x) => x[0]),
      sortedArray.map((x) => x[1]),
    ];
  }

  protected crossover(genomes: Population<TGenome>, count: number): Population<TGenome> {
    const newPopulation: Population<TGenome> = [];

    for (let i = 0; i < count; i++) {
      const lhs = getRandomArrayItem(genomes);
      const rhs = getRandomArrayItem(genomes);
      const crossedGenome = this.strategy.crossover.cross(lhs, rhs, this.idGenerator.nextId());
      newPopulation.push(crossedGenome);
    }

    return newPopulation;
  }

  protected clone(genomes: Population<TGenome>, count: number): Population<TGenome> {
    const newPopulation: Population<TGenome> = [];

    for (let i = 0; i < count; i++) {
      const genome = getRandomArrayItem(genomes);
      const mutatedGenome = this.strategy.mutation.mutate(genome, this.idGenerator.nextId());
      newPopulation.push(mutatedGenome);
    }

    return newPopulation;
  }

  protected refreshPopulation(sortedPopulation: Population<TGenome>): void {
    const [countToSurvive, countToCross, countToClone] = this.partitions;

    const survivedPopulation = sortedPopulation.slice(0, countToSurvive);
    const crossedPopulation = this.crossover(survivedPopulation, countToCross);
    const mutatedPopulation = this.clone(survivedPopulation, countToClone);

    this.statsManager.init(crossedPopulation, 'crossover');
    this.statsManager.init(mutatedPopulation, 'mutation');

    this._population = [...survivedPopulation, ...crossedPopulation, ...mutatedPopulation];
  }
}

export class ComposedGeneticSearch<TGenome extends BaseGenome> implements GeneticSearchInterface<TGenome> {
  private readonly strategy: GeneticSearchStrategyConfig<TGenome>;
  private readonly eliminators: GeneticSearchInterface<TGenome>[];
  private readonly final: GeneticSearchInterface<TGenome>;
  private readonly idGenerator: IdGeneratorInterface<TGenome>;

  constructor(
    config: ComposedGeneticSearchConfig,
    strategy: GeneticSearchStrategyConfig<TGenome>,
    idGenerator?: IdGenerator<TGenome>,
  ) {
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
    result.push(...this.final.population);
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

  public async fit(config: GeneticSearchFitConfig): Promise<void> {
    const generationsCount = config.generationsCount ?? Infinity;
    for (let i=0; i<generationsCount; i++) {
      this.clearCache();
      if (config.beforeStep) {
        config.beforeStep(i);
      }
      const result = await this.fitStep();
      if (config.afterStep) {
        config.afterStep(i, result);
      }
      if (config.stopCondition && config.stopCondition(result)) {
        break;
      }
    }
  }

  public async fitStep(): Promise<GenerationFitnessColumn> {
    for (const eliminators of this.eliminators) {
      await eliminators.fitStep();
    }

    // TODO pop best genomes ???

    this.final.setPopulation([...distinctBy([...this.final.population, ...this.bestGenomes], (x) => x.id)], false);
    return await this.final.fitStep();
  }

  public clearCache() {
    this.strategy.cache.clear(this.population.map((genome) => genome.id));
  }

  protected get bestGenomes(): Population<TGenome> {
    return this.eliminators.map((eliminators) => eliminators.bestGenome);
  }
}
