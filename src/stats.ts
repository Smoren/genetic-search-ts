import type {
  BaseGenome,
  GenomeStats,
  GenomeStatsManagerInterface,
  GenomeMetricsRow,
  Population,
  GenerationMetricsMatrix,
  GenerationFitnessColumn,
  GenomeOrigin,
} from "./types";
import { zip } from "./itertools";

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
