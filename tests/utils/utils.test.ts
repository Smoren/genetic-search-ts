import { describe, it } from "@jest/globals";
import { normalizeMetricsMatrix, normalizeMetricsRow } from "../../src";
// @ts-ignore
import { expectNumberArrayToBeClose } from "../helpers";
import { zip } from "../../src/itertools";

describe.each([
  ...dataProviderForNormalizeMetricsRow(),
] as Array<[number[], number, number[]]>)(
  'Function normalizeMetricsRow Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizeMetricsRow(input, mean);
      expectNumberArrayToBeClose(actual, expected);
    });
  },
);

function dataProviderForNormalizeMetricsRow(): Array<[number[], number, number[]]> {
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
  ...dataProviderForNormalizeMetricsMatrix(),
] as Array<[number[][], number[], number[][]]>)(
  'Function normalizeMetricsMatrix Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizeMetricsMatrix(input, mean, false);
      for (const [rowActual, rowExpected] of zip(actual, expected)) {
        expectNumberArrayToBeClose(rowActual, rowExpected);
      }
    });
  },
);

function dataProviderForNormalizeMetricsMatrix(): Array<[number[][], number[], number[][]]> {
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
  ...dataProviderForNormalizeMetricsMatrixWithAbs(),
] as Array<[number[][], number[], number[][]]>)(
  'Function normalizeMetricsMatrix With Abs Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizeMetricsMatrix(input, mean, true);
      for (const [rowActual, rowExpected] of zip(actual, expected)) {
        expectNumberArrayToBeClose(rowActual, rowExpected);
      }
    });
  },
);

function dataProviderForNormalizeMetricsMatrixWithAbs(): Array<[number[][], number[], number[][]]> {
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
