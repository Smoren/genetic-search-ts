import { describe, expect, it } from "@jest/globals";
import { normalizeGradeMatrix, normalizeGradeRow } from "../../src";
// @ts-ignore
import { expectNumberArrayToBeClose } from "../helpers";
import { multi } from "itertools-ts";

describe.each([
  ...dataProviderForNormalizeGradeRow(),
] as Array<[number[], number, number[]]>)(
  'Function normalizeGradeRow Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizeGradeRow(input, mean);
      expectNumberArrayToBeClose(actual, expected);
    });
  },
);

function dataProviderForNormalizeGradeRow(): Array<[number[], number, number[]]> {
  return [
    [
      [0, 0, 0, 0, 0],
      0,
      [0, 0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0, 0],
      1,
      [-1, -1, -1, -1, -1],
    ],
    [
      [0, 0, 0, 0, 0],
      -1,
      [1, 1, 1, 1, 1],
    ],
    [
      [1, 0, 1, 0, 1],
      1,
      [0, -1, 0, -1, 0],
    ],
    // TODO fix:
    // [
    //   [1, 0, 1, 0, 1],
    //   0.5,
    //   [1, -1, 1, -1, 1],
    // ],
    // [
    //   [1, 0, 1, 0, 0.5],
    //   0.5,
    //   [1, -1, 1, -1, 0],
    // ],
  ];
}

describe.each([
  ...dataProviderForNormalizeGradeMatrix(),
] as Array<[number[][], number[], number[][]]>)(
  'Function normalizeGradeMatrix Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizeGradeMatrix(input, mean);
      for (const [rowActual, rowExpected] of multi.zip(actual, expected)) {
        expectNumberArrayToBeClose(rowActual, rowExpected);
      }
    });
  },
);

function dataProviderForNormalizeGradeMatrix(): Array<[number[][], number[], number[][]]> {
  return [
    [
      [],
      [],
      [],
    ],
    [
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
      [0, 0, 0],
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
    ],
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [2, 3, 4],
      [
        [0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5],
      ],
    ],
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [1, 2, 3],
      [
        [0, 0, 0],
        [1, 1, 1],
      ],
    ],
    // TODO fix:
    // [
    //   [
    //     [1, 2, 3],
    //     [3, 4, 5],
    //   ],
    //   [3, 4, 5],
    //   [
    //     [-1, -1, -1],
    //     [0, 0, 0],
    //   ],
    // ],
  ];
}
