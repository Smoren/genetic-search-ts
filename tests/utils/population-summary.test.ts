import { describe, it } from '@jest/globals';
import { BaseGenome, Population, PopulationSummary, PopulationSummaryManager } from '../../src';
import {
  createEmptyGroupedStatSummary, createEmptyRangeStatSummary,
  createEmptyStatSummary,
  roundGroupedStatSummary, roundRangeStatSummary,
  roundStatSummary,
} from '../../src/utils';

describe.each([
  ...dataProviderForPopulationSummaryManager(),
] as Array<[Population<BaseGenome>, PopulationSummary]>)(
  'PopulationSummaryManager Test',
  (sortedPopulation: Population<BaseGenome>, expected: PopulationSummary) => {
    it('', async () => {
      const roundPrecision = 2;
      const summaryManager = new PopulationSummaryManager();

      expect(summaryManager.get()).toEqual({
        ageSummary: createEmptyRangeStatSummary(),
        fitnessSummary: createEmptyStatSummary(),
        groupedFitnessSummary: createEmptyGroupedStatSummary(),
        stagnationCounter: 0,
      });
      expect(summaryManager.getRounded(roundPrecision)).toEqual({
        ageSummary: createEmptyRangeStatSummary(),
        fitnessSummary: createEmptyStatSummary(),
        groupedFitnessSummary: createEmptyGroupedStatSummary(),
        stagnationCounter: 0,
      });

      summaryManager.update(sortedPopulation);

      const summary = summaryManager.getRounded(2);
      expect(roundRangeStatSummary(summary.ageSummary, roundPrecision)).toEqual(expected.ageSummary);
      expect(roundStatSummary(summary.fitnessSummary, roundPrecision)).toEqual(expected.fitnessSummary);
      expect(roundGroupedStatSummary(summary.groupedFitnessSummary, roundPrecision)).toEqual(expected.groupedFitnessSummary);
      expect(summaryManager.getRounded(roundPrecision)).toEqual(summary);

      const oldStagnationCounter = summaryManager.get().stagnationCounter;
      summaryManager.update(sortedPopulation);
      expect(summaryManager.get().stagnationCounter).toEqual(oldStagnationCounter+1);
      expect(summaryManager.getRounded(4).stagnationCounter).toEqual(oldStagnationCounter+1);
    });
  },
);

function dataProviderForPopulationSummaryManager(): Array<[Population<BaseGenome>, PopulationSummary]> {
  return [
    [
      [],
      {
        ageSummary: {
          min: 0,
          mean: 0,
          max: 0,
        },
        fitnessSummary: {
          count: 0,
          best: 0,
          second: 0,
          mean: 0,
          median: 0,
          worst: 0,
        },
        groupedFitnessSummary: {
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
        stagnationCounter: 0,
      },
    ],
    [
      [
        {
          id: 1,
          stats: {
            age: 1,
            fitness: 100,
            phenome: [10],
            origin: 'initial',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
        {
          id: 2,
          stats: {
            age: 1,
            fitness: 90,
            phenome: [9],
            origin: 'crossover',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
        {
          id: 3,
          stats: {
            age: 2,
            fitness: 80,
            phenome: [8],
            origin: 'mutation',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
        {
          id: 4,
          stats: {
            age: 2,
            fitness: 70,
            phenome: [7],
            origin: 'initial',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
        {
          id: 5,
          stats: {
            age: 4,
            fitness: 0,
            phenome: [6],
            origin: 'crossover',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
      ],
      {
        ageSummary: {
          min: 1,
          mean: 2,
          max: 4,
        },
        fitnessSummary: {
          count: 5,
          best: 100,
          second: 90,
          mean: 68,
          median: 80,
          worst: 0,
        },
        groupedFitnessSummary: {
          initial: {
            count: 2,
            best: 100,
            second: 70,
            mean: 85,
            median: 85,
            worst: 70,
          },
          crossover: {
            count: 2,
            best: 90,
            second: 0,
            mean: 45,
            median: 45,
            worst: 0,
          },
          mutation: {
            count: 1,
            best: 80,
            second: 0,
            mean: 80,
            median: 80,
            worst: 80,
          },
        },
        stagnationCounter: 0,
      },
    ],
    [
      [
        {
          id: 1,
          stats: {
            age: 2,
            fitness: 100,
            phenome: [10],
            origin: 'initial',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
        {
          id: 2,
          stats: {
            age: 1,
            fitness: 90,
            phenome: [9],
            origin: 'crossover',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
        {
          id: 3,
          stats: {
            age: 2,
            fitness: 80,
            phenome: [8],
            origin: 'crossover',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
        {
          id: 4,
          stats: {
            age: 4,
            fitness: 70,
            phenome: [7],
            origin: 'initial',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
        {
          id: 5,
          stats: {
            age: 1,
            fitness: 0,
            phenome: [6],
            origin: 'crossover',
            originCounters: {
              crossover: 0,
              mutation: 0,
            },
            parentIds: [],
          },
        },
      ],
      {
        ageSummary: {
          min: 1,
          mean: 2,
          max: 4,
        },
        fitnessSummary: {
          count: 5,
          best: 100,
          second: 90,
          mean: 68,
          median: 80,
          worst: 0,
        },
        groupedFitnessSummary: {
          initial: {
            count: 2,
            best: 100,
            second: 70,
            mean: 85,
            median: 85,
            worst: 70,
          },
          crossover: {
            count: 3,
            best: 90,
            second: 80,
            mean: 56.67,
            median: 80,
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
        stagnationCounter: 0,
      },
    ],
  ];
}
