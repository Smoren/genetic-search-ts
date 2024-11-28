import {
  BaseGenome,
  GenerationMetricsMatrix,
  GenomeMetricsRow,
  GroupedStatSummary,
  IdGeneratorInterface, RangeStatSummary,
  StatSummary
} from "./types";

export class IdGenerator<TGenome extends BaseGenome> implements IdGeneratorInterface<TGenome> {
  private id: number = 1;

  nextId(): number {
    return this.id++;
  }

  reset(population: TGenome[]): void {
    this.id = population.reduce((max, genome) => Math.max(max, genome.id), 0) + 1;
  }
}

export const fullCopyObject = <T extends Record<string, any>>(obj: T) => JSON.parse(JSON.stringify(obj)) as T;

export function round(value: number, precision: number): number {
  return Number(value.toFixed(precision));
}

export function createFilledArray<T>(length: number, value: T): T[] {
  return Array.from({ length }, () => value);
}

export function arraySum(input: number[]): number {
  return input.reduce((acc, val) => acc + val, 0);
}

export function arrayMean(input: number[]): number {
  return arraySum(input) / input.length;
}

export function arrayMedian(sortedInput: number[]): number {
  const middleIndex = Math.floor(sortedInput.length / 2);
  if (sortedInput.length % 2 !== 0) {
    return sortedInput[middleIndex];
  }
  return (sortedInput[middleIndex - 1] + sortedInput[middleIndex]) / 2;
}

export function arrayBinaryOperation<T>(lhs: Array<T>, rhs: Array<T>, operator: (lhs: T, rhs: T) => T): Array<T> {
  const result: Array<T> = [];
  const len = Math.min(lhs.length, rhs.length);

  for (let i = 0; i < len; ++i) {
    result.push(operator(lhs[i], rhs[i]));
  }

  return result;
}

export function getRandomArrayItem<T>(input: T[]): T {
  return input[Math.floor(Math.random() * input.length)];
}

export function normalizeMetricsRow(input: GenomeMetricsRow, reference: number): GenomeMetricsRow {
  // Find the minimum and maximum values in the array
  const minVal = Math.min(...input);
  const maxVal = Math.max(...input);

  // Calculate the maximum distance relative to the reference
  const maxDistance = Math.max(Math.abs(maxVal - reference), Math.abs(minVal - reference));
  const denominator = maxDistance || 1;

  return input.map(num => {
    // Normalize each number to the range from -1 to 1, where reference = 0
    return (num - reference) / denominator;
  });
}

export function normalizeMetricsMatrixColumns(
  input: GenerationMetricsMatrix,
  reference: GenomeMetricsRow,
): GenerationMetricsMatrix {
  const result = fullCopyObject(input);

  if (result.length === 0) {
    return result;
  }

  for (let i = 0; i < result[0].length; i++) {
    const columnNormalized = normalizeMetricsRow(result.map((row) => row[i]), reference[i]);
    for (let j = 0; j < result.length; j++) {
      result[j][i] = columnNormalized[j];
    }
  }

  return result;
}

export function normalizeMetricsMatrix(matrix: GenerationMetricsMatrix, reference: GenomeMetricsRow, abs: boolean = true): GenerationMetricsMatrix {
  const result = normalizeMetricsMatrixColumns(matrix, reference);

  if (abs) {
    return result.map((row) => row.map((x) => Math.abs(x)));
  }

  return result;
}

export function createEmptyStatSummary(): StatSummary {
  return {
    count: 0,
    best: 0,
    second: 0,
    mean: 0,
    median: 0,
    worst: 0,
  };
}

export function createEmptyGroupedStatSummary(): GroupedStatSummary {
  return {
    initial: createEmptyStatSummary(),
    crossover: createEmptyStatSummary(),
    mutation: createEmptyStatSummary(),
  };
}

export function createEmptyRangeStatSummary(): RangeStatSummary {
  return {
    min: 0,
    mean: 0,
    max: 0,
  };
}

export function calcStatSummary(sortedSource: number[]): StatSummary {
  if (sortedSource.length === 0) {
    return createEmptyStatSummary();
  }

  return {
    count: sortedSource.length,
    best: sortedSource[0],
    second: sortedSource[1] ?? 0,
    mean: arrayMean(sortedSource),
    median: arrayMedian(sortedSource),
    worst: sortedSource[sortedSource.length-1],
  };
}

export function calcRangeStatSummary(source: number[]): RangeStatSummary {
  if (source.length === 0) {
    return createEmptyRangeStatSummary();
  }

  return {
    min: Math.min(...source),
    mean: arrayMean(source),
    max: Math.max(...source),
  };
}

export function roundStatSummary(summary: StatSummary, precision: number): StatSummary {
  return {
    count: summary.count,
    best: round(summary.best, precision),
    second: round(summary.second, precision),
    mean: round(summary.mean, precision),
    median: round(summary.median, precision),
    worst: round(summary.worst, precision),
  };
}

export function roundGroupedStatSummary(summary: GroupedStatSummary, precision: number): GroupedStatSummary {
  return {
    initial: roundStatSummary(summary.initial, precision),
    crossover: roundStatSummary(summary.crossover, precision),
    mutation: roundStatSummary(summary.mutation, precision),
  };
}

export function roundRangeStatSummary(summary: RangeStatSummary, precision: number): RangeStatSummary {
  return {
    min: round(summary.min, precision),
    mean: round(summary.mean, precision),
    max: round(summary.max, precision),
  };
}
