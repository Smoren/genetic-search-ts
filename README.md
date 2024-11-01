# Genetic Algorithm Implementation for TypeScript

[![npm](https://img.shields.io/npm/v/genetic-search.svg)](https://www.npmjs.com/package/genetic-search)
[![npm](https://img.shields.io/npm/dm/genetic-search.svg?style=flat)](https://www.npmjs.com/package/genetic-search)
[![Coverage Status](https://coveralls.io/repos/github/Smoren/genetic-search-ts/badge.svg?branch=master&rand=222)](https://coveralls.io/github/Smoren/genetic-search-ts?branch=master)
![Build and test](https://github.com/Smoren/genetic-search-ts/actions/workflows/test.yml/badge.svg)
[![Minified Size](https://badgen.net/bundlephobia/minzip/genetic-search)](https://bundlephobia.com/result?p=genetic-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Setup
-----

```bash
npm i itertools-ts
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
  runner: new ParabolaCachedMultiprocessingRunnerStrategy({
    poolSize: 4,
    task: async (data: ParabolaTaskConfig) => [-((data[1] - 12)**2) - 3],
  }),
  scoring: new ParabolaTransparentScoringStrategy(),
  mutation: new ParabolaMutationStrategy(),
  crossover: new ParabolaCrossoverStrategy(),
}

const search = new GeneticSearch(config, strategies, createNextIdGetter());
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
  BaseMultiprocessingRunnerStrategy,
  BaseCachedMultiprocessingRunnerStrategy,
  BaseRunnerStrategy,
  GenerationGradeMatrix,
  CrossoverStrategyInterface,
  GenerationScoreColumn,
  MutationStrategyInterface,
  PopulateStrategyInterface,
  ReferenceLossScoringStrategy,
  RunnerStrategyConfig,
  ScoringStrategyInterface,
  MultiprocessingRunnerStrategyConfig,
  NextIdGetter,
} from "genetic-search";

type ParabolaArgumentGenome = BaseGenome & {
  id: number;
  x: number;
}

type ParabolaTaskConfig = [number, number];

class ParabolaPopulateStrategy implements PopulateStrategyInterface<ParabolaArgumentGenome> {
  populate(size: number, nextIdGetter: NextIdGetter): ParabolaArgumentGenome[] {
    const createRandomParabolaArgument = (id: number): ParabolaArgumentGenome => {
      return { id, x: Math.random() * 200 - 100 };
    }

    const result: ParabolaArgumentGenome[] = [];
    for (let i=0; i<size; ++i) {
      result.push(createRandomParabolaArgument(nextIdGetter()));
    }
    return result;
  }
}

class ParabolaMutationStrategy implements MutationStrategyInterface<ParabolaArgumentGenome> {
  mutate(genome: ParabolaArgumentGenome, newGenomeId: number): ParabolaArgumentGenome {
    return { x: genome.x + Math.random() * 10 - 5, id: newGenomeId };
  }
}

class ParabolaCrossoverStrategy implements CrossoverStrategyInterface<ParabolaArgumentGenome> {
  cross(lhs: ParabolaArgumentGenome, rhs: ParabolaArgumentGenome, newGenomeId: number): ParabolaArgumentGenome {
    return { x: (lhs.x + rhs.x) / 2, id: newGenomeId };
  }
}

class ParabolaCachedMultiprocessingRunnerStrategy extends BaseCachedMultiprocessingRunnerStrategy<ParabolaArgumentGenome, MultiprocessingRunnerStrategyConfig<ParabolaTaskConfig>, ParabolaTaskConfig> {
  protected createTaskInput(genome: ParabolaArgumentGenome): ParabolaTaskConfig {
    return [genome.id, genome.x];
  }

  protected getGenomeId(input: ParabolaTaskConfig): number {
    return input[0];
  }
}

class ParabolaTransparentScoringStrategy implements ScoringStrategyInterface {
  score(results: GenerationGradeMatrix): GenerationScoreColumn {
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
