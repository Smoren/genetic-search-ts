import { describe, it } from '@jest/globals';
import {
  BaseGenome,
  GenerationFitnessColumn,
  GenerationMetricsMatrix,
  GenomeStats,
  GenomeStatsManager,
  Population
} from '../../src';

describe.each([
  ...dataProviderForGenomeStatsManager(),
] as Array<[Population<BaseGenome>, GenerationMetricsMatrix, GenerationFitnessColumn, GenomeStats[], GenomeStats[]]>)(
  'GenomeStatsManager Test',
  (population, metricsMatrix, fitnessColumn, expectedAfterInit, expectedAfterUpdate) => {
    it('', async () => {
      const extractStats = (population: Population<BaseGenome>) => population
        .filter((genome) => genome.stats)
        .map((genome) => genome.stats!);

      expect(extractStats(population).length).toEqual(0);

      const manager = new GenomeStatsManager();

      manager.init(population, 'initial')

      {
        const stats = extractStats(population);
        expect(stats.length).toEqual(population.length);
        expect(stats).toEqual(expectedAfterInit);
      }

      manager.update(population, metricsMatrix, fitnessColumn);

      {
        const stats = extractStats(population);
        expect(stats.length).toEqual(population.length);
        expect(stats).toEqual(expectedAfterUpdate);
      }
    });
  },
);

function dataProviderForGenomeStatsManager(): Array<[Population<BaseGenome>, GenerationMetricsMatrix, GenerationFitnessColumn, GenomeStats[], GenomeStats[]]> {
  return [
    [
      [],
      [],
      [],
      [],
      [],
    ],
    [
      [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ],
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      [10, 20, 30],
      [
        {
          fitness: 0,
          age: 0,
          metrics: [],
          origin: 'initial',
        },
        {
          fitness: 0,
          age: 0,
          metrics: [],
          origin: 'initial',
        },
        {
          fitness: 0,
          age: 0,
          metrics: [],
          origin: 'initial',
        },
      ],
      [
        {
          fitness: 10,
          age: 1,
          metrics: [1, 2, 3],
          origin: 'initial',
        },
        {
          fitness: 20,
          age: 1,
          metrics: [4, 5, 6],
          origin: 'initial',
        },
        {
          fitness: 30,
          age: 1,
          metrics: [7, 8, 9],
          origin: 'initial',
        },
      ],
    ],
  ];
}
