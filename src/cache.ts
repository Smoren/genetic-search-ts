import type { GenomeMetricsRow, MetricsCacheInterface } from "./types";
import { arrayBinaryOperation, createFilledArray } from "./utils";

/**
 * A dummy metrics cache implementation that does nothing.
 *
 * This class is used when the {@link GeneticSearch} is created without a
 * metrics cache.
 */
export class DummyMetricsCache implements MetricsCacheInterface {
  getReady(_: number): GenomeMetricsRow | undefined {
    return undefined;
  }

  get(_: number, defaultValue?: GenomeMetricsRow): GenomeMetricsRow | undefined {
    return defaultValue;
  }

  set(_: number, __: GenomeMetricsRow): void {
    return;
  }

  clear(_: number[]): void {
    return;
  }

  export(): Record<number, never> {
    return {};
  }

  import(_: Record<number, never>): void {
    return;
  }
}

/**
 * A simple metrics cache implementation.
 *
 * This cache stores the constant metrics value for each genome.
 *
 * @implements {MetricsCacheInterface}
 */
export class SimpleMetricsCache implements MetricsCacheInterface {
  protected readonly cache: Map<number, GenomeMetricsRow> = new Map();

  get(genomeId: number, defaultValue?: GenomeMetricsRow): GenomeMetricsRow | undefined {
    return this.cache.has(genomeId)
      ? this.cache.get(genomeId)!
      : defaultValue;
  }

  getReady(genomeId: number): GenomeMetricsRow | undefined {
    return this.cache.has(genomeId) ? this.get(genomeId) : undefined;
  }

  set(genomeId: number, metrics: GenomeMetricsRow): void {
    this.cache.set(genomeId, metrics);
  }

  clear(excludeGenomeIds: number[]): void {
    const excludeIdsSet = new Set(excludeGenomeIds);
    for (const id of this.cache.keys()) {
      if (!excludeIdsSet.has(id)) {
        this.cache.delete(id);
      }
    }
  }

  export(): Record<number, GenomeMetricsRow> {
    return Object.fromEntries(this.cache);
  }

  import(data: Record<number, GenomeMetricsRow>): void {
    this.cache.clear();
    for (const [id, cacheItem] of Object.entries(data)) {
      this.cache.set(Number(id), cacheItem);
    }
  }
}

/**
 * A metrics cache implementation that stores the metrics for each genome as a
 * weighted average of all metrics that have been set for that genome.
 *
 * @implements {MetricsCacheInterface}
 */
export class AverageMetricsCache implements MetricsCacheInterface {
  /**
   * A map of genome IDs to their respective metrics and the number of times they have been set.
   *
   * The key is the genome ID, and the value is an array with two elements. The first element is the
   * current metrics for the genome, and the second element is the number of times the metrics have
   * been set.
   */
  protected readonly cache: Map<number, [GenomeMetricsRow, number]> = new Map();

  get(genomeId: number, defaultValue?: GenomeMetricsRow): GenomeMetricsRow | undefined {
    if (!this.cache.has(genomeId)) {
      return defaultValue;
    }
    const [row, count] = this.cache.get(genomeId)!;
    return row.map((x) => x / count);
  }

  getReady(): GenomeMetricsRow | undefined {
    return undefined;
  }

  set(genomeId: number, metrics: GenomeMetricsRow): void {
    if (!this.cache.has(genomeId)) {
      this.cache.set(genomeId, [metrics, 1]);
      return;
    }

    const [row, count] = this.cache.get(genomeId)!;
    this.cache.set(genomeId, [row.map((x, i) => x + metrics[i]), count + 1]);
  }

  clear(excludeGenomeIds: number[]): void {
    const excludeIdsSet = new Set(excludeGenomeIds);
    for (const id of this.cache.keys()) {
      if (!excludeIdsSet.has(id)) {
        this.cache.delete(id);
      }
    }
  }

  export(): Record<number, [GenomeMetricsRow, number]> {
    return Object.fromEntries(this.cache);
  }

  import(data: Record<number, [GenomeMetricsRow, number]>): void {
    this.cache.clear();
    for (const [id, cacheItem] of Object.entries(data)) {
      this.cache.set(Number(id), cacheItem);
    }
  }
}

/**
 * A metrics cache implementation that stores the metrics for each genome as a
 * weighted average of all metrics that have been set for that genome.
 *
 * The closer the genome age is to 0, the closer the metrics are to the average metrics of the population,
 * which helps to combat outliers for new genomes.
 *
 * @implements {MetricsCacheInterface}
 */
export class WeightedAgeAverageMetricsCache extends AverageMetricsCache {
  /**
   * The weight factor used for calculating the weighted average.
   */
  private weight: number;

  /**
   * The current average metrics row, or undefined if not yet calculated.
   */
  private averageRow: GenomeMetricsRow | undefined = undefined;

  /**
   * Constructs a new WeightedAgeAverageMetricsCache.
   * @param weight The weight factor used for calculating the weighted average.
   */
  constructor(weight: number) {
    super();
    this.weight = weight;
  }

  set(genomeId: number, metrics: GenomeMetricsRow): void {
    super.set(genomeId, metrics);
    this.resetAverageRow();
  }

  get(genomeId: number, defaultValue?: GenomeMetricsRow): GenomeMetricsRow | undefined {
    const row = super.get(genomeId, defaultValue);
    if (row === undefined) {
      return undefined;
    }

    if (!this.refreshAverageRow()) {
      return row;
    }

    const [, age] = this.cache.get(genomeId)!;
    const averageDiff = arrayBinaryOperation(row, this.averageRow!, (lhs, rhs) => lhs - rhs);
    const weightedAverageDiff = averageDiff.map((x) => x * this.weight/age);

    return arrayBinaryOperation(row, weightedAverageDiff, (lhs, rhs) => lhs - rhs);
  }

  private refreshAverageRow(): boolean {
    if (this.cache.size === 0) {
      this.resetAverageRow();
      return false;
    }

    let weightedTotal = 0;
    const result = createFilledArray(this.getMetricsCount(), 0);
    for (const metrics of this.cache.values()) {
      const [row, weight] = metrics;
      for (let i = 0; i < row.length; ++i) {
        result[i] += row[i];
      }
      weightedTotal += weight;
    }

    this.averageRow = result.map((x) => x / weightedTotal);

    return true;
  }

  private resetAverageRow(): void {
    this.averageRow = undefined;
  }

  private getMetricsCount(): number {
    return this.cache.values().next().value![0].length!;
  }
}
