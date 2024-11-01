import { describe, expect, it } from "@jest/globals";
import {
  GeneticSearch,
  GeneticSearchConfig,
  StrategyConfig
} from '../../src';
import {
  ParabolaArgumentGenome,
  ParabolaCrossoverStrategy,
  ParabolaMutationStrategy,
  ParabolaPopulateStrategy,
  ParabolaSingleRunnerStrategy,
  ParabolaScoringStrategy,
  // ParabolaMultiprocessingRunnerStrategy,
} from "./fixtures";

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola Max Single Process Test',
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
        scoring: new ParabolaScoringStrategy(y),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
      }

      const search = new GeneticSearch(config, strategies);
      await search.fit({
        generationsCount: 100,
        afterStep: () => void 0,
      });

      const bestGenome = search.getBestGenome();

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.getPopulation();
      expect(population.length).toBe(100);

      search.setPopulation(population);
      expect(search.getPopulation()).toEqual(population);
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
//       const bestGenome = search.getBestGenome();
//
//       expect(bestGenome.x).toBeCloseTo(x);
//       expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);
//
//       const population = search.getPopulation();
//       expect(population.length).toBe(100);
//
//       search.setPopulation(population);
//       expect(search.getPopulation()).toEqual(population);
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
