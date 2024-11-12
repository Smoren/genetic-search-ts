import { BaseGenome, GenomeMetricsRow, MetricsCacheInterface } from "./types";

export class DummyMetricsCache<TGenome extends BaseGenome> implements MetricsCacheInterface<TGenome> {
  get(genome: TGenome): GenomeMetricsRow {
    throw new Error(`Genome with id ${genome.id} not found in cache`);
  }

  ready(): boolean {
    return false;
  }

  set(): void {
    return;
  }

  clear(): void {
    return;
  }
}

export class SimpleMetricsCache<TGenome extends BaseGenome> implements MetricsCacheInterface<TGenome> {
  protected readonly cache: Map<number, GenomeMetricsRow> = new Map();

  get(genome: TGenome): GenomeMetricsRow {
    if (!this.cache.has(genome.id)) {
      throw new Error(`Genome with id ${genome.id} not found in cache`);
    }
    return this.cache.get(genome.id)!;
  }

  ready(genome: TGenome): boolean {
    return this.cache.has(genome.id);
  }

  set(genome: TGenome, metrics: GenomeMetricsRow): void {
    this.cache.set(genome.id, metrics);
  }

  clear(exclude: TGenome[]): void {
    const excludeIdsSet = new Set(exclude.map((genome) => genome.id));
    for (const id of this.cache.keys()) {
      if (!excludeIdsSet.has(id)) {
        this.cache.delete(id);
      }
    }
  }
}

export class AverageMetricsCache<TGenome extends BaseGenome> implements MetricsCacheInterface<TGenome> {
  protected readonly cache: Map<number, [GenomeMetricsRow, number]> = new Map();

  get(genome: TGenome): GenomeMetricsRow {
    if (!this.cache.has(genome.id)) {
      throw new Error(`Genome with id ${genome.id} not found in cache`);
    }
    const [row, count] = this.cache.get(genome.id)!;
    return row.map((x) => x / count);
  }

  ready(): boolean {
    return false;
  }

  set(genome: TGenome, metrics: GenomeMetricsRow): void {
    if (!this.cache.has(genome.id)) {
      this.cache.set(genome.id, [metrics, 1]);
      return;
    }

    const [row, count] = this.cache.get(genome.id)!;
    this.cache.set(genome.id, [row.map((x, i) => x + metrics[i]), count + 1]);
  }

  clear(exclude: TGenome[]): void {
    const excludeIdsSet = new Set(exclude.map((genome) => genome.id));
    for (const id of this.cache.keys()) {
      if (!excludeIdsSet.has(id)) {
        this.cache.delete(id);
      }
    }
  }
}
