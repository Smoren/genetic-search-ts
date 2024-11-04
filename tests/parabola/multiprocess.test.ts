import { describe, expect, it } from "@jest/globals";
import {
  ComposedGeneticSearch,
  ComposedGeneticSearchConfig,
  GeneticSearch,
  GeneticSearchConfig,
  GeneticSearchStrategyConfig,
} from "../../src";
import {
  ParabolaArgumentGenome, ParabolaCachedMultiprocessingRunnerStrategy,
  ParabolaCrossoverStrategy,
  ParabolaMultiprocessingRunnerStrategy,
  ParabolaMutationStrategy,
  ParabolaPopulateStrategy, ParabolaTaskConfig,
  ParabolaTransparentScoringStrategy,
  // @ts-ignore
} from "./fixtures";

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
      runner: new ParabolaMultiprocessingRunnerStrategy({
        poolSize: 4,
        task: (x: ParabolaTaskConfig) => Promise.resolve([-((x[1]+12)**2) - 3]),
        onTaskResult: () => void 0,
      }),
      scoring: new ParabolaTransparentScoringStrategy(),
      mutation: new ParabolaMutationStrategy(),
      crossover: new ParabolaCrossoverStrategy(),
    }

    const search = new GeneticSearch(config, strategies);

    return search.fit({
      generationsCount: 100,
      afterStep: () => void 0,
    }).then(() => {
      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      search.population = population;
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
      runner: new ParabolaCachedMultiprocessingRunnerStrategy({
        poolSize: 4,
        task: (x: ParabolaTaskConfig) => Promise.resolve([-((x[1]+12)**2) - 3]),
      }),
      scoring: new ParabolaTransparentScoringStrategy(),
      mutation: new ParabolaMutationStrategy(),
      crossover: new ParabolaCrossoverStrategy(),
    }

    const search = new GeneticSearch(config, strategies);

    return search.fit({
      generationsCount: 100,
      afterStep: () => void 0,
    }).then(() => {
      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      search.population = population;
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
      runner: new ParabolaMultiprocessingRunnerStrategy({
        poolSize: 4,
        task: (data: ParabolaTaskConfig) => Promise.resolve([-((data[1]+12)**2) - 3]),
      }),
      scoring: new ParabolaTransparentScoringStrategy(),
      mutation: new ParabolaMutationStrategy(),
      crossover: new ParabolaCrossoverStrategy(),
    }

    const search = new ComposedGeneticSearch(config, strategies);

    return search.fit({
      generationsCount: 20,
      afterStep: () => void 0,
    }).then(() => {
      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      search.population = population;
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
      runner: new ParabolaCachedMultiprocessingRunnerStrategy({
        poolSize: 4,
        task: (data: ParabolaTaskConfig) => Promise.resolve([-((data[1]+12)**2) - 3]),
      }),
      scoring: new ParabolaTransparentScoringStrategy(),
      mutation: new ParabolaMutationStrategy(),
      crossover: new ParabolaCrossoverStrategy(),
    }

    const search = new ComposedGeneticSearch(config, strategies);

    return search.fit({
      generationsCount: 20,
      afterStep: () => void 0,
    }).then(() => {
      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);

      search.population = population;
      expect(search.population).toEqual(population);
    });
  }, 30000);
});
