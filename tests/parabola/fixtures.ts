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

export class ParabolaSingleMetricsStrategy extends BaseMetricsStrategy<ParabolaArgumentGenome, MetricsStrategyConfig<ParabolaTaskConfig>, ParabolaTaskConfig> {
  protected createTaskInput(genome: ParabolaArgumentGenome): ParabolaTaskConfig {
    return [genome.id, genome.x];
  }
}

export class ParabolaMultiprocessingMetricsStrategy extends BaseMultiprocessingMetricsStrategy<ParabolaArgumentGenome, MultiprocessingMetricsStrategyConfig<ParabolaTaskConfig>, ParabolaTaskConfig> {
  protected createTaskInput(genome: ParabolaArgumentGenome): ParabolaTaskConfig {
    return [genome.id, genome.x];
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

export class ParabolaReferenceFitnessStrategy extends ReferenceLossFitnessStrategy {
  constructor(reference: number) {
    super({
      reference: [reference],
      weights: [1],
    });
  }
}

export class ParabolaMaxValueFitnessStrategy implements FitnessStrategyInterface {
  score(results: GenerationMetricsMatrix): GenerationFitnessColumn {
    return results.map((result) => result[0]);
  }
}