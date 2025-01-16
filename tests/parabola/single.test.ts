import { describe, expect, it } from "@jest/globals";
import {
  AverageMetricsCache,
  ComposedGeneticSearchConfig,
  GeneticSearchConfig,
  GeneticSearchStrategyConfig,
  DummyMetricsCache,
  SimpleMetricsCache,
  Scheduler,
  DescendingSortingStrategy,
  AscendingSortingStrategy,
} from "../../src";
import {
  ComposedGeneticSearch,
  GeneticSearch,
  IdGenerator,
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
// @ts-ignore
import { dataProviderForGetParabolaMax } from "./data";
import { WeightedAgeAverageMetricsCache } from "../../src";

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola With Descending Sort Max Test',
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
          task: async (data: ParabolaTaskConfig) => [-((data[0]+a)**2) + b],
          onTaskResult: () => void 0,
        }),
        fitness: new ParabolaMaxValueFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
        cache: new DummyMetricsCache(),
      }

      const search = new GeneticSearch<ParabolaArgumentGenome>(config, strategies, new IdGenerator());
      expect(search.cache).toBeInstanceOf(DummyMetricsCache);
      expect(search.partitions).toEqual([50, 25, 25]);

      await search.fit({
        generationsCount: 100,
        beforeStep: () => void 0,
        afterStep: () => {
          const summary = search.getPopulationSummary();
          expect(summary.fitnessSummary.count).toBe(100);

          const roundedSummary = search.getPopulationSummary(4);
          expect(roundedSummary.fitnessSummary.count).toBe(100);
        },
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }
    });
  },
);

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola With Ascending Sort Max Test',
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
          task: async (data: ParabolaTaskConfig) => [-(-((data[0]+a)**2) + b)],
          onTaskResult: () => void 0,
        }),
        fitness: new ParabolaMaxValueFitnessStrategy(),
        sorting: new AscendingSortingStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
        cache: new DummyMetricsCache(),
      }

      const search = new GeneticSearch<ParabolaArgumentGenome>(config, strategies, new IdGenerator());
      expect(search.cache).toBeInstanceOf(DummyMetricsCache);
      expect(search.partitions).toEqual([50, 25, 25]);

      await search.fit({
        generationsCount: 100,
        beforeStep: () => void 0,
        afterStep: () => {
          const summary = search.getPopulationSummary();
          expect(summary.fitnessSummary.count).toBe(100);

          const roundedSummary = search.getPopulationSummary(4);
          expect(roundedSummary.fitnessSummary.count).toBe(100);
        },
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }
    });
  },
);

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola Max With Scheduler Test',
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
          task: async (data: ParabolaTaskConfig) => [-((data[0]+a)**2) + b],
          onTaskResult: () => void 0,
        }),
        fitness: new ParabolaMaxValueFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
        cache: new DummyMetricsCache(),
      }

      const search = new GeneticSearch<ParabolaArgumentGenome>(config, strategies, new IdGenerator());
      expect(search.cache).toBeInstanceOf(DummyMetricsCache);
      expect(search.partitions).toEqual([50, 25, 25]);

      const scheduler = new Scheduler({
        runner: search,
        config: config,
        rules: [
          {
            condition: (input) => input.runner.generation === 10,
            action: (input) => {
              input.config.populationSize = 50;
              input.logger('set population size to 50');
            },
          }
        ],
        maxHistoryLength: 0,
      })

      await search.fit({
        generationsCount: 100,
        beforeStep: () => void 0,
        afterStep: (generation) => {
          const population = search.population;
          const expectedPopulationSize = generation <= 10 ? 100 : 50;

          expect(population.length).toBe(expectedPopulationSize);

          if (generation === 10) {
            expect(scheduler.logs).toEqual(['set population size to 50']);
          } else {
            expect(scheduler.logs).toEqual([]);
          }
        },
        scheduler,
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(50);
    });
  },
);

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola Max Simple Cached Test',
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
          task: async (data: ParabolaTaskConfig) => [-((data[0]+a)**2) + b],
          onTaskResult: () => void 0,
        }),
        fitness: new ParabolaMaxValueFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
        cache: new SimpleMetricsCache(),
      }

      const search = new GeneticSearch<ParabolaArgumentGenome>(config, strategies, new IdGenerator());
      expect(search.cache).toBeInstanceOf(SimpleMetricsCache);
      expect(search.partitions).toEqual([50, 25, 25]);

      await search.fit({
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }
    });
  },
);

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola Max Average Cached Test',
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
          task: async (data: ParabolaTaskConfig) => [-((data[0]+a)**2) + b],
          onTaskResult: () => void 0,
        }),
        fitness: new ParabolaMaxValueFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
        cache: new AverageMetricsCache(),
      }

      const search = new GeneticSearch<ParabolaArgumentGenome>(config, strategies, new IdGenerator());
      expect(search.cache).toBeInstanceOf(AverageMetricsCache);
      expect(search.partitions).toEqual([50, 25, 25]);

      await search.fit({
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }
    });
  },
);

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola Max Weighted Age Average Cached Test',
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
          task: async (data: ParabolaTaskConfig) => [-((data[0]+a)**2) + b],
          onTaskResult: () => void 0,
        }),
        fitness: new ParabolaMaxValueFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
        cache: new WeightedAgeAverageMetricsCache(0.2),
      }

      const search = new GeneticSearch<ParabolaArgumentGenome>(config, strategies, new IdGenerator());

      await search.fit({
        beforeStep: () => void 0,
        afterStep: () => void 0,
        stopCondition: (scores) => Math.abs(scores[0] - y) < 10e-5,
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x, 2);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);

      const population = search.population;
      expect(population.length).toBe(100);
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
          task: async (data: ParabolaTaskConfig) => [-((data[0]+a)**2) + b],
        }),
        fitness: new ParabolaReferenceFitnessStrategy(y),
        sorting: new DescendingSortingStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
        cache: new DummyMetricsCache(),
      }

      const search = new GeneticSearch<ParabolaArgumentGenome>(config, strategies);
      expect(search.cache).toBeInstanceOf(DummyMetricsCache);
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }

      {
        const oldFirstIdx = population[0].id;
        search.population = population;
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).toEqual(newFirstIdx);
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
          task: async (data: ParabolaTaskConfig) => [-((data[0]+a)**2) + b],
        }),
        fitness: new ParabolaReferenceFitnessStrategy(y),
        sorting: new DescendingSortingStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
        cache: new DummyMetricsCache(),
      }

      const search = new ComposedGeneticSearch<ParabolaArgumentGenome>(config, strategies);
      expect(search.generation).toEqual(1);
      expect(search.cache).toBeInstanceOf(DummyMetricsCache);
      expect(search.partitions).toEqual([50, 30, 20]);

      await search.fit({
        generationsCount: 100,
        beforeStep: () => void 0,
        afterStep: () => {
          const summary = search.getPopulationSummary();
          expect(summary.fitnessSummary.count >= 10).toBe(true);

          const roundedSummary = search.getPopulationSummary(4);
          expect(roundedSummary.fitnessSummary.count >= 10).toBe(true);
        },
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);
      expect(search.population.length).toBe(110);

      const population = search.population;

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).toEqual(newFirstIdx);
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }

      {
        const oldFirstIdx = population[0].id;
        search.population = population;
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }
    });
  },
);

