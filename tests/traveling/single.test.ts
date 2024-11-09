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
// @ts-ignore
import { dataProviderForTravelingSalesman } from "./data";

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
