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
  NextIdGetter, BaseMutationStrategy, BaseMutationStrategyConfig,
} from "../../src";

export type ParabolaArgumentGenome = BaseGenome & {
  id: number;
  x: number;
}

export type ParabolaTaskConfig = [number, number];

function createRandomParabolaArgument(id: number): ParabolaArgumentGenome {
  return { id, x: Math.random() * 200 - 100 };
}

export class ParabolaPopulateStrategy implements PopulateStrategyInterface<ParabolaArgumentGenome> {
  populate(size: number, nextIdGetter: NextIdGetter): ParabolaArgumentGenome[] {
    const result: ParabolaArgumentGenome[] = [];
    for (let i=0; i<size; ++i) {
      result.push(createRandomParabolaArgument(nextIdGetter()));
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

export class ParabolaSingleRunnerStrategy extends BaseRunnerStrategy<ParabolaArgumentGenome, RunnerStrategyConfig<ParabolaTaskConfig>, ParabolaTaskConfig> {
  protected createTaskInput(genome: ParabolaArgumentGenome): ParabolaTaskConfig {
    return [genome.id, genome.x];
  }
}

export class ParabolaMultiprocessingRunnerStrategy extends BaseMultiprocessingRunnerStrategy<ParabolaArgumentGenome, MultiprocessingRunnerStrategyConfig<ParabolaTaskConfig>, ParabolaTaskConfig> {
  protected createTaskInput(genome: ParabolaArgumentGenome): ParabolaTaskConfig {
    return [genome.id, genome.x];
  }
}

export class ParabolaCachedMultiprocessingRunnerStrategy extends BaseCachedMultiprocessingRunnerStrategy<ParabolaArgumentGenome, MultiprocessingRunnerStrategyConfig<ParabolaTaskConfig>, ParabolaTaskConfig> {
  protected createTaskInput(genome: ParabolaArgumentGenome): ParabolaTaskConfig {
    return [genome.id, genome.x];
  }

  protected getGenomeId(input: ParabolaTaskConfig): number {
    return input[0];
  }
}

export class ParabolaReferenceScoringStrategy extends ReferenceLossScoringStrategy {
  constructor(reference: number) {
    super({
      reference: [reference],
      weights: [1],
    });
  }
}

export class ParabolaTransparentScoringStrategy implements ScoringStrategyInterface {
  score(results: GenerationGradeMatrix): GenerationScoreColumn {
    return results.map((result) => result[0]);
  }
}
