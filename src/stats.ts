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

/**
 * A manager for the statistics of a population of genomes.
 *
 * This class implements the [[GenomeStatsManagerInterface]] interface.
 */
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

  /**
   * Initializes the statistics of a genome.
   *
   * @param genome The genome to initialize.
   * @param origin The origin of the genome.
   */
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

  /**
   * Updates the statistics of a genome.
   *
   * @param genome The genome to update.
   * @param metrics The metrics of the genome.
   * @param fitness The fitness of the genome.
   *
   * @returns The updated genome statistics.
   */
  protected updateItem(genome: BaseGenome, metrics: GenomeMetricsRow, fitness: number): GenomeStats {
    const stats = this.initItem(genome, 'initial');
    stats.age++;
    stats.fitness = fitness;
    stats.metrics = metrics;
    return stats;
  }
}

/**
 * A manager for the population summary.
 *
 * This class implements the [[PopulationSummaryManagerInterface]] interface.
 * It is used to manage the population summary, which is a summary of the
 * statistics of a population of genomes.
 */
export class PopulationSummaryManager implements PopulationSummaryManagerInterface<BaseGenome> {
  /**
   * The summary of the fitness of the population.
   */
  protected fitnessSummary: StatSummary;

  /**
   * The summary of the fitness of the population, grouped by origin.
   */
  protected groupedFitnessSummary: GroupedStatSummary;

  /**
   * The summary of the age of the population.
   */
  protected ageSummary: RangeStatSummary;

  /**
   * The ID of the best genome in the population.
   */
  protected bestGenomeId: number | undefined;

  /**
   * The number of generations since the best genome has changed.
   */
  protected stagnationCounter: number = 0;

  /**
   * Constructs a new population summary manager.
   */
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

  /**
   * Updates the summary of the population.
   *
   * @param sortedStatsCollection The sorted collection of genome statistics.
   */
  protected updateSummary(sortedStatsCollection: GenomeStats[]): void {
    this.fitnessSummary = calcStatSummary(sortedStatsCollection.map((stats) => stats.fitness));
  }

  /**
   * Updates the grouped summary of the population.
   *
   * @param sortedStatsCollection The sorted collection of genome statistics.
   */
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

  /**
   * Updates the summary of the age of the population.
   *
   * @param sortedStatsCollection The sorted collection of genome statistics.
   */
  protected updateAgeSummary(sortedStatsCollection: GenomeStats[]): void {
    const ageCollection = sortedStatsCollection.map((stats) => stats.age);
    this.ageSummary = calcRangeStatSummary(ageCollection);
  }
}
