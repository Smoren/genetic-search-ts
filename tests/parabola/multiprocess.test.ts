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
  ParabolaCachedMultiprocessingMetricsStrategy,
  ParabolaCrossoverStrategy,
  ParabolaMultiprocessingMetricsStrategy,
  ParabolaMutationStrategy,
  ParabolaPopulateStrategy,
  ParabolaTaskConfig,
  ParabolaMaxValueFitnessStrategy,
  // @ts-ignore
} from "./fixtures";
import { createNextIdGetter } from "../../src/utils";

describe('Parabola Multiprocessing', () => {
  it('Get Parabola Max Multiprocessing Test', () => {
    const [a, b] = [12, -3];
    const [x, y] = [-12, -3];

    const config: GeneticSearchConfig = {
      populationSize: 100,
      survivalRate: 0.5,
      crossoverRate: 0.5,
    };

    const strategies: GeneticSearchStrategyConfig<ParabolaArgumentGenome> = {
      populate: new ParabolaPopulateStrategy(),
      metrics: new ParabolaMultiprocessingMetricsStrategy({
        poolSize: 4,
        task: (x: ParabolaTaskConfig) => Promise.resolve([-((x[1]+12)**2) - 3]),
        onTaskResult: () => void 0,
      }),
      fitness: new ParabolaMaxValueFitnessStrategy(),
      mutation: new ParabolaMutationStrategy(),
      crossover: new ParabolaCrossoverStrategy(),
    }

    const search = new GeneticSearch(config, strategies);

    return search.fit({
      generationsCount: 100,
      beforeStep: () => void 0,
      afterStep: () => void 0,
    }).then(() => {
      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      search.setPopulation(population, true);
      expect(search.population).toEqual(population);
    });
  }, 30000);

  it('Get Parabola Max Cached Multiprocessing Test', () => {
    const [a, b] = [12, -3];
    const [x, y] = [-12, -3];

    const config: GeneticSearchConfig = {
      populationSize: 100,
      survivalRate: 0.5,
      crossoverRate: 0.5,
    };

    const strategies: GeneticSearchStrategyConfig<ParabolaArgumentGenome> = {
      populate: new ParabolaPopulateStrategy(),
      metrics: new ParabolaCachedMultiprocessingMetricsStrategy({
        poolSize: 4,
        task: (x: ParabolaTaskConfig) => Promise.resolve([-((x[1]+12)**2) - 3]),
      }),
      fitness: new ParabolaMaxValueFitnessStrategy(),
      mutation: new ParabolaMutationStrategy(),
      crossover: new ParabolaCrossoverStrategy(),
    }

    const search = new GeneticSearch(config, strategies);

    return search.fit({
      generationsCount: 100,
      afterStep: () => void 0,
      stopCondition: (scores) => Math.abs(scores[0] - y) < 10e-9,
    }).then(() => {
      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      search.setPopulation(population, false);
      expect(search.population).toEqual(population);
    });
  }, 30000);

  it('Get Parabola Max Composed Multiprocessing Test', () => {
    const [a, b] = [12, -3];
    const [x, y] = [-12, -3];

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
      metrics: new ParabolaMultiprocessingMetricsStrategy({
        poolSize: 4,
        task: (data: ParabolaTaskConfig) => Promise.resolve([-((data[1]+12)**2) - 3]),
      }),
      fitness: new ParabolaMaxValueFitnessStrategy(),
      mutation: new ParabolaMutationStrategy(),
      crossover: new ParabolaCrossoverStrategy(),
    }

    const search = new ComposedGeneticSearch(config, strategies);

    return search.fit({
      generationsCount: 20,
      afterStep: () => void 0,
      stopCondition: (scores) => Math.abs(scores[0] - y) < 10e-9,
    }).then(() => {
      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(110);

      search.setPopulation(population, false);
      expect(search.population).toEqual(population);
    });
  }, 30000);

  it('Get Parabola Max Composed Cached Multiprocessing Test', () => {
    const [a, b] = [12, -3];
    const [x, y] = [-12, -3];

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
      metrics: new ParabolaCachedMultiprocessingMetricsStrategy({
        poolSize: 4,
        task: (data: ParabolaTaskConfig) => Promise.resolve([-((data[1]+12)**2) - 3]),
      }),
      fitness: new ParabolaMaxValueFitnessStrategy(),
      mutation: new ParabolaMutationStrategy(),
      crossover: new ParabolaCrossoverStrategy(),
    }

    const search = new ComposedGeneticSearch(config, strategies, createNextIdGetter());

    return search.fit({
      generationsCount: 20,
      afterStep: () => void 0,
      stopCondition: (scores) => Math.abs(scores[0] - y) < 10e-9,
    }).then(() => {
      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(110);

      search.setPopulation(population, false);
      expect(search.population).toEqual(population);
    });
  }, 30000);
});
