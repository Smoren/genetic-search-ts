import { multi, single } from "itertools-ts";
import {
  GeneticSearchConfig,
  StrategyConfig,
  GeneticSearchInterface,
  GenerationScoreColumn,
  Population,
  BaseGenome,
  NextIdGetter,
  GeneticFitConfig,
  ComposedGeneticSearchConfig,
} from "./types";
import { createNextIdGetter, getRandomArrayItem } from "./utils";

export class GeneticSearch<TGenome extends BaseGenome> implements GeneticSearchInterface<TGenome> {
  protected readonly config: GeneticSearchConfig;
  protected readonly strategy: StrategyConfig<TGenome>;
  protected readonly nextId: NextIdGetter;
  protected _population: Population<TGenome>;

  constructor(config: GeneticSearchConfig, strategy: StrategyConfig<TGenome>, nextIdGetter?: NextIdGetter) {
    this.config = config;
    this.strategy = strategy;
    this.nextId = nextIdGetter ?? createNextIdGetter();
    this._population = this.strategy.populate.populate(this.config.populationSize, this.nextId);
  }

  public get bestGenome(): TGenome {
    return this._population[0];
  }

  public get population(): Population<TGenome> {
    return this._population;
  }

  public set population(population: Population<TGenome>) {
    this._population = population;
  }

  public get partitions(): [number, number, number] {
    const countToSurvive = Math.round(this.config.populationSize * this.config.survivalRate);
    const countToDie = this.config.populationSize - countToSurvive;

    const countToCross = Math.round(countToDie * this.config.crossoverRate);
    const countToClone = countToDie - countToCross;

    return [countToSurvive, countToCross, countToClone];
  }

  public async fit(config: GeneticFitConfig): Promise<void> {
    for (let i=0; i<config.generationsCount; i++) {
      const result = await this.step();
      if (config.afterStep) {
        config.afterStep(i, result);
      }
    }
  }

  public async step(): Promise<GenerationScoreColumn> {
    const gradeMatrix = await this.strategy.runner.run(this._population);
    const scoreColumn = this.strategy.scoring.score(gradeMatrix);

    const [sortedPopulation, sortedScoreColumn] = this.sortPopulation(scoreColumn);
    this.refreshPopulation(sortedPopulation);

    return sortedScoreColumn;
  }

  protected sortPopulation(scores: GenerationScoreColumn): [Population<TGenome>, GenerationScoreColumn] {
    const zipped = multi.zipEqual(this._population, scores);
    const sorted = single.sort(zipped, (lhs, rhs) => rhs[1] - lhs[1]);
    const sortedArray = [...sorted];
    return [
      [...single.map(sortedArray, (x) => x[0])],
      [...single.map(sortedArray, (x) => x[1])],
    ];
  }

  protected crossover(genomes: Population<TGenome>, count: number): Population<TGenome> {
    const newPopulation: Population<TGenome> = [];

    for (let i = 0; i < count; i++) {
      const lhs = getRandomArrayItem(genomes);
      const rhs = getRandomArrayItem(genomes);
      const crossedGenome = this.strategy.crossover.cross(lhs, rhs, this.nextId());
      newPopulation.push(crossedGenome);
    }

    return newPopulation;
  }

  protected clone(genomes: Population<TGenome>, count: number): Population<TGenome> {
    const newPopulation: Population<TGenome> = [];

    for (let i = 0; i < count; i++) {
      const genome = getRandomArrayItem(genomes);
      const mutatedGenome = this.strategy.mutation.mutate(genome, this.nextId());
      newPopulation.push(mutatedGenome);
    }

    return newPopulation;
  }

  protected refreshPopulation(sortedPopulation: Population<TGenome>): void {
    const [countToSurvive, countToCross, countToClone] = this.partitions;

    const survivedPopulation = sortedPopulation.slice(0, countToSurvive);
    const crossedPopulation = this.crossover(survivedPopulation, countToCross);
    const mutatedPopulation = this.clone(survivedPopulation, countToClone);

    this._population = [...survivedPopulation, ...crossedPopulation, ...mutatedPopulation];
  }
}

export class ComposedGeneticSearch<TGenome extends BaseGenome> implements GeneticSearchInterface<TGenome> {
  private readonly eliminators: GeneticSearchInterface<TGenome>[];
  private readonly final: GeneticSearchInterface<TGenome>;

  constructor(config: ComposedGeneticSearchConfig, strategy: StrategyConfig<TGenome>) {
    this.eliminators = [...single.repeat(
      () => new GeneticSearch(config.eliminators, strategy),
      config.final.populationSize,
    )].map((factory) => factory());
    this.final = new GeneticSearch(config.final, strategy);
  }

  public get bestGenome(): TGenome {
    return this.final.bestGenome;
  }

  public get population(): Population<TGenome> {
    const result: Population<TGenome> = [];
    for (const eliminators of this.eliminators) {
      result.push(...eliminators.population);
    }
    return result;
  }

  public set population(population: Population<TGenome>) {
    for (const eliminator of this.eliminators) {
      eliminator.population = population.slice(0, eliminator.population.length);
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

  public async fit(config: GeneticFitConfig): Promise<void> {
    for (let i=0; i<config.generationsCount; i++) {
      const result = await this.step();
      if (config.afterStep) {
        config.afterStep(i, result);
      }
    }
  }

  public async step(): Promise<GenerationScoreColumn> {
    for (const eliminators of this.eliminators) {
      await eliminators.step();
    }

    this.final.population = [...this.final.population, ...this.bestGenomes];
    return await this.final.step();
  }

  protected get bestGenomes(): Population<TGenome> {
    return this.eliminators.map((eliminators) => eliminators.bestGenome);
  }
}
