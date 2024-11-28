import {
  BaseGenome,
  GenomeStats,
  GenomeStatsManagerInterface,
  GenomeMetricsRow,
  Population,
  GenerationMetricsMatrix,
  GenerationFitnessColumn,
  GenomeOrigin, StatSummary, GroupedStatSummary, PopulationSummaryManagerInterface, PopulationSummary,
} from "./types";
import { zip } from "./itertools";
import {
  calcStatSummary,
  createEmptyGroupedStatSummary,
  createEmptyStatSummary,
  roundGroupedStatSummary,
  roundStatSummary
} from './utils';

export class GenomeStatsManager implements GenomeStatsManagerInterface<BaseGenome> {
  public init(population: Population<BaseGenome>, origin: GenomeOrigin): void {
    for (const genome of population) {
      this.initItem(genome, origin);
    }
  }

  public update(
    population: Population<BaseGenome>,
    metricsMatrix: GenerationMetricsMatrix,
    fitnessColumn: GenerationFitnessColumn,
  ): void {
    for (const [genome, metrics, fitness] of zip(population, metricsMatrix, fitnessColumn)) {
      this.updateItem(genome, metrics, fitness);
    }
  }

  protected initItem(genome: BaseGenome, origin: GenomeOrigin): GenomeStats {
    if (genome.stats !== undefined) {
      return genome.stats;
    }
    genome.stats = {
      fitness: 0,
      age: 0,
      metrics: [],
      origin,
    };
    return genome.stats;
  }

  protected updateItem(genome: BaseGenome, metrics: GenomeMetricsRow, fitness: number): GenomeStats {
    const stats = this.initItem(genome, 'initial');
    stats.age++;
    stats.fitness = fitness;
    stats.metrics = metrics;
    return stats;
  }
}

export class PopulationSummaryManager implements PopulationSummaryManagerInterface<BaseGenome> {
  private _fitnessSummary: StatSummary;
  private _groupedFitnessSummary: GroupedStatSummary;

  constructor() {
    this._fitnessSummary = createEmptyStatSummary();
    this._groupedFitnessSummary = createEmptyGroupedStatSummary();
  }

  public get fitnessSummary(): StatSummary {
    return this._fitnessSummary;
  }

  public get groupedFitnessSummary(): GroupedStatSummary {
    return this._groupedFitnessSummary;
  }

  public getRounded(precision: number): PopulationSummary {
    return {
      fitnessSummary: roundStatSummary(this.fitnessSummary, precision),
      groupedFitnessSummary: roundGroupedStatSummary(this.groupedFitnessSummary, precision),
    };
  }

  public update(sortedPopulation: Population<BaseGenome>): void {
    const statsCollection = sortedPopulation
      .filter((genome) => genome.stats !== undefined)
      .map((genome) => genome.stats!);

    this.updateSummary(statsCollection);
    this.updateGroupedSummary(statsCollection);
  }

  protected updateSummary(sortedStatsCollection: GenomeStats[]): void {
    this._fitnessSummary = calcStatSummary(sortedStatsCollection.map((stats) => stats.fitness));
  }

  protected updateGroupedSummary(sortedStatsCollection: GenomeStats[]): void {
    const initialCollection = sortedStatsCollection.filter((stats) => stats.origin === 'initial');
    const crossoverCollection = sortedStatsCollection.filter((stats) => stats.origin === 'crossover');
    const mutationCollection = sortedStatsCollection.filter((stats) => stats.origin === 'mutation');

    this._groupedFitnessSummary = {
      initial: calcStatSummary(initialCollection.map((stats) => stats.fitness)),
      crossover: calcStatSummary(crossoverCollection.map((stats) => stats.fitness)),
      mutation: calcStatSummary(mutationCollection.map((stats) => stats.fitness)),
    };
  }
}
