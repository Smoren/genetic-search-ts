import type {
  BaseGenome,
  GenomeStats,
  GenomeStatsManagerInterface,
  GenomeMetricsRow,
  Population,
  GenerationMetricsMatrix,
  GenerationFitnessColumn,
  GenomeOrigin,
  StatSummary,
  GroupedStatSummary,
  PopulationSummaryManagerInterface,
  PopulationSummary,
  RangeStatSummary,
} from "./types";
import { zip } from "./itertools";
import {
  calcRangeStatSummary,
  calcStatSummary,
  createEmptyGroupedStatSummary,
  createEmptyRangeStatSummary,
  createEmptyStatSummary,
  fullCopyObject,
  roundGroupedStatSummary,
  roundRangeStatSummary,
  roundStatSummary,
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
  protected fitnessSummary: StatSummary;
  protected groupedFitnessSummary: GroupedStatSummary;
  protected ageSummary: RangeStatSummary;
  protected bestGenomeId: number | undefined;
  protected stagnationCounter: number = 0;

  constructor() {
    this.fitnessSummary = createEmptyStatSummary();
    this.groupedFitnessSummary = createEmptyGroupedStatSummary();
    this.ageSummary = createEmptyRangeStatSummary();
  }

  public get(): PopulationSummary {
    return {
      fitnessSummary: fullCopyObject(this.fitnessSummary),
      groupedFitnessSummary: fullCopyObject(this.groupedFitnessSummary),
      ageSummary: fullCopyObject(this.ageSummary),
      stagnationCounter: this.stagnationCounter,
    };
  }

  public getRounded(precision: number): PopulationSummary {
    return {
      fitnessSummary: roundStatSummary(this.fitnessSummary, precision),
      groupedFitnessSummary: roundGroupedStatSummary(this.groupedFitnessSummary, precision),
      ageSummary: roundRangeStatSummary(this.ageSummary, precision),
      stagnationCounter: this.stagnationCounter,
    };
  }

  public update(sortedPopulation: Population<BaseGenome>): void {
    const bestGenomeId = sortedPopulation[0]?.id;

    if (this.bestGenomeId !== bestGenomeId) {
      this.bestGenomeId = bestGenomeId;
      this.stagnationCounter = 0;
    } else {
      this.stagnationCounter++;
    }

    const statsCollection = sortedPopulation
      .filter((genome) => genome.stats !== undefined)
      .map((genome) => genome.stats!);

    this.updateSummary(statsCollection);
    this.updateGroupedSummary(statsCollection);
    this.updateAgeSummary(statsCollection);
  }

  protected updateSummary(sortedStatsCollection: GenomeStats[]): void {
    this.fitnessSummary = calcStatSummary(sortedStatsCollection.map((stats) => stats.fitness));
  }

  protected updateGroupedSummary(sortedStatsCollection: GenomeStats[]): void {
    const initialCollection = sortedStatsCollection.filter((stats) => stats.origin === 'initial');
    const crossoverCollection = sortedStatsCollection.filter((stats) => stats.origin === 'crossover');
    const mutationCollection = sortedStatsCollection.filter((stats) => stats.origin === 'mutation');

    this.groupedFitnessSummary = {
      initial: calcStatSummary(initialCollection.map((stats) => stats.fitness)),
      crossover: calcStatSummary(crossoverCollection.map((stats) => stats.fitness)),
      mutation: calcStatSummary(mutationCollection.map((stats) => stats.fitness)),
    };
  }

  protected updateAgeSummary(sortedStatsCollection: GenomeStats[]): void {
    const ageCollection = sortedStatsCollection.map((stats) => stats.age);
    this.ageSummary = calcRangeStatSummary(ageCollection);
  }
}
