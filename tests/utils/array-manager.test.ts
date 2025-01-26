import { describe, it } from "@jest/globals";
import { GroupedStatSummary, normalizePhenomeMatrix, normalizePhenomeRow, StatSummary } from "../../src";
// @ts-ignore
import { expectNumberArrayToBeClose } from "../helpers";
import { zip } from "../../src/itertools";
import { ArrayManager, calcStatSummary, roundGroupedStatSummary, roundStatSummary } from "../../src/utils";
import { SchedulerConditionException } from "../../src";

describe.each([
  ...dataProviderForArrayManagerRemove(),
])(
  'ArrayManager Remove Test',
  (input, [filter, maxCount, order], expectedRemovedCount, expected) => {
    it('', async () => {
      const manager = new ArrayManager(input);
      const removedCount = manager.remove(filter, maxCount, order);
      expect(removedCount).toEqual(expectedRemovedCount);
      expect(input).toEqual(expected);
    });
  },
);

function dataProviderForArrayManagerRemove(): Array<[any[], [(x: any) => boolean, number?, ('asc' | 'desc')?], number, any[]]> {
  return [
    [
      [],
      [
        () => false,
      ],
      0,
      [],
    ],
    [
      [],
      [
        () => true,
      ],
      0,
      [],
    ],
    [
      [1, 2, 3, 4, 5],
      [
        () => false,
      ],
      0,
      [1, 2, 3, 4, 5],
    ],
    [
      [1, 2, 3, 4, 5],
      [
        () => true,
      ],
      5,
      [],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
      ],
      4,
      [1, 3, 5, 7, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        10,
      ],
      4,
      [1, 3, 5, 7, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        10,
        'asc',
      ],
      4,
      [1, 3, 5, 7, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        10,
        'desc',
      ],
      4,
      [1, 3, 5, 7, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        3,
      ],
      3,
      [1, 3, 5, 7, 8, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        3,
        'asc',
      ],
      3,
      [1, 3, 5, 7, 8, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        3,
        'desc',
      ],
      3,
      [1, 2, 3, 5, 7, 9],
    ],
  ];
}

describe.each([
  ...dataProviderForArrayManagerUpdate(),
])(
  'ArrayManager Update Test',
  (input, [filter, update], expectedUpdatedCount, expected) => {
    it('', async () => {
      const manager = new ArrayManager(input);
      const updatedCount = manager.update(filter, update);
      expect(updatedCount).toEqual(expectedUpdatedCount);
      expect(input).toEqual(expected);
    });
  },
);

function dataProviderForArrayManagerUpdate(): Array<[any[], [(x: any) => boolean, (x: any) => void], number, any[]]> {
  return [
    [
      [],
      [
        () => false,
        (x: Record<string, any>) => { x['value'] = -1; }
      ],
      0,
      [],
    ],
    [
      [],
      [
        () => true,
        (x: Record<string, any>) => { x['value'] = -1; }
      ],
      0,
      [],
    ],
    [
      [
        { value: 1 },
        { value: 2 },
        { value: 3 },
      ],
      [
        () => false,
        (x: Record<string, any>) => { x['value'] = -1; }
      ],
      0,
      [
        { value: 1 },
        { value: 2 },
        { value: 3 },
      ],
    ],
    [
      [
        { value: 1 },
        { value: 2 },
        { value: 3 },
      ],
      [
        () => true,
        (x: Record<string, any>) => { x['value'] = -1; }
      ],
      3,
      [
        { value: -1 },
        { value: -1 },
        { value: -1 },
      ],
    ],
    [
      [
        { value: 1 },
        { value: 2 },
        { value: 3 },
      ],
      [
        (x: Record<string, any>) => x['value'] % 2 !== 0,
        (x: Record<string, any>) => { x['value'] = -1; }
      ],
      2,
      [
        { value: -1 },
        { value: 2 },
        { value: -1 },
      ],
    ],
  ];
}