describe.each([
  ...dataProviderForGetParabolaMax(),
] as Array<[[number, number], [number, number]]>)(
  'Get Parabola Max Single Process Composed Another Test',
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
        },
      };

      const strategies: GeneticSearchStrategyConfig<ParabolaArgumentGenome> = {
        populate: new ParabolaPopulateStrategy(),
        metrics: new ParabolaSingleMetricsStrategy({
          task: async (data: ParabolaTaskConfig) => [-((data[0]+a)**2) + b],
        }),
        fitness: new ParabolaMaxValueFitnessStrategy(),
        sorting: new DescendingSortingStrategy(),
        mutation: new ParabolaMutationStrategy(),
        crossover: new ParabolaCrossoverStrategy(),
        cache: new DummyMetricsCache(),
      }

      const search = new ComposedGeneticSearch<ParabolaArgumentGenome>(config, strategies, new IdGenerator());
      expect(search.generation).toEqual(1);
      expect(search.cache).toBeInstanceOf(DummyMetricsCache);
      expect(search.partitions).toEqual([50, 30, 20]);
      expect(search.getPopulationSummary().stagnationCounter).toEqual(0);

      await search.fit({
        stopCondition: (scores) => Math.abs(scores[0] - y) < 10e-6,
        beforeStep: () => void 0,
        afterStep: () => {
          const summary = search.getPopulationSummary();
          expect(summary.fitnessSummary.count >= 10).toBe(true);

          const roundedSummary = search.getPopulationSummary(4);
          expect(roundedSummary.fitnessSummary.count >= 10).toBe(true);
        },
      });

      const bestGenome = search.bestGenome;

      expect(bestGenome.x).toBeCloseTo(x, 2);
      expect(-((bestGenome.x+a)**2) + b).toBeCloseTo(y);
      expect(search.population.length).toBe(110);

      const population = search.population;

      {
        const oldFirstIdx = population[0].id;
        search.setPopulation(population);
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).toEqual(newFirstIdx);
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
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }

      {
        const oldFirstIdx = population[0].id;
        search.population = population;
        const newFirstIdx = search.population[0].id;
        expect(search.population).toEqual(population);
        expect(oldFirstIdx).toEqual(newFirstIdx);
      }

      search.refreshPopulation();
    });
  },
);
