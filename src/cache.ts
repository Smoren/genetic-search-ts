import type { GenomePhenotypeRow, PhenotypeCacheInterface } from "./types";
import { arrayBinaryOperation, createFilledArray } from "./utils";

/**
 * A dummy phenotype cache implementation that does nothing.
 *
 * This class is used when the {@link GeneticSearch} is created without a
 * phenotype cache.
 *
 * @category Cache
 * @category Strategies
 */
export class DummyPhenotypeCache implements PhenotypeCacheInterface {
  getReady(_: number): GenomePhenotypeRow | undefined {
    return undefined;
  }

  get(_: number, defaultValue?: GenomePhenotypeRow): GenomePhenotypeRow | undefined {
    return defaultValue;
  }

  set(_: number, __: GenomePhenotypeRow): void {
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
 * A simple phenotype cache implementation.
 *
 * This cache stores the constant phenotype value for each genome.
 *
 * @category Cache
 * @category Strategies
 */
export class SimplePhenotypeCache implements PhenotypeCacheInterface {
  protected readonly cache: Map<number, GenomePhenotypeRow> = new Map();

  get(genomeId: number, defaultValue?: GenomePhenotypeRow): GenomePhenotypeRow | undefined {
    return this.cache.has(genomeId)
      ? this.cache.get(genomeId)!
      : defaultValue;
  }

  getReady(genomeId: number): GenomePhenotypeRow | undefined {
    return this.cache.has(genomeId) ? this.get(genomeId) : undefined;
  }

  set(genomeId: number, phenotype: GenomePhenotypeRow): void {
    this.cache.set(genomeId, phenotype);
  }

  clear(excludeGenomeIds: number[]): void {
    const excludeIdsSet = new Set(excludeGenomeIds);
    for (const id of this.cache.keys()) {
      if (!excludeIdsSet.has(id)) {
        this.cache.delete(id);
      }
    }
  }

  export(): Record<number, GenomePhenotypeRow> {
    return Object.fromEntries(this.cache);
  }

  import(data: Record<number, GenomePhenotypeRow>): void {
    this.cache.clear();
    for (const [id, cacheItem] of Object.entries(data)) {
      this.cache.set(Number(id), cacheItem);
    }
  }
}

/**
 * A phenotype cache implementation that stores the phenotype for each genome as a
 * weighted average of all phenotype that have been set for that genome.
 *
 * @category Cache
 * @category Strategies
 */
export class AveragePhenotypeCache implements PhenotypeCacheInterface {
  /**
   * A map of genome IDs to their respective phenotype and the number of times they have been set.
   *
   * The key is the genome ID, and the value is an array with two elements. The first element is the
   * current phenotype for the genome, and the second element is the number of times the phenotype have
   * been set.
   */
  protected readonly cache: Map<number, [GenomePhenotypeRow, number]> = new Map();

  get(genomeId: number, defaultValue?: GenomePhenotypeRow): GenomePhenotypeRow | undefined {
    if (!this.cache.has(genomeId)) {
      return defaultValue;
    }
    const [row, count] = this.cache.get(genomeId)!;
    return row.map((x) => x / count);
  }

  getReady(): GenomePhenotypeRow | undefined {
    return undefined;
  }

  set(genomeId: number, phenotype: GenomePhenotypeRow): void {
    if (!this.cache.has(genomeId)) {
      this.cache.set(genomeId, [phenotype, 1]);
      return;
    }

    const [row, count] = this.cache.get(genomeId)!;
    this.cache.set(genomeId, [row.map((x, i) => x + phenotype[i]), count + 1]);
  }

  clear(excludeGenomeIds: number[]): void {
    const excludeIdsSet = new Set(excludeGenomeIds);
    for (const id of this.cache.keys()) {
      if (!excludeIdsSet.has(id)) {
        this.cache.delete(id);
      }
    }
  }

  export(): Record<number, [GenomePhenotypeRow, number]> {
    return Object.fromEntries(this.cache);
  }

  import(data: Record<number, [GenomePhenotypeRow, number]>): void {
    this.cache.clear();
    for (const [id, cacheItem] of Object.entries(data)) {
      this.cache.set(Number(id), cacheItem);
    }
  }
}

/**
 * A phenotype cache implementation that stores the phenotype for each genome as a
 * weighted average of all phenotype that have been set for that genome.
 *
 * The closer the genome age is to 0, the closer the phenotype are to the average phenotype of the population,
 * which helps to combat outliers for new genomes.
 *
 * @category Cache
 * @category Strategies
 */
export class WeightedAgeAveragePhenotypeCache extends AveragePhenotypeCache {
  /**
   * The weight factor used for calculating the weighted average.
   */
  private weight: number;

  /**
   * The current average phenotype row, or undefined if not yet calculated.
   */
  private averageRow: GenomePhenotypeRow | undefined = undefined;

  /**
   * Constructs a new WeightedAgeAveragePhenotypeCache.
   * @param weight The weight factor used for calculating the weighted average.
   */
  constructor(weight: number) {
    super();
    this.weight = weight;
  }

  set(genomeId: number, phenotype: GenomePhenotypeRow): void {
    super.set(genomeId, phenotype);
    this.resetAverageRow();
  }

  get(genomeId: number, defaultValue?: GenomePhenotypeRow): GenomePhenotypeRow | undefined {
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
    const result = createFilledArray(this.getPhenotypeCount(), 0);
    for (const phenotype of this.cache.values()) {
      const [row, weight] = phenotype;
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

  private getPhenotypeCount(): number {
    return this.cache.values().next().value![0].length!;
  }
}
