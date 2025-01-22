import type { GenomePhenomeRow, PhenomeCacheInterface } from "./types";
import { arrayBinaryOperation, createFilledArray } from "./utils";

/**
 * A dummy phenome cache implementation that does nothing.
 *
 * This class is used when the {@link GeneticSearch} is created without a
 * phenome cache.
 *
 * @category Cache
 * @category Strategies
 */
export class DummyPhenomeCache implements PhenomeCacheInterface {
  getReady(_: number): GenomePhenomeRow | undefined {
    return undefined;
  }

  get(_: number, defaultValue?: GenomePhenomeRow): GenomePhenomeRow | undefined {
    return defaultValue;
  }

  set(_: number, __: GenomePhenomeRow): void {
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
 * A simple phenome cache implementation.
 *
 * This cache stores the constant phenome value for each genome.
 *
 * @category Cache
 * @category Strategies
 */
export class SimplePhenomeCache implements PhenomeCacheInterface {
  protected readonly cache: Map<number, GenomePhenomeRow> = new Map();

  get(genomeId: number, defaultValue?: GenomePhenomeRow): GenomePhenomeRow | undefined {
    return this.cache.has(genomeId)
      ? this.cache.get(genomeId)!
      : defaultValue;
  }

  getReady(genomeId: number): GenomePhenomeRow | undefined {
    return this.cache.has(genomeId) ? this.get(genomeId) : undefined;
  }

  set(genomeId: number, phenome: GenomePhenomeRow): void {
    this.cache.set(genomeId, phenome);
  }

  clear(excludeGenomeIds: number[]): void {
    const excludeIdsSet = new Set(excludeGenomeIds);
    for (const id of this.cache.keys()) {
      if (!excludeIdsSet.has(id)) {
        this.cache.delete(id);
      }
    }
  }

  export(): Record<number, GenomePhenomeRow> {
    return Object.fromEntries(this.cache);
  }

  import(data: Record<number, GenomePhenomeRow>): void {
    this.cache.clear();
    for (const [id, cacheItem] of Object.entries(data)) {
      this.cache.set(Number(id), cacheItem);
    }
  }
}

/**
 * A phenome cache implementation that stores the phenome for each genome as a
 * weighted average of all phenome that have been set for that genome.
 *
 * @category Cache
 * @category Strategies
 */
export class AveragePhenomeCache implements PhenomeCacheInterface {
  /**
   * A map of genome IDs to their respective phenome and the number of times they have been set.
   *
   * The key is the genome ID, and the value is an array with two elements. The first element is the
   * current phenome for the genome, and the second element is the number of times the phenome have
   * been set.
   */
  protected readonly cache: Map<number, [GenomePhenomeRow, number]> = new Map();

  get(genomeId: number, defaultValue?: GenomePhenomeRow): GenomePhenomeRow | undefined {
    if (!this.cache.has(genomeId)) {
      return defaultValue;
    }
    const [row, count] = this.cache.get(genomeId)!;
    return row.map((x) => x / count);
  }

  getReady(): GenomePhenomeRow | undefined {
    return undefined;
  }

  set(genomeId: number, phenome: GenomePhenomeRow): void {
    if (!this.cache.has(genomeId)) {
      this.cache.set(genomeId, [phenome, 1]);
      return;
    }

    const [row, count] = this.cache.get(genomeId)!;
    this.cache.set(genomeId, [row.map((x, i) => x + phenome[i]), count + 1]);
  }

  clear(excludeGenomeIds: number[]): void {
    const excludeIdsSet = new Set(excludeGenomeIds);
    for (const id of this.cache.keys()) {
      if (!excludeIdsSet.has(id)) {
        this.cache.delete(id);
      }
    }
  }

  export(): Record<number, [GenomePhenomeRow, number]> {
    return Object.fromEntries(this.cache);
  }

  import(data: Record<number, [GenomePhenomeRow, number]>): void {
    this.cache.clear();
    for (const [id, cacheItem] of Object.entries(data)) {
      this.cache.set(Number(id), cacheItem);
    }
  }
}

/**
 * A phenome cache implementation that stores the phenome for each genome as a
 * weighted average of all phenome that have been set for that genome.
 *
 * The closer the genome age is to 0, the closer the phenome are to the average phenome of the population,
 * which helps to combat outliers for new genomes.
 *
 * @category Cache
 * @category Strategies
 */
export class WeightedAgeAveragePhenomeCache extends AveragePhenomeCache {
  /**
   * The weight factor used for calculating the weighted average.
   */
  private weight: number;

  /**
   * The current average phenome row, or undefined if not yet calculated.
   */
  private averageRow: GenomePhenomeRow | undefined = undefined;

  /**
   * Constructs a new WeightedAgeAveragePhenomeCache.
   * @param weight The weight factor used for calculating the weighted average.
   */
  constructor(weight: number) {
    super();
    this.weight = weight;
  }

  set(genomeId: number, phenome: GenomePhenomeRow): void {
    super.set(genomeId, phenome);
    this.resetAverageRow();
  }

  get(genomeId: number, defaultValue?: GenomePhenomeRow): GenomePhenomeRow | undefined {
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
    const result = createFilledArray(this.getPhenomeCount(), 0);
    for (const phenome of this.cache.values()) {
      const [row, weight] = phenome;
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

  private getPhenomeCount(): number {
    return this.cache.values().next().value![0].length!;
  }
}
