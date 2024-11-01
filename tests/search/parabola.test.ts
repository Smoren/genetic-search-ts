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
  ParabolaRunnerStrategy,
  ParabolaScoringStrategy
} from './fixtures';

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
        runner: new ParabolaRunnerStrategy({
          task: async (x: number) => [-((x+a)**2) + b],
        }),
        scoring: new ParabolaScoringStrategy(y),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
      }

      const search = new GeneticSearch(config, strategies);

      for (let i=0; i<100; ++i) {
        const scores = await search.step();
      }
      // search.run(100, () => {});

      const bestGenome = search.getBestGenome();

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((x+a)**2) + b).toEqual(y);
    });
  },
);

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
