import { expect } from '@jest/globals';
import { round } from '../src/utils';

export function expectNumberArrayToBeClose(actual: number[], expected: number[], precision: number = 10) {
  actual = actual.map((x) => round(x, precision));
  expected = expected.map((x) => round(x, precision));
  expect(actual).toEqual(expected);
}
