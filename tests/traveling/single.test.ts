import { describe, expect, it } from "@jest/globals";
import {
  AveragePhenotypeCache,
  ComposedGeneticSearch,
  ComposedGeneticSearchConfig,
  GeneticSearch,
  GeneticSearchConfig,
  GeneticSearchStrategyConfig,
  DummyPhenotypeCache,
  SimplePhenotypeCache,
  DescendingSortingStrategy,
  RandomSelectionStrategy,
} from "../../src";
import {
  TravelingCrossoverStrategy,
  TravelingFitnessStrategy,
  TravelingGenome,
  TravelingMutationStrategy,
  TravelingPopulateStrategy,
  TravelingSinglePhenotypeStrategy,
  travelingPhenotypeTask,
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
        phenotype: new TravelingSinglePhenotypeStrategy({
          task: travelingPhenotypeTask,
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        selection: new RandomSelectionStrategy(2),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
        cache: new DummyPhenotypeCache(),
      }

      const search = new GeneticSearch<TravelingGenome>(config, strategies);
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
  'Traveling Salesman Single Process Simple Cached Test',
  (distanceMatrix) => {
    it('', async () => {
      const config: GeneticSearchConfig = {
        populationSize: 30,
        survivalRate: 0.5,
        crossoverRate: 0.5,
      };

      const strategies: GeneticSearchStrategyConfig<TravelingGenome> = {
        populate: new TravelingPopulateStrategy(distanceMatrix.length),
        phenotype: new TravelingSinglePhenotypeStrategy({
          task: travelingPhenotypeTask,
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        selection: new RandomSelectionStrategy(2),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
        cache: new SimplePhenotypeCache(),
      }

      const search = new GeneticSearch<TravelingGenome>(config, strategies);
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
  'Traveling Salesman Single Process Average Cached Test',
  (distanceMatrix) => {
    it('', async () => {
      const config: GeneticSearchConfig = {
        populationSize: 30,
        survivalRate: 0.5,
        crossoverRate: 0.5,
      };

      const strategies: GeneticSearchStrategyConfig<TravelingGenome> = {
        populate: new TravelingPopulateStrategy(distanceMatrix.length),
        phenotype: new TravelingSinglePhenotypeStrategy({
          task: travelingPhenotypeTask,
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        selection: new RandomSelectionStrategy(2),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
        cache: new AveragePhenotypeCache(),
      }

      const search = new GeneticSearch<TravelingGenome>(config, strategies);
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
        phenotype: new TravelingSinglePhenotypeStrategy({
          task: travelingPhenotypeTask,
          distanceMatrix,
        }),
        fitness: new TravelingFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        selection: new RandomSelectionStrategy(2),
        mutation: new TravelingMutationStrategy(),
        crossover: new TravelingCrossoverStrategy(),
        cache: new DummyPhenotypeCache(),
      }

      const search = new ComposedGeneticSearch<TravelingGenome>(config, strategies);
      await search.fit({ generationsCount: 30 });
      const bestGenome = search.bestGenome;

      const expectedMinDistance = getPermutations(distanceMatrix.length)
        .map((path) => calcPathDistance(path, distanceMatrix))
        .sort((a, b) => a - b)[0];

      expect(calcPathDistance(bestGenome.path, distanceMatrix)).toBeCloseTo(expectedMinDistance);
    });
  },
);
