import {
  BaseGenome,
  BasePhenomeStrategy,
  CrossoverStrategyInterface,
  FitnessStrategyInterface,
  GenerationFitnessColumn,
  GenerationPhenomeMatrix,
  GenomePhenomeRow,
  PhenomeStrategyConfig,
  MutationStrategyInterface,
  PopulateStrategyInterface,
  Population,
  IdGeneratorInterface,
} from "../../src";

export type TravelingGenome = BaseGenome & {
  id: number;
  path: number[];
}

export type TravelingTaskConfig = [number[], number[][]];

export type TravelingSinglePhenomeStrategyConfig = PhenomeStrategyConfig<TravelingTaskConfig> & {
  distanceMatrix: number[][];
}

export function travelingPhenomeTask(data: TravelingTaskConfig): Promise<GenomePhenomeRow> {
  const [path, distanceMatrix] = data;
  let totalDistance = 0;

  for (let i = 0; i < path.length; i++) {
    const from = path[i];
    const to = path[(i + 1) % path.length];
    totalDistance += distanceMatrix[from][to];
  }

  return Promise.resolve([1 / totalDistance]);
}

export function calcPathDistance(path: number[], distanceMatrix: number[][]): number {
  let totalDistance = 0;

  for (let i = 0; i < path.length; i++) {
    const from = path[i];
    const to = path[(i + 1) % path.length];
    totalDistance += distanceMatrix[from][to];
  }

  return totalDistance;
}

export class TravelingPopulateStrategy implements PopulateStrategyInterface<TravelingGenome> {
  private pathSize: number;

  constructor(pathSize: number) {
    this.pathSize = pathSize;
  }

  populate(size: number, idGenerator: IdGeneratorInterface<TravelingGenome>): Population<TravelingGenome> {
    const population = [];
    for (let i = 0; i < size; i++) {
      const path = Array.from({length: this.pathSize}, (_, index) => index).sort();
      population.push({id: idGenerator.nextId(), path});
    }
    return population;
  }
}

export class TravelingMutationStrategy implements MutationStrategyInterface<TravelingGenome> {
  mutate(genome: TravelingGenome, newGenomeId: number): TravelingGenome {
    const leftIndex = Math.floor(Math.random() * genome.path.length);
    const rightIndex = Math.floor(Math.random() * genome.path.length);
    const mutatedPath = [...genome.path];

    [mutatedPath[leftIndex], mutatedPath[rightIndex]] = [mutatedPath[rightIndex], mutatedPath[leftIndex]];

    return {
      id: newGenomeId,
      path: mutatedPath,
    };
  }
}

export class TravelingCrossoverStrategy implements CrossoverStrategyInterface<TravelingGenome> {
  cross(parents: TravelingGenome[], newGenomeId: number): TravelingGenome {
    const [lhs, rhs] = parents;
    const length = lhs.path.length;

    const start = Math.floor(Math.random() * length);
    const end = Math.floor(Math.random() * (length - start)) + start;

    const childPath = new Array(length).fill(-1);

    for (let i = start; i <= end; i++) {
      childPath[i] = lhs.path[i];
    }

    let currentIndex = 0;
    for (let i = 0; i < length; i++) {
      if (!childPath.includes(rhs.path[i])) {
        while (childPath[currentIndex] !== -1) {
          currentIndex++;
        }
        childPath[currentIndex] = rhs.path[i];
      }
    }

    return {
      id: newGenomeId,
      path: childPath,
    };
  }
}

export class TravelingSinglePhenomeStrategy extends BasePhenomeStrategy<
  TravelingGenome,
  TravelingSinglePhenomeStrategyConfig,
  TravelingTaskConfig
> {
  protected createTaskInput(genome: TravelingGenome): TravelingTaskConfig {
    return [genome.path, this.config.distanceMatrix];
  }
}

export class TravelingFitnessStrategy implements FitnessStrategyInterface {
  score(results: GenerationPhenomeMatrix): GenerationFitnessColumn {
    return results.map((result) => result[0]);
  }
}

export function getPermutations(n: number): number[][] {
  const results: number[][] = [];

  const permute = (current: number[], remaining: number[]) => {
    if (remaining.length === 0) {
      results.push([...current]);
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i];
      const newRemaining = remaining.filter((_, index) => index !== i);
      permute([...current, next], newRemaining);
    }
  };

  permute([], Array.from({ length: n }, (_, i) => i));

  return results;
}
