import { expect } from '@jest/globals';

export function round(value: number, precision: number): number {
  return Number(value.toFixed(precision));
}

export function expectNumberArrayToBeClose(actual: number[], expected: number[], precision: number = 10) {
  actual = actual.map((x) => round(x, precision));
  expected = expected.map((x) => round(x, precision));
  expect(actual).toEqual(expected);
}
