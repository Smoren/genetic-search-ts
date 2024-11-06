# Multiprocessing Genetic Algorithm Implementation for TypeScript

[![npm](https://img.shields.io/npm/v/genetic-search.svg)](https://www.npmjs.com/package/genetic-search)
[![npm](https://img.shields.io/npm/dm/genetic-search.svg?style=flat)](https://www.npmjs.com/package/genetic-search)
[![Coverage Status](https://coveralls.io/repos/github/Smoren/genetic-search-ts/badge.svg?branch=master&rand=222)](https://coveralls.io/github/Smoren/genetic-search-ts?branch=master)
![Build and test](https://github.com/Smoren/genetic-search-ts/actions/workflows/test.yml/badge.svg)
[![Minified Size](https://badgen.net/bundlephobia/minzip/genetic-search)](https://bundlephobia.com/result?p=genetic-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Setup
-----

```bash
npm i genetic-search
```

Usage example
-------------

Let's get a max value of the parabola: `y = -(x-12)^2 - 3`.

```typescript
import {
  GeneticSearchConfig,
  GeneticSearchStrategyConfig,
  GeneticSearch,
} from "genetic-search";

const config: GeneticSearchConfig = {
  populationSize: 100,
  survivalRate: 0.5,
  crossoverRate: 0.5,
};

const strategies: GeneticSearchStrategyConfig<ParabolaArgumentGenome> = {
  populate: new ParabolaPopulateStrategy(),
  metrics: new ParabolaCachedMultiprocessingMetricsStrategy({
    poolSize: 4,
    task: async (data) => [-((data[1] - 12)**2) - 3],
    onTaskResult: (result) => console.log('task result', result),
  }),
  fitness: new ParabolaMaxValueFitnessStrategy(),
  mutation: new ParabolaMutationStrategy(),
  crossover: new ParabolaCrossoverStrategy(),
}

const search = new GeneticSearch(config, strategies);
await search.fit({
  generationsCount: 100,
  afterStep: (generation, scores) => console.log(
    `generation: ${generation+1}, best id: #${search.bestGenome.id}, best score: ${scores[0]}`
  ),
});

const bestGenome = search.bestGenome;
console.log('Best genome:', bestGenome);
```

Strategies implementation:

```typescript
import {
  BaseGenome,
  BaseMultiprocessingMetricsStrategy,
  BaseCachedMultiprocessingMetricsStrategy,
  BaseMetricsStrategy,
  GenerationMetricsMatrix,
  CrossoverStrategyInterface,
  GenerationFitnessColumn,
  PopulateStrategyInterface,
  ReferenceLossFitnessStrategy,
  MetricsStrategyConfig,
  FitnessStrategyInterface,
  MultiprocessingMetricsStrategyConfig,
  NextIdGetter,
  BaseMutationStrategy,
  BaseMutationStrategyConfig,
} from "genetic-search";

export type ParabolaArgumentGenome = BaseGenome & {
  id: number;
  x: number;
}

export type ParabolaTaskConfig = [number, number];

export class ParabolaPopulateStrategy implements PopulateStrategyInterface<ParabolaArgumentGenome> {
  populate(size: number, nextIdGetter: NextIdGetter): ParabolaArgumentGenome[] {
    const result: ParabolaArgumentGenome[] = [];
    for (let i=0; i<size; ++i) {
      result.push({ id: nextIdGetter(), x: Math.random() * 200 - 100 });
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

export class ParabolaCachedMultiprocessingMetricsStrategy extends BaseCachedMultiprocessingMetricsStrategy<ParabolaArgumentGenome, MultiprocessingMetricsStrategyConfig<ParabolaTaskConfig>, ParabolaTaskConfig> {
  protected createTaskInput(genome: ParabolaArgumentGenome): ParabolaTaskConfig {
    return [genome.id, genome.x];
  }

  protected getGenomeId(input: ParabolaTaskConfig): number {
    return input[0];
  }
}

export class ParabolaMaxValueFitnessStrategy implements FitnessStrategyInterface {
  score(results: GenerationMetricsMatrix): GenerationFitnessColumn {
    return results.map((result) => result[0]);
  }
}

```


Unit testing
------------

```bash
npm i
npm run test
```

License
-------

Genetic Search TS is licensed under the MIT License.
