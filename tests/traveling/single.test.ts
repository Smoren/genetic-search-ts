import { describe, expect, it } from "@jest/globals";
import {
  ComposedGeneticSearch,
  ComposedGeneticSearchConfig,
  GeneticSearch,
  GeneticSearchConfig,
  GeneticSearchStrategyConfig,
} from "../../src";
import {
  TravelingCrossoverStrategy,
  TravelingFitnessStrategy,
  TravelingGenome,
  TravelingMutationStrategy,
  TravelingPopulateStrategy,
  TravelingSingleMetricsStrategy,
  travelingMetricsTask,
  calcPathDistance,
  getPermutations,
  // @ts-ignore
} from "./fixtures";

describe.each([
  ...dataProviderForTravelingSalesman(),
] as Array<[number[][]]>)(
  'Traveling Salesman Single Process Test',
  (distanceMatrix) => {
    it('', async () => {
      const config: GeneticSearchConfig = {
        populationSize: 30,
        survivalRate: 0.5,
        crossoverRate: 0.5,
      };

      const strategies: GeneticSearchStrategyConfig<TravelingGenome> = {
        populate: new TravelingPopulateStrategy(distanceMatrix.length),
        metrics: new TravelingSingleMetricsStrategy({
          task: travelingMetricsTask,
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
      }

      const search = new GeneticSearch(config, strategies);
      await search.fit({ generationsCount: 30 });
      const bestGenome = search.bestGenome;

      const expectedMinDistance = getPermutations(distanceMatrix.length)
        .map((path) => calcPathDistance(path, distanceMatrix))
        .sort((a, b) => a - b)[0];

      expect(calcPathDistance(bestGenome.path, distanceMatrix)).toBeCloseTo(expectedMinDistance);
    });
  },
);

describe.each([
  ...dataProviderForTravelingSalesman(),
] as Array<[number[][]]>)(
  'Traveling Salesman Composed Single Process Test',
  (distanceMatrix) => {
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

      const strategies: GeneticSearchStrategyConfig<TravelingGenome> = {
        populate: new TravelingPopulateStrategy(distanceMatrix.length),
        metrics: new TravelingSingleMetricsStrategy({
          task: travelingMetricsTask,
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
      }

      const search = new ComposedGeneticSearch(config, strategies);
      await search.fit({ generationsCount: 30 });
      const bestGenome = search.bestGenome;

      const expectedMinDistance = getPermutations(distanceMatrix.length)
        .map((path) => calcPathDistance(path, distanceMatrix))
        .sort((a, b) => a - b)[0];

      expect(calcPathDistance(bestGenome.path, distanceMatrix)).toBeCloseTo(expectedMinDistance);
    });
  },
);

function dataProviderForTravelingSalesman(): Array<[number[][]]> {
  return [
    [
      [
        [0, 10, 15, 20],
        [10, 0, 35, 25],
        [15, 35, 0, 30],
        [20, 25, 30, 0],
      ],
    ],
    [
      [
        [0, 2, 9, 10],
        [1, 0, 6, 4],
        [15, 7, 0, 8],
        [6, 3, 12, 0],
      ]
    ],
    [
      [
        [0, 29, 20, 21],
        [29, 0, 15, 17],
        [20, 15, 0, 28],
        [21, 17, 28, 0],
      ],
    ],
    [
      [
        [0, 3, 4, 2],
        [3, 0, 4, 6],
        [4, 4, 0, 7],
        [2, 6, 7, 0],
      ],
    ],
    [
      [
        [0, 1, 2, 3, 4],
        [1, 0, 5, 6, 7],
        [2, 5, 0, 8, 9],
        [3, 6, 8, 0, 10],
        [4, 7, 9, 10, 0],
      ],
    ],
  ];
}
