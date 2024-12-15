import { expect } from '@jest/globals';
import { round } from '../src/utils';

/**
 * Checks if two number arrays are equal with a given precision.
 *
 * @param actual The actual value
 * @param expected The expected value
 * @param precision The precision to round to. Defaults to 10.
 */
export function expectNumberArrayToBeClose(actual: number[], expected: number[], precision: number = 10) {
  actual = actual.map((x) => round(x, precision));
  expected = expected.map((x) => round(x, precision));
  expect(actual).toEqual(expected);
}
