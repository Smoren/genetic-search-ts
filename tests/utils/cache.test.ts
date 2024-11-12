import { it, expect } from "@jest/globals";
import { AverageMetricsCache, SimpleMetricsCache } from "../../src";

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
});
