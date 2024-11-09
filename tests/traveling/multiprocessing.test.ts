import { describe, expect, it } from "@jest/globals";
import {
  ComposedGeneticSearch,
  ComposedGeneticSearchConfig,
  GeneticSearch,
  GeneticSearchConfig,
  GeneticSearchStrategyConfig,
} from "../../src";
import {
  calcPathDistance,
  getPermutations,
  travelingMetricsTask,
  TravelingCachedMultiprocessingMetricsStrategy,
  TravelingCrossoverStrategy,
  TravelingFitnessStrategy,
  TravelingGenome,
  TravelingMultiprocessingMetricsStrategy,
  TravelingMutationStrategy,
  TravelingPopulateStrategy,
  // @ts-ignore
} from "./fixtures";
// @ts-ignore
import { dataProviderForTravelingSalesman } from "./data";

describe.each([
  ...dataProviderForTravelingSalesman(),
] as Array<[number[][]]>)(
  'Traveling Salesman Multiprocessing Test',
  (distanceMatrix) => {
    it('', () => {
      const config: GeneticSearchConfig = {
        populationSize: 30,
        survivalRate: 0.5,
        crossoverRate: 0.5,
      };

      const strategies: GeneticSearchStrategyConfig<TravelingGenome> = {
        populate: new TravelingPopulateStrategy(distanceMatrix.length),
        metrics: new TravelingMultiprocessingMetricsStrategy({
          poolSize: 4,
          task: (data) => {
            const [_, path, distanceMatrix] = data;
            let totalDistance = 0;

            for (let i = 0; i < path.length; i++) {
              const from = path[i];
              const to = path[(i + 1) % path.length];
              totalDistance += distanceMatrix[from][to];
            }

            return Promise.resolve([1 / totalDistance]);
          },
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
      }

      const search = new GeneticSearch(config, strategies);
      return search.fit({ generationsCount: 30 }).then(() => {
        const bestGenome = search.bestGenome;

        const expectedMinDistance = getPermutations(distanceMatrix.length)
          .map((path) => calcPathDistance(path, distanceMatrix))
          .sort((a, b) => a - b)[0];

        expect(calcPathDistance(bestGenome.path, distanceMatrix)).toBeCloseTo(expectedMinDistance);
      });
    }, 10000);
  },
);

describe.each([
  ...dataProviderForTravelingSalesman(),
] as Array<[number[][]]>)(
  'Traveling Salesman Cached Multiprocessing Test',
  (distanceMatrix) => {
    it('', () => {
      const config: GeneticSearchConfig = {
        populationSize: 30,
        survivalRate: 0.5,
        crossoverRate: 0.5,
      };

      const strategies: GeneticSearchStrategyConfig<TravelingGenome> = {
        populate: new TravelingPopulateStrategy(distanceMatrix.length),
        metrics: new TravelingCachedMultiprocessingMetricsStrategy({
          poolSize: 4,
          task: (data) => {
            const [_, path, distanceMatrix] = data;
            let totalDistance = 0;

            for (let i = 0; i < path.length; i++) {
              const from = path[i];
              const to = path[(i + 1) % path.length];
              totalDistance += distanceMatrix[from][to];
            }

            return Promise.resolve([1 / totalDistance]);
          },
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
      }

      const search = new GeneticSearch(config, strategies);
      return search.fit({ generationsCount: 30 }).then(() => {
        const bestGenome = search.bestGenome;

        const expectedMinDistance = getPermutations(distanceMatrix.length)
          .map((path) => calcPathDistance(path, distanceMatrix))
          .sort((a, b) => a - b)[0];

        expect(calcPathDistance(bestGenome.path, distanceMatrix)).toBeCloseTo(expectedMinDistance);
      });
    }, 10000);
  },
);

describe.each([
  ...dataProviderForTravelingSalesman(),
] as Array<[number[][]]>)(
  'Traveling Salesman Composed Multiprocessing Test',
  (distanceMatrix) => {
    it('', () => {
      const config: ComposedGeneticSearchConfig = {
        eliminators: {
          populationSize: 10,
          survivalRate: 0.5,
          crossoverRate: 0.5,
        },
        final: {
          populationSize: 2,
          survivalRate: 0.5,
          crossoverRate: 0.5,
        }
      };

      const strategies: GeneticSearchStrategyConfig<TravelingGenome> = {
        populate: new TravelingPopulateStrategy(distanceMatrix.length),
        metrics: new TravelingMultiprocessingMetricsStrategy({
          poolSize: 4,
          task: (data) => {
            const [_, path, distanceMatrix] = data;
            let totalDistance = 0;

            for (let i = 0; i < path.length; i++) {
              const from = path[i];
              const to = path[(i + 1) % path.length];
              totalDistance += distanceMatrix[from][to];
            }

            return Promise.resolve([1 / totalDistance]);
          },
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
      }

      const search = new ComposedGeneticSearch(config, strategies);
      return search.fit({ generationsCount: 30 }).then(() => {
        const bestGenome = search.bestGenome;

        const expectedMinDistance = getPermutations(distanceMatrix.length)
          .map((path) => calcPathDistance(path, distanceMatrix))
          .sort((a, b) => a - b)[0];

        expect(calcPathDistance(bestGenome.path, distanceMatrix)).toBeCloseTo(expectedMinDistance);
      });
    }, 30000);
  }
);

describe.each([
  ...dataProviderForTravelingSalesman(),
] as Array<[number[][]]>)(
  'Traveling Salesman Cached Composed Multiprocessing Test',
  (distanceMatrix) => {
    it('', () => {
      const config: ComposedGeneticSearchConfig = {
        eliminators: {
          populationSize: 10,
          survivalRate: 0.5,
          crossoverRate: 0.5,
        },
        final: {
          populationSize: 2,
          survivalRate: 0.5,
          crossoverRate: 0.5,
        }
      };

      const strategies: GeneticSearchStrategyConfig<TravelingGenome> = {
        populate: new TravelingPopulateStrategy(distanceMatrix.length),
        metrics: new TravelingCachedMultiprocessingMetricsStrategy({
          poolSize: 4,
          task: (data) => {
            const [_, path, distanceMatrix] = data;
            let totalDistance = 0;

            for (let i = 0; i < path.length; i++) {
              const from = path[i];
              const to = path[(i + 1) % path.length];
              totalDistance += distanceMatrix[from][to];
            }

            return Promise.resolve([1 / totalDistance]);
          },
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
      }

      const search = new ComposedGeneticSearch(config, strategies);
      return search.fit({ generationsCount: 30 }).then(() => {
        const bestGenome = search.bestGenome;

        const expectedMinDistance = getPermutations(distanceMatrix.length)
          .map((path) => calcPathDistance(path, distanceMatrix))
          .sort((a, b) => a - b)[0];

        expect(calcPathDistance(bestGenome.path, distanceMatrix)).toBeCloseTo(expectedMinDistance);
      });
    }, 30000);
  }
);
