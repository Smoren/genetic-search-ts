# Multiprocessing Genetic Algorithm Implementation for TypeScript

[![npm](https://img.shields.io/npm/v/genetic-search.svg)](https://www.npmjs.com/package/genetic-search)
[![npm](https://img.shields.io/npm/dm/genetic-search.svg?style=flat)](https://www.npmjs.com/package/genetic-search)
[![Coverage Status](https://coveralls.io/repos/github/Smoren/genetic-search-ts/badge.svg?branch=master&rand=222)](https://coveralls.io/github/Smoren/genetic-search-ts?branch=master)
![Build and test](https://github.com/Smoren/genetic-search-ts/actions/workflows/test.yml/badge.svg)
[![Minified Size](https://badgen.net/bundlephobia/minzip/genetic-search)](https://bundlephobia.com/result?p=genetic-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Logo](docs/images/logo.png)

Overview
--------

This project provides a TypeScript implementation of a genetic algorithm that can be used for optimization problems. The algorithm is designed to be highly customizable and can be used for a wide range of applications.

Features
--------

* **Multiprocessing support**: The algorithm can be run in parallel using multiple processes, making it suitable for large-scale optimization problems.
* **Customizable**: The algorithm can be customized by providing custom implementations for various components, such as the population generator, mutation strategy, crossover strategy, and fitness function.
* **Type-safe**: The project uses TypeScript, which provides type safety and helps catch errors at compile-time.

Setup
-----

For single process (including browser apps) use:
```bash
npm i genetic-search
```

For multiprocessing in node environment use:
```bash
npm i genetic-search-multiprocess
```

Usage example
-------------

Let's get a max value of the parabola: `y = -(x-12)^2 - 3`.

```typescript
import type {
  GeneticSearchConfig,
  GeneticSearchStrategyConfig,
} from "genetic-search";
import {
  GeneticSearch,
  SimpleMetricsCache,
  DescendingSortingStrategy,
} from "genetic-search";

const config: GeneticSearchConfig = {
  populationSize: 100,
  survivalRate: 0.5,
  crossoverRate: 0.5,
};

const strategies: GeneticSearchStrategyConfig<ParabolaArgumentGenome> = {
  populate: new ParabolaPopulateStrategy(),
  metrics: new ParabolaMultiprocessingMetricsStrategy({
    poolSize: 4,
    task: async (data) => [-((data[0] - 12)**2) - 3],
    onTaskResult: () => void 0,
  }),
  fitness: new ParabolaMaxValueFitnessStrategy(),
  sorting: new DescendingSortingStrategy(),
  mutation: new ParabolaMutationStrategy(),
  crossover: new ParabolaCrossoverStrategy(),
  cache: new SimpleMetricsCache(),
}

const search = new GeneticSearch(config, strategies);

expect(search.partitions).toEqual([50, 25, 25]);

await search.fit({
  generationsCount: 100,
  beforeStep: () => void 0,
  afterStep: () => void 0,
});

const bestGenome = search.bestGenome;
console.log('Best genome:', bestGenome);
```

Strategies implementation:

```typescript
import type {
  BaseGenome,
  BaseMutationStrategyConfig,
  CrossoverStrategyInterface,
  FitnessStrategyInterface,
  GenerationFitnessColumn,
  GenerationMetricsMatrix,
  IdGeneratorInterface,
  PopulateStrategyInterface,
} from "genetic-search";
import type { MultiprocessingMetricsStrategyConfig } from "genetic-search-multiprocess";
import { BaseMutationStrategy } from "genetic-search";
import { MultiprocessingMetricsStrategyConfig } from "genetic-search-multiprocess";

export type ParabolaArgumentGenome = BaseGenome & {
  id: number;
  x: number;
}

export type ParabolaTaskConfig = [number];

export class ParabolaPopulateStrategy implements PopulateStrategyInterface<ParabolaArgumentGenome> {
  populate(size: number, idGenerator: IdGeneratorInterface<ParabolaArgumentGenome>): ParabolaArgumentGenome[] {
    const result: ParabolaArgumentGenome[] = [];
    for (let i=0; i<size; ++i) {
      result.push({ id: idGenerator.nextId(), x: Math.random() * 200 - 100 });
    }
    return result;
  }
}

export class ParabolaMutationStrategy extends BaseMutationStrategy<ParabolaArgumentGenome, BaseMutationStrategyConfig> {
  constructor() {
    super({ probability: 1 });
  }

  mutate(genome: ParabolaArgumentGenome, newGenomeId: number): ParabolaArgumentGenome {
    return { x: genome.x + Math.random() * 10 - 5, id: newGenomeId };
  }
}

export class ParabolaCrossoverStrategy implements CrossoverStrategyInterface<ParabolaArgumentGenome> {
  cross(lhs: ParabolaArgumentGenome, rhs: ParabolaArgumentGenome, newGenomeId: number): ParabolaArgumentGenome {
    return { x: (lhs.x + rhs.x) / 2, id: newGenomeId };
  }
}

export class ParabolaMultiprocessingMetricsStrategy extends BaseMultiprocessingMetricsStrategy<ParabolaArgumentGenome, MultiprocessingMetricsStrategyConfig<ParabolaTaskConfig>, ParabolaTaskConfig> {
  protected createTaskInput(genome: ParabolaArgumentGenome): ParabolaTaskConfig {
    return [genome.x];
  }
}

export class ParabolaMaxValueFitnessStrategy implements FitnessStrategyInterface {
  score(results: GenerationMetricsMatrix): GenerationFitnessColumn {
    return results.map((result) => result[0]);
  }
}
```

Api Reference
-------------

For detailed documentation and usage examples, please refer to the [API documentation](https://smoren.github.io/genetic-search-ts/).

Unit testing
------------

```bash
npm i
npm run test
```

License
-------

Genetic Search TS is licensed under the MIT License.
