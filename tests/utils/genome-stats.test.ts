import { describe, it } from '@jest/globals';
import {
  BaseGenome,
  GenerationFitnessColumn,
  GenerationPhenomeMatrix,
  GenomeStats,
  GenomeStatsManager,
  Population
} from '../../src';

describe.each([
  ...dataProviderForGenomeStatsManager(),
] as Array<[Population<BaseGenome>, GenerationPhenomeMatrix, GenerationFitnessColumn, GenomeStats[], GenomeStats[]]>)(
  'GenomeStatsManager Test',
  (population, phenomeMatrix, fitnessColumn, expectedAfterInit, expectedAfterUpdate) => {
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

      manager.update(population, phenomeMatrix, fitnessColumn);

      {
        const stats = extractStats(population);
        expect(stats.length).toEqual(population.length);
        expect(stats).toEqual(expectedAfterUpdate);
      }
    });
  },
);

function dataProviderForGenomeStatsManager(): Array<[Population<BaseGenome>, GenerationPhenomeMatrix, GenerationFitnessColumn, GenomeStats[], GenomeStats[]]> {
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
          phenome: [],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        },
        {
          fitness: 0,
          age: 0,
          phenome: [],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        },
        {
          fitness: 0,
          age: 0,
          phenome: [],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        },
      ],
      [
        {
          fitness: 10,
          age: 1,
          phenome: [1, 2, 3],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        },
        {
          fitness: 20,
          age: 1,
          phenome: [4, 5, 6],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        },
        {
          fitness: 30,
          age: 1,
          phenome: [7, 8, 9],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        },
      ],
    ],
  ];
}

describe.each([
  ...dataProviderForOriginCounters(),
  ...dataProviderForOriginCountersIncomplete(),
] as Array<[BaseGenome, BaseGenome, GenomeStats, GenomeStats, GenomeStats]>)(
  'GenomeStatsManager Origin Counters Test',
  (lhs, rhs, crossoverStats, mutationLhsStats, mutationRhsStats) => {
    it('', async () => {
      const manager = new GenomeStatsManager();

      const crossoverGenome: BaseGenome = { id: 100 };
      manager.initItem(crossoverGenome, 'crossover', [lhs, rhs]);
      expect(crossoverGenome.stats).toEqual(crossoverStats);

      const mutationLhsGenome: BaseGenome = { id: 200 };
      manager.initItem(mutationLhsGenome, 'mutation', [lhs]);
      expect(mutationLhsGenome.stats).toEqual(mutationLhsStats);

      const mutationRhsGenome: BaseGenome = { id: 300 };
      manager.initItem(mutationRhsGenome, 'mutation', [rhs]);
      expect(mutationRhsGenome.stats).toEqual(mutationRhsStats);
    });
  },
);

function dataProviderForOriginCounters(): Array<[BaseGenome, BaseGenome, GenomeStats, GenomeStats, GenomeStats]> {
  return [
    [
      {
        id: 1,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'crossover',
          originCounters: {
            crossover: 1,
            mutation: 0,
          },
          parentIds: [],
        }
      },
      {
        id: 2,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'mutation',
          originCounters: {
            crossover: 0,
            mutation: 1,
          },
          parentIds: [],
        }
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'crossover',
        originCounters: {
          crossover: 2,
          mutation: 1,
        },
        parentIds: [1, 2],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 1,
          mutation: 1,
        },
        parentIds: [1],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 2,
        },
        parentIds: [2],
      }
    ],
    [
      {
        id: 1,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        }
      },
      {
        id: 2,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        }
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'crossover',
        originCounters: {
          crossover: 1,
          mutation: 0,
        },
        parentIds: [1, 2],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [1],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [2],
      }
    ],
    [
      {
        id: 1,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        }
      },
      {
        id: 2,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'mutation',
          originCounters: {
            crossover: 0,
            mutation: 1,
          },
          parentIds: [],
        }
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'crossover',
        originCounters: {
          crossover: 1,
          mutation: 1,
        },
        parentIds: [1, 2],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [1],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 2,
        },
        parentIds: [2],
      }
    ],
  ];
}

function dataProviderForOriginCountersIncomplete(): Array<[BaseGenome, BaseGenome, GenomeStats, GenomeStats, GenomeStats]> {
  return [
    [
      { id: 1 },
      { id: 2 },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'crossover',
        originCounters: {
          crossover: 1,
          mutation: 0,
        },
        parentIds: [1, 2],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [1],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [2],
      }
    ],
    [
      { id: 1 },
      {
        id: 2,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        }
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'crossover',
        originCounters: {
          crossover: 1,
          mutation: 0,
        },
        parentIds: [1, 2],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [1],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [2],
      }
    ],
    [
      {
        id: 1,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'initial',
        } as unknown as GenomeStats,
      },
      { id: 2 },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'crossover',
        originCounters: {
          crossover: 1,
          mutation: 0,
        },
        parentIds: [1, 2],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [1],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [2],
      }
    ],
    [
      {
        id: 1,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'initial',
        } as unknown as GenomeStats,
      },
      {
        id: 2,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'initial',
          originCounters: {
            crossover: 0,
            mutation: 0,
          },
          parentIds: [],
        }
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'crossover',
        originCounters: {
          crossover: 1,
          mutation: 0,
        },
        parentIds: [1, 2],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [1],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [2],
      }
    ],
    [
      {
        id: 1,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'initial',
        } as unknown as GenomeStats,
      },
      {
        id: 2,
        stats: {
          fitness: 0,
          age: 1,
          phenome: [],
          origin: 'initial',
        } as unknown as GenomeStats
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'crossover',
        originCounters: {
          crossover: 1,
          mutation: 0,
        },
        parentIds: [1, 2],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [1],
      },
      {
        fitness: 0,
        age: 0,
        phenome: [],
        origin: 'mutation',
        originCounters: {
          crossover: 0,
          mutation: 1,
        },
        parentIds: [2],
      }
    ],
  ];
}
