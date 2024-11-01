import { multi, single } from "itertools-ts";
import {
  GeneticSearchConfig,
  StrategyConfig,
  GeneticSearchInterface,
  GenerationScoreColumn,
  Population,
  BaseGenome,
  NextIdGetter, GeneticFitConfig,
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

  public getBestGenome(): TGenome {
    return this._population[0];
  }

  public getPopulation(): Population<TGenome> {
    return this._population;
  }

  public setPopulation(population: Population<TGenome>) {
    this._population = population;
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
    const [countToSurvive, countToCross, countToClone] = this.getSizes();

    const survivedPopulation = sortedPopulation.slice(0, countToSurvive);
    const crossedPopulation = this.crossover(survivedPopulation, countToCross);
    const mutatedPopulation = this.clone(survivedPopulation, countToClone);

    this._population = [...survivedPopulation, ...crossedPopulation, ...mutatedPopulation];
  }

  protected getSizes(): [number, number, number] {
    const countToSurvive = Math.round(this.config.populationSize * this.config.survivalRate);
    const countToDie = this.config.populationSize - countToSurvive;

    const countToCross = Math.round(countToDie * this.config.crossoverRate);
    const countToClone = countToDie - countToCross;

    return [countToSurvive, countToCross, countToClone];
  }
}

export class ComposedGeneticSearch<TGenome extends BaseGenome> implements GeneticSearchInterface<TGenome> {
  private readonly eliminators: GeneticSearchInterface<TGenome>[];
  private readonly final: GeneticSearchInterface<TGenome>;

  constructor(eliminators: GeneticSearchInterface<TGenome>[], final: GeneticSearchInterface<TGenome>) {
    this.eliminators = eliminators;
    this.final = final;
  }

  public getPopulation(): Population<TGenome> {
    const result: Population<TGenome> = [];
    for (const eliminators of this.eliminators) {
      result.push(...eliminators.getPopulation());
    }
    return result;
  }

  public setPopulation(population: Population<TGenome>): void {
    for (const eliminator of this.eliminators) {
      eliminator.setPopulation(population.slice(0, eliminator.getPopulation().length));
      population = population.slice(eliminator.getPopulation().length);
    }
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
    this.final.setPopulation(this.getBestGenomes());
    return await this.final.step();
  }

  public getBestGenome(): TGenome {
    return this.final.getBestGenome();
  }

  private getBestGenomes(): Population<TGenome> {
    return this.eliminators.map((eliminators) => eliminators.getBestGenome());
  }
}
