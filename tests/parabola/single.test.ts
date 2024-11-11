import { describe, expect, it } from "@jest/globals";
import {
  ComposedGeneticSearch,
  ComposedGeneticSearchConfig,
  GeneticSearch,
  GeneticSearchConfig,
  GeneticSearchStrategyConfig,
} from "../../src";
import {
  ParabolaArgumentGenome,
  ParabolaCrossoverStrategy,
  ParabolaMutationStrategy,
  ParabolaPopulateStrategy,
  ParabolaSingleMetricsStrategy,
  ParabolaReferenceFitnessStrategy,
  ParabolaMaxValueFitnessStrategy,
  ParabolaTaskConfig,
  // @ts-ignore
} from "./fixtures";
import { createNextIdGetter } from "../../src/utils";
// @ts-ignore
import { dataProviderForGetParabolaMax } from "./data";

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

      const strategies: GeneticSearchStrategyConfig<ParabolaArgumentGenome> = {
        populate: new ParabolaPopulateStrategy(),
        metrics: new ParabolaSingleMetricsStrategy({
          task: async (data: ParabolaTaskConfig) => [-((data[1]+a)**2) + b],
          onTaskResult: () => void 0,
        }),
        fitness: new ParabolaMaxValueFitnessStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
      }

      const search = new GeneticSearch(config, strategies, createNextIdGetter());

      expect(search.partitions).toEqual([50, 25, 25]);

      await search.fit({
        generationsCount: 100,
        beforeStep: () => void 0,
        afterStep: () => void 0,
        stopCondition: (scores) => Math.abs(scores[0] - y) < 10e-9,
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).not.toEqual(newFirstIdx);
      }

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population, false);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population, true);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).not.toEqual(newFirstIdx);
      }
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

      const strategies: GeneticSearchStrategyConfig<ParabolaArgumentGenome> = {
        populate: new ParabolaPopulateStrategy(),
        metrics: new ParabolaSingleMetricsStrategy({
          task: async (data: ParabolaTaskConfig) => [-((data[1]+a)**2) + b],
        }),
        fitness: new ParabolaReferenceFitnessStrategy(y),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
      }

      const search = new GeneticSearch(config, strategies);

      expect(search.partitions).toEqual([50, 25, 25]);

      await search.fit({
        generationsCount: 100,
        beforeStep: () => void 0,
        afterStep: () => void 0,
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).not.toEqual(newFirstIdx);
      }

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population, false);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population, true);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).not.toEqual(newFirstIdx);
      }
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

      const strategies: GeneticSearchStrategyConfig<ParabolaArgumentGenome> = {
        populate: new ParabolaPopulateStrategy(),
        metrics: new ParabolaSingleMetricsStrategy({
          task: async (data: ParabolaTaskConfig) => [-((data[1]+a)**2) + b],
        }),
        fitness: new ParabolaReferenceFitnessStrategy(y),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
      }

      const search = new ComposedGeneticSearch(config, strategies);

      expect(search.partitions).toEqual([50, 30, 20]);

      await search.fit({
        generationsCount: 100,
        beforeStep: () => void 0,
        afterStep: () => void 0,
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).not.toEqual(newFirstIdx);
      }

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population, false);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population, true);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).not.toEqual(newFirstIdx);
      }
    });
  },
);
