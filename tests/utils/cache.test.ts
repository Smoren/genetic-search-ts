import { it, expect } from "@jest/globals";
import { AverageMetricsCache, DummyMetricsCache, SimpleMetricsCache } from "../../src";

it('Dummy Metrics Cache Test', async () => {
  const cache = new DummyMetricsCache();
  expect(cache.get(1)).toEqual(undefined);
  expect(cache.get(1, undefined)).toEqual(undefined);
  expect(cache.get(1, [1, 2, 3])).toEqual([1, 2, 3]);

  const exported = cache.export();
  expect(exported).toEqual({});

  cache.import(exported);
  expect(cache.get(1)).toEqual(undefined);
  expect(cache.get(2)).toEqual(undefined);
});

it('Simple Metrics Cache Test', async () => {
  const cache = new SimpleMetricsCache();
  expect(cache.get(1)).toEqual(undefined);
  expect(cache.get(1, undefined)).toEqual(undefined);
  expect(cache.get(1, [1, 2, 3])).toEqual([1, 2, 3]);

  cache.set(1, [3, 4, 5]);
  expect(cache.get(1)).toEqual([3, 4, 5]);
  expect(cache.get(1, undefined)).toEqual([3, 4, 5]);
  expect(cache.get(1, [1, 2, 3])).toEqual([3, 4, 5]);

  expect(cache.get(2)).toEqual(undefined);
  expect(cache.get(2, undefined)).toEqual(undefined);
  expect(cache.get(2, [1, 2, 3])).toEqual([1, 2, 3]);

  cache.set(1, [5, 6, 7]);
  expect(cache.get(1)).toEqual([5, 6, 7]);
  expect(cache.get(1, undefined)).toEqual([5, 6, 7]);
  expect(cache.get(1, [1, 2, 3])).toEqual([5, 6, 7]);

  expect(cache.get(2)).toEqual(undefined);
  expect(cache.get(2, undefined)).toEqual(undefined);
  expect(cache.get(2, [1, 2, 3])).toEqual([1, 2, 3]);

  const exported = cache.export();
  expect(exported[1]).toEqual([5, 6, 7]);

  exported[2] = [8, 9, 10];
  cache.import(exported);
  expect(cache.get(1)).toEqual([5, 6, 7]);
  expect(cache.get(2)).toEqual([8, 9, 10]);
});

it('Average Metrics Cache Test', async () => {
  const cache = new AverageMetricsCache();
  expect(cache.get(1)).toEqual(undefined);
  expect(cache.get(1, undefined)).toEqual(undefined);
  expect(cache.get(1, [1, 2, 3])).toEqual([1, 2, 3]);

  cache.set(1, [3, 4, 5]);
  expect(cache.get(1)).toEqual([3, 4, 5]);
  expect(cache.get(1, undefined)).toEqual([3, 4, 5]);
  expect(cache.get(1, [1, 2, 3])).toEqual([3, 4, 5]);

  expect(cache.get(2)).toEqual(undefined);
  expect(cache.get(2, undefined)).toEqual(undefined);
  expect(cache.get(2, [1, 2, 3])).toEqual([1, 2, 3]);

  cache.set(1, [5, 6, 7]);
  expect(cache.get(1)).toEqual([4, 5, 6]);
  expect(cache.get(1, undefined)).toEqual([4, 5, 6]);
  expect(cache.get(1, [1, 2, 3])).toEqual([4, 5, 6]);

  expect(cache.get(2)).toEqual(undefined);
  expect(cache.get(2, undefined)).toEqual(undefined);
  expect(cache.get(2, [1, 2, 3])).toEqual([1, 2, 3]);

  const exported = cache.export();
  expect(exported[1]).toEqual([[8, 10, 12], 2]);

  exported[2] = [[8, 9, 10], 1];
  exported[3] = [[30, 33, 36], 3];
  cache.import(exported);
  expect(cache.get(1)).toEqual([4, 5, 6]);
  expect(cache.get(2)).toEqual([8, 9, 10]);
  expect(cache.get(3)).toEqual([10, 11, 12]);
});
