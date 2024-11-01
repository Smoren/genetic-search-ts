import { describe, expect, it } from "@jest/globals";
import {
  ComposedGeneticSearch,
  ComposedGeneticSearchConfig,
  GeneticSearch,
  GeneticSearchConfig,
  StrategyConfig,
} from "../../src";
import {
  ParabolaArgumentGenome,
  ParabolaCrossoverStrategy,
  ParabolaMutationStrategy,
  ParabolaPopulateStrategy,
  ParabolaSingleRunnerStrategy,
  ParabolaReferenceScoringStrategy, ParabolaTransparentScoringStrategy,
  // ParabolaMultiprocessingRunnerStrategy,
} from "./fixtures";
import { createNextIdGetter } from "../../src/utils";

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola Max Test',
  ([a, b], [x, y]) => {
    it('', async () => {
      const config: GeneticSearchConfig = {
        populationSize: 100,
        survivalRate: 0.5,
        crossoverRate: 0.5,
      };

      const strategies: StrategyConfig<ParabolaArgumentGenome> = {
        populate: new ParabolaPopulateStrategy(),
        runner: new ParabolaSingleRunnerStrategy({
          task: async (x: number) => [-((x+a)**2) + b],
        }),
        scoring: new ParabolaTransparentScoringStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
      }

      const search = new GeneticSearch(config, strategies, createNextIdGetter());

      expect(search.partitions).toEqual([50, 25, 25]);

      await search.fit({
        generationsCount: 100,
        afterStep: () => void 0,
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      search.population = population;
      expect(search.population).toEqual(population);
    });
  },
);

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola Max Reference Test',
  ([a, b], [x, y]) => {
    it('', async () => {
      const config: GeneticSearchConfig = {
        populationSize: 100,
        survivalRate: 0.5,
        crossoverRate: 0.5,
      };

      const strategies: StrategyConfig<ParabolaArgumentGenome> = {
        populate: new ParabolaPopulateStrategy(),
        runner: new ParabolaSingleRunnerStrategy({
          task: async (x: number) => [-((x+a)**2) + b],
        }),
        scoring: new ParabolaReferenceScoringStrategy(y),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
      }

      const search = new GeneticSearch(config, strategies);

      expect(search.partitions).toEqual([50, 25, 25]);

      await search.fit({
        generationsCount: 100,
        afterStep: () => void 0,
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      search.population = population;
      expect(search.population).toEqual(population);
    });
  },
);

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola Max Single Process Composed Test',
  ([a, b], [x, y]) => {
    it('', async () => {
      const config: ComposedGeneticSearchConfig = {
        eliminators: {
          populationSize: 10,
          survivalRate: 0.5,
          crossoverRate: 0.5,
        },
        final: {
          populationSize: 10,
          survivalRate: 0.5,
          crossoverRate: 0.5,
        }
      };

      const strategies: StrategyConfig<ParabolaArgumentGenome> = {
        populate: new ParabolaPopulateStrategy(),
        runner: new ParabolaSingleRunnerStrategy({
          task: async (x: number) => [-((x+a)**2) + b],
        }),
        scoring: new ParabolaReferenceScoringStrategy(y),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
      }

      const search = new ComposedGeneticSearch(config, strategies);

      expect(search.partitions).toEqual([50, 30, 20]);

      await search.fit({
        generationsCount: 100,
        afterStep: () => void 0,
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      search.population = population;
      expect(search.population).toEqual(population);
    });
  },
);

// describe.each([
//   ...dataProviderForGetParabolaMax(),
// ] as Array<[[number, number], [number, number]]>)(
//   'Get Parabola Max Multi Process Test',
//   ([a, b], [x, y]) => {
//     it('', async () => {
//       const config: GeneticSearchConfig = {
//         populationSize: 100,
//         survivalRate: 0.5,
//         crossoverRate: 0.5,
//       };
//
//       const strategies: StrategyConfig<ParabolaArgumentGenome> = {
//         populate: new ParabolaPopulateStrategy(),
//         runner: new ParabolaMultiprocessingRunnerStrategy({
//           poolSize: 4,
//           task: async (x: number) => [-((x+a)**2) + b],
//         }),
//         scoring: new ParabolaScoringStrategy(y),
//         mutation: new ParabolaMutationStrategy(),
//         crossover: new ParabolaCrossoverStrategy(),
//       }
//
//       const search = new GeneticSearch(config, strategies);
//       await search.fit({
//         generationsCount: 100,
//         afterStep: () => void 0,
//       });
//
//       const bestGenome = search.bestGenome;
//
//       expect(bestGenome.x).toBeCloseTo(x);
//       expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);
//
//       const population = search.population;
//       expect(population.length).toBe(100);
//
//       search.population = population;
//       expect(search.population).toEqual(population);
//     });
//   },
// );

function dataProviderForGetParabolaMax(): Array<[[number, number], [number, number]]> {
  return [
    [
      [0, 0],
      [0, 0],
    ],
    [
      [1, 0],
      [-1, 0],
    ],
    [
      [0, 1],
      [0, 1],
    ],
    [
      [1, 1],
      [-1, 1],
    ],
    [
      [-1, -1],
      [1, -1],
    ],
    [
      [-10, 5],
      [10, 5],
    ],
    [
      [12, -3],
      [-12, -3],
    ],
  ];
}
