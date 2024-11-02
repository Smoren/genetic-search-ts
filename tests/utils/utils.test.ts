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
    [
      [1, 0, 1, 0, 1],
      0.5,
      [1, -1, 1, -1, 1],
    ],
    [
      [1, 0, 1, 0, 0.5],
      0.5,
      [1, -1, 1, -1, 0],
    ],
    [
      [1, 3],
      2,
      [-1, 1],
    ]
  ];
}

describe.each([
  ...dataProviderForNormalizeGradeMatrix(),
] as Array<[number[][], number[], number[][]]>)(
  'Function normalizeGradeMatrix Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizeGradeMatrix(input, mean, false);
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
        [2, 2, 2],
        [2, 2, 2],
      ],
      [0, 0, 0],
      [
        [1, 1, 1],
        [1, 1, 1],
      ],
    ],
    [
      [
        [-2, -2, -2],
        [-2, -2, -2],
      ],
      [0, 0, 0],
      [
        [-1, -1, -1],
        [-1, -1, -1],
      ],
    ],
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [2, 3, 4],
      [
        [-1, -1, -1],
        [1, 1, 1],
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
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [3, 4, 5],
      [
        [-1, -1, -1],
        [0, 0, 0],
      ],
    ],
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [-1, 0, 1],
      [
        [0.5, 0.5, 0.5],
        [1, 1, 1],
      ],
    ],
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [5, 6, 7],
      [
        [-1, -1, -1],
        [-0.5, -0.5, -0.5],
      ],
    ],
  ];
}

describe.each([
  ...dataProviderForNormalizeGradeMatrixWithAbs(),
] as Array<[number[][], number[], number[][]]>)(
  'Function normalizeGradeMatrix With Abs Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizeGradeMatrix(input, mean, true);
      for (const [rowActual, rowExpected] of multi.zip(actual, expected)) {
        expectNumberArrayToBeClose(rowActual, rowExpected);
      }
    });
  },
);

function dataProviderForNormalizeGradeMatrixWithAbs(): Array<[number[][], number[], number[][]]> {
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
        [2, 2, 2],
        [2, 2, 2],
      ],
      [0, 0, 0],
      [
        [1, 1, 1],
        [1, 1, 1],
      ],
    ],
    [
      [
        [-2, -2, -2],
        [-2, -2, -2],
      ],
      [0, 0, 0],
      [
        [1, 1, 1],
        [1, 1, 1],
      ],
    ],
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [2, 3, 4],
      [
        [1, 1, 1],
        [1, 1, 1],
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
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [3, 4, 5],
      [
        [1, 1, 1],
        [0, 0, 0],
      ],
    ],
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [-1, 0, 1],
      [
        [0.5, 0.5, 0.5],
        [1, 1, 1],
      ],
    ],
    [
      [
        [1, 2, 3],
        [3, 4, 5],
      ],
      [5, 6, 7],
      [
        [1, 1, 1],
        [0.5, 0.5, 0.5],
      ],
    ],
  ];
}
