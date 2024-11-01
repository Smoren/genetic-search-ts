import {
  BaseGenome, BaseMultiprocessingRunnerStrategy,
  BaseRunnerStrategy,
  CrossoverStrategyInterface,
  MutationStrategyInterface,
  PopulateStrategyInterface,
  ReferenceLossScoringStrategy,
  RunnerStrategyConfig,
} from "../../src";
import { MultiprocessingRunnerStrategyConfig, NextIdGetter } from "../../src/types";

export type ParabolaArgumentGenome = BaseGenome & {
  id: number;
  x: number;
}

export type ParabolaTaskConfig = number;

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

export class ParabolaMutationStrategy implements MutationStrategyInterface<ParabolaArgumentGenome> {
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
    return genome.x;
  }
}

// export class ParabolaMultiprocessingRunnerStrategy extends BaseMultiprocessingRunnerStrategy<ParabolaArgumentGenome, MultiprocessingRunnerStrategyConfig<ParabolaTaskConfig>, ParabolaTaskConfig> {
//   protected createTaskInput(genome: ParabolaArgumentGenome): ParabolaTaskConfig {
//     return genome.x;
//   }
// }

export class ParabolaScoringStrategy extends ReferenceLossScoringStrategy {
  constructor(reference: number) {
    super({
      reference: [reference],
      weights: [1],
    });
  }
}
