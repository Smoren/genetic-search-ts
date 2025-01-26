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
  (input, [filter, maxCount, order], expectedRemoved, expectedKept) => {
    it('', async () => {
      const manager = new ArrayManager(input);
      const removedCount = manager.remove(filter, maxCount, order);
      expect(removedCount).toEqual(expectedRemoved);
      expect(input).toEqual(expectedKept);
    });
  },
);

function dataProviderForArrayManagerRemove(): Array<[any[], [(x: any) => boolean, number?, ('asc' | 'desc')?], any[], any[]]> {
  return [
    [
      [],
      [
        () => false,
      ],
      [],
      [],
    ],
    [
      [],
      [
        () => true,
      ],
      [],
      [],
    ],
    [
      [1, 2, 3, 4, 5],
      [
        () => false,
      ],
      [],
      [1, 2, 3, 4, 5],
    ],
    [
      [1, 2, 3, 4, 5],
      [
        () => true,
      ],
      [1, 2, 3, 4, 5],
      [],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
      ],
      [2, 4, 6, 8],
      [1, 3, 5, 7, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        10,
      ],
      [2, 4, 6, 8],
      [1, 3, 5, 7, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        10,
        'asc',
      ],
      [2, 4, 6, 8],
      [1, 3, 5, 7, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        10,
        'desc',
      ],
      [8, 6, 4, 2],
      [1, 3, 5, 7, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        3,
      ],
      [2, 4, 6],
      [1, 3, 5, 7, 8, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        3,
        'asc',
      ],
      [2, 4, 6],
      [1, 3, 5, 7, 8, 9],
    ],
    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        (x) => x % 2 === 0,
        3,
        'desc',
      ],
      [8, 6, 4],
      [1, 2, 3, 5, 7, 9],
    ],
  ];
}

describe.each([
  ...dataProviderForArrayManagerUpdate(),
])(
  'ArrayManager Update Test',
  (input, [filter, update], expectedUpdated, expectedAll) => {
    it('', async () => {
      const manager = new ArrayManager(input);
      const updatedCount = manager.update(filter, update);
      expect(updatedCount).toEqual(expectedUpdated);
      expect(input).toEqual(expectedAll);
    });
  },
);

function dataProviderForArrayManagerUpdate(): Array<[any[], [(x: any) => boolean, (x: any) => void], any[], any[]]> {
  return [
    [
      [],
      [
        () => false,
        (x: Record<string, any>) => { x['value'] = -1; }
      ],
      [],
      [],
    ],
    [
      [],
      [
        () => true,
        (x: Record<string, any>) => { x['value'] = -1; }
      ],
      [],
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
      [],
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
      [
        { value: -1 },
        { value: -1 },
        { value: -1 },
      ],
      [
        { value: -1 },
        { value: -1 },
        { value: -1 },
      ],
    ],
    [
      [
        { id: 1, value: 1 },
        { id: 2, value: 2 },
        { id: 3, value: 3 },
      ],
      [
        (x: Record<string, any>) => x['value'] % 2 !== 0,
        (x: Record<string, any>) => { x['value'] = -1; }
      ],
      [
        { id: 1, value: -1 },
        { id: 3, value: -1 },
      ],
      [
        { id: 1, value: -1 },
        { id: 2, value: 2 },
        { id: 3, value: -1 },
      ],
    ],
  ];
}
