import { it, expect } from "@jest/globals";
import { AveragePhenotypeCache, DummyPhenotypeCache, SimplePhenotypeCache, WeightedAgeAveragePhenotypeCache } from "../../src";
// @ts-ignore
import { expectNumberArrayToBeClose } from "../helpers";

it('Dummy Phenotype Cache Test', async () => {
  const cache = new DummyPhenotypeCache();
  expect(cache.get(1)).toEqual(undefined);
  expect(cache.get(1, undefined)).toEqual(undefined);
  expect(cache.get(1, [1, 2, 3])).toEqual([1, 2, 3]);

  const exported = cache.export();
  expect(exported).toEqual({});

  cache.import(exported);
  expect(cache.get(1)).toEqual(undefined);
  expect(cache.get(2)).toEqual(undefined);
});

it('Simple Phenotype Cache Test', async () => {
  const cache = new SimplePhenotypeCache();
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

it('Average Phenotype Cache Test', async () => {
  const cache = new AveragePhenotypeCache();
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

it('Weighted Age Average Phenotype Cache Test', async () => {
  {
    const cache = new WeightedAgeAveragePhenotypeCache(0.5);

    expect(cache.get(1)).toEqual(undefined);
    expect(cache.get(1, undefined)).toEqual(undefined);
    expect(cache.get(1, [1, 2, 3])).toEqual([1, 2, 3]);

    cache.set(1, [3, 4, 5]);
    expect(cache.get(1)).toEqual([3, 4, 5]);
    expect(cache.get(1, undefined)).toEqual([3, 4, 5]);
    expect(cache.get(1, [1, 2, 3])).toEqual([3, 4, 5]);
  }
  {
    const cache = new WeightedAgeAveragePhenotypeCache(0.5);

    cache.set(1, [1, 2, 3]);
    expect(cache.get(1)).toEqual([1, 2, 3]);

    cache.set(1, [1, 2, 3]);
    expect(cache.get(1)).toEqual([1, 2, 3]);

    cache.set(1, [4, 5, 6]);
    expect(cache.get(1)).toEqual([2, 3, 4]);
  }
  {
    const cache = new WeightedAgeAveragePhenotypeCache(0.5);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [1, 2, 3]);
    expect(cache.get(1)).toEqual([1, 2, 3]);
    expect(cache.get(2)).toEqual([1, 2, 3]);

    cache.set(1, [3, 4, 5]);
    cache.set(2, [3, 4, 5]);
    expect(cache.get(1)).toEqual([2, 3, 4]);
    expect(cache.get(2)).toEqual([2, 3, 4]);
  }
  {
    const cache = new WeightedAgeAveragePhenotypeCache(0.5);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [1, 2, 3]);
    expect(cache.get(1)).toEqual([1, 2, 3]);
    expect(cache.get(2)).toEqual([1, 2, 3]);

    cache.set(1, [1, 2, 3]);
    expect(cache.get(1)).toEqual([1, 2, 3]);
    expect(cache.get(2)).toEqual([1, 2, 3]);

    cache.set(2, [1, 2, 3]);
    expect(cache.get(1)).toEqual([1, 2, 3]);
    expect(cache.get(2)).toEqual([1, 2, 3]);
  }
  {
    const cache = new WeightedAgeAveragePhenotypeCache(0.5);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [5, 6, 7]);
    expectNumberArrayToBeClose(cache.get(1)!, [2, 3, 4]);
    expectNumberArrayToBeClose(cache.get(2)!, [4, 5, 6]);

    cache.set(1, [1, 2, 3]);
    cache.set(1, [1, 2, 3]);
    cache.set(1, [1, 2, 3]);
    expect(cache.get(1)).toEqual([1.1, 2.1, 3.1]);
    expect(cache.get(2)).toEqual([3.4, 4.4, 5.4]);
  }
  {
    const cache = new WeightedAgeAveragePhenotypeCache(0.5);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [5, 6, 7]);
    expectNumberArrayToBeClose(cache.get(1)!, [2, 3, 4]);
    expectNumberArrayToBeClose(cache.get(2)!, [4, 5, 6]);

    for (let i = 0; i < 100000; i++) {
      cache.set(1, [1 + (0.5 - Math.random()), 2 + (0.5 - Math.random()), 3 + (0.5 - Math.random())]);
    }
    expectNumberArrayToBeClose(cache.get(1)!, [1, 2, 3], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [3, 4, 5], 2);

    cache.set(3, [1, 2, 3]);
    expectNumberArrayToBeClose(cache.get(1)!, [1, 2, 3], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [3, 4, 5], 2);
    expectNumberArrayToBeClose(cache.get(3)!, [1, 2, 3], 2);
  }
  {
    const cache = new WeightedAgeAveragePhenotypeCache(0.5);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [5, 6, 7]);
    expectNumberArrayToBeClose(cache.get(1)!, [2, 3, 4]);
    expectNumberArrayToBeClose(cache.get(2)!, [4, 5, 6]);

    for (let i = 0; i < 100000; i++) {
      cache.set(1, [0 + (0.5 - Math.random()), 1 + (0.5 - Math.random()), 2 + (0.5 - Math.random())]);
      cache.set(1, [2 + (0.5 - Math.random()), 3 + (0.5 - Math.random()), 4 + (0.5 - Math.random())]);
    }
    expectNumberArrayToBeClose(cache.get(1)!, [1, 2, 3], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [3, 4, 5], 2);

    cache.set(3, [1, 2, 3]);
    expectNumberArrayToBeClose(cache.get(1)!, [1, 2, 3], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [3, 4, 5], 2);
    expectNumberArrayToBeClose(cache.get(3)!, [1, 2, 3], 2);
  }
  {
    const cache = new WeightedAgeAveragePhenotypeCache(0.5);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [2, 3, 4]);

    for (let i = 0; i < 100000; i++) {
      cache.set(2, [2 + (0.5 - Math.random()), 3 + (0.5 - Math.random()), 4 + (0.5 - Math.random())]);
    }
    expectNumberArrayToBeClose(cache.get(1)!, [1.5, 2.5, 3.5], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [2, 3, 4], 2);

    cache.set(3, [1, 2, 3]);
    expectNumberArrayToBeClose(cache.get(1)!, [1.5, 2.5, 3.5], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [2, 3, 4], 2);
    expectNumberArrayToBeClose(cache.get(3)!, [1.5, 2.5, 3.5], 2);

    for (let i = 0; i < 100000; i++) {
      cache.set(1, [1 + (0.5 - Math.random()), 2 + (0.5 - Math.random()), 3 + (0.5 - Math.random())]);
    }
    expectNumberArrayToBeClose(cache.get(1)!, [1, 2, 3], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [2, 3, 4], 2);
    expectNumberArrayToBeClose(cache.get(3)!, [1.25, 2.25, 3.25], 2);
  }
  {
    const cache = new WeightedAgeAveragePhenotypeCache(1);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [3, 4, 5]);

    expectNumberArrayToBeClose(cache.get(1)!, [2, 3, 4], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [2, 3, 4], 2);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [3, 4, 5]);

    expectNumberArrayToBeClose(cache.get(1)!, [1.5, 2.5, 3.5], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [2.5, 3.5, 4.5], 2);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [3, 4, 5]);

    cache.set(1, [1, 2, 3]);
    cache.set(2, [3, 4, 5]);

    expectNumberArrayToBeClose(cache.get(1)!, [1.25, 2.25, 3.25], 2);
    expectNumberArrayToBeClose(cache.get(2)!, [2.75, 3.75, 4.75], 2);
  }
});
