import { GenomeMetricsRow, MetricsCacheInterface } from "./types";

export class DummyMetricsCache implements MetricsCacheInterface {
  ready(_: number): GenomeMetricsRow | undefined {
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

export class SimpleMetricsCache implements MetricsCacheInterface {
  protected readonly cache: Map<number, GenomeMetricsRow> = new Map();

  get(genomeId: number, defaultValue?: GenomeMetricsRow): GenomeMetricsRow | undefined {
    return this.cache.has(genomeId)
      ? this.cache.get(genomeId)!
      : defaultValue;
  }

  ready(genomeId: number): GenomeMetricsRow | undefined {
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

export class AverageMetricsCache implements MetricsCacheInterface {
  protected readonly cache: Map<number, [GenomeMetricsRow, number]> = new Map();

  get(genomeId: number, defaultValue?: GenomeMetricsRow): GenomeMetricsRow | undefined {
    if (!this.cache.has(genomeId)) {
      return defaultValue;
    }
    const [row, count] = this.cache.get(genomeId)!;
    return row.map((x) => x / count);
  }

  ready(): GenomeMetricsRow | undefined {
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
