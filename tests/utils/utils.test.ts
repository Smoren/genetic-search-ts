import { describe, it } from "@jest/globals";
import { GroupedStatSummary, normalizePhenotypeMatrix, normalizePhenotypeRow, StatSummary } from "../../src";
// @ts-ignore
import { expectNumberArrayToBeClose } from "../helpers";
import { zip } from "../../src/itertools";
import { calcStatSummary, roundGroupedStatSummary, roundStatSummary } from '../../src/utils';

describe.each([
  ...dataProviderForNormalizePhenotypeRow(),
] as Array<[number[], number, number[]]>)(
  'Function normalizePhenotypeRow Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizePhenotypeRow(input, mean);
      expectNumberArrayToBeClose(actual, expected);
    });
  },
);

function dataProviderForNormalizePhenotypeRow(): Array<[number[], number, number[]]> {
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
  ...dataProviderForNormalizePhenotypeMatrix(),
] as Array<[number[][], number[], number[][]]>)(
  'Function normalizePhenotypeMatrix Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizePhenotypeMatrix(input, mean, false);
      for (const [rowActual, rowExpected] of zip(actual, expected)) {
        expectNumberArrayToBeClose(rowActual, rowExpected);
      }
    });
  },
);

function dataProviderForNormalizePhenotypeMatrix(): Array<[number[][], number[], number[][]]> {
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
  ...dataProviderForNormalizePhenotypeMatrixWithAbs(),
] as Array<[number[][], number[], number[][]]>)(
  'Function normalizePhenotypeMatrix With Abs Test',
  (input, mean, expected) => {
    it('', async () => {
      const actual = normalizePhenotypeMatrix(input, mean, true);
      for (const [rowActual, rowExpected] of zip(actual, expected)) {
        expectNumberArrayToBeClose(rowActual, rowExpected);
      }
    });
  },
);

function dataProviderForNormalizePhenotypeMatrixWithAbs(): Array<[number[][], number[], number[][]]> {
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

describe.each([
  ...dataProviderForCalcStatSummary(),
] as Array<[number[], StatSummary]>)(
  'Function calcStatSummary Test',
  (sortedSource, expected) => {
    it('', async () => {
      const actual = roundStatSummary(calcStatSummary(sortedSource), 4);
      expect(actual).toEqual(expected);
    });
  },
);

function dataProviderForCalcStatSummary(): Array<[number[], StatSummary]> {
  return [
    [
      [],
      {
        count: 0,
        best: 0,
        second: 0,
        mean: 0,
        median: 0,
        worst: 0,
      }
    ],
    [
      [1, 2, 3, 4, 5],
      {
        count: 5,
        best: 1,
        second: 2,
        mean: 3,
        median: 3,
        worst: 5,
      }
    ],
    [
      [1, 2, 3, 4],
      {
        count: 4,
        best: 1,
        second: 2,
        mean: 2.5,
        median: 2.5,
        worst: 4,
      }
    ],
  ];
}

describe.each([
  ...dataProviderForRoundGroupedStatSummary(),
] as Array<[GroupedStatSummary, GroupedStatSummary]>)(
  'Function roundGroupedStatSummary Test',
  (input, expected) => {
    it('', async () => {
      const actual = roundGroupedStatSummary(input, 2);
      expect(actual).toEqual(expected);
    });
  },
);

function dataProviderForRoundGroupedStatSummary(): Array<[GroupedStatSummary, GroupedStatSummary]> {
  return [
    [
      {
        initial: {
          count: 0,
          best: 0,
          second: 0,
          mean: 0,
          median: 0,
          worst: 0,
        },
        crossover: {
          count: 0,
          best: 0,
          second: 0,
          mean: 0,
          median: 0,
          worst: 0,
        },
        mutation: {
          count: 0,
          best: 0,
          second: 0,
          mean: 0,
          median: 0,
          worst: 0,
        },
      },
      {
        initial: {
          count: 0,
          best: 0,
          second: 0,
          mean: 0,
          median: 0,
          worst: 0,
        },
        crossover: {
          count: 0,
          best: 0,
          second: 0,
          mean: 0,
          median: 0,
          worst: 0,
        },
        mutation: {
          count: 0,
          best: 0,
          second: 0,
          mean: 0,
          median: 0,
          worst: 0,
        },
      },
    ],
    [
      {
        initial: {
          count: 10,
          best: 6.6666,
          second: 5.5555,
          mean: 4.4444,
          median: 3.3333,
          worst: 2.2222,
        },
        crossover: {
          count: 6,
          best: 5.5555,
          second: 4.4444,
          mean: 3.3333,
          median: 2.2222,
          worst: 1.1111,
        },
        mutation: {
          count: 3,
          best: 7.7777,
          second: 6.6666,
          mean: 5.5555,
          median: 4.4444,
          worst: 3.3333,
        },
      },
      {
        initial: {
          count: 10,
          best: 6.67,
          second: 5.56,
          mean: 4.44,
          median: 3.33,
          worst: 2.22,
        },
        crossover: {
          count: 6,
          best: 5.56,
          second: 4.44,
          mean: 3.33,
          median: 2.22,
          worst: 1.11,
        },
        mutation: {
          count: 3,
          best: 7.78,
          second: 6.67,
          mean: 5.56,
          median: 4.44,
          worst: 3.33,
        },
      },
    ],
  ];
}
