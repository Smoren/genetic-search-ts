import { describe, it } from '@jest/globals';
import { BaseGenome, Population, PopulationSummary, PopulationSummaryManager } from '../../src';
import {
  createEmptyGroupedStatSummary,
  createEmptyStatSummary,
  roundGroupedStatSummary,
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
        fitnessSummary: createEmptyStatSummary(),
        groupedFitnessSummary: createEmptyGroupedStatSummary(),
      });
      expect(summaryManager.getRounded(roundPrecision)).toEqual({
        fitnessSummary: createEmptyStatSummary(),
        groupedFitnessSummary: createEmptyGroupedStatSummary(),
      });

      summaryManager.update(sortedPopulation);

      const summary = summaryManager.getRounded(2);
      expect(roundStatSummary(summary.fitnessSummary, roundPrecision)).toEqual(expected.fitnessSummary);
      expect(roundGroupedStatSummary(summary.groupedFitnessSummary, roundPrecision)).toEqual(expected.groupedFitnessSummary);
      expect(summaryManager.getRounded(roundPrecision)).toEqual(summary);
    });
  },
);

function dataProviderForPopulationSummaryManager(): Array<[Population<BaseGenome>, PopulationSummary]> {
  return [
    [
      [],
      {
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
      },
    ],
    [
      [
        {
          id: 1,
          stats: {
            age: 1,
            fitness: 100,
            metrics: [10],
            origin: 'initial',
          },
        },
        {
          id: 2,
          stats: {
            age: 1,
            fitness: 90,
            metrics: [9],
            origin: 'crossover',
          },
        },
        {
          id: 3,
          stats: {
            age: 1,
            fitness: 80,
            metrics: [8],
            origin: 'mutation',
          },
        },
        {
          id: 4,
          stats: {
            age: 1,
            fitness: 70,
            metrics: [7],
            origin: 'initial',
          },
        },
        {
          id: 5,
          stats: {
            age: 1,
            fitness: 0,
            metrics: [6],
            origin: 'crossover',
          },
        },
      ],
      {
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
      },
    ],
    [
      [
        {
          id: 1,
          stats: {
            age: 1,
            fitness: 100,
            metrics: [10],
            origin: 'initial',
          },
        },
        {
          id: 2,
          stats: {
            age: 1,
            fitness: 90,
            metrics: [9],
            origin: 'crossover',
          },
        },
        {
          id: 3,
          stats: {
            age: 1,
            fitness: 80,
            metrics: [8],
            origin: 'crossover',
          },
        },
        {
          id: 4,
          stats: {
            age: 1,
            fitness: 70,
            metrics: [7],
            origin: 'initial',
          },
        },
        {
          id: 5,
          stats: {
            age: 1,
            fitness: 0,
            metrics: [6],
            origin: 'crossover',
          },
        },
      ],
      {
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
      },
    ],
  ];
}
