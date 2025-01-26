import type {
  BaseGenome,
  EvaluatedGenome,
  GenerationFitnessColumn,
  GenerationPhenomeMatrix,
  PhenomeRow,
  GroupedStatSummary,
  IdGeneratorInterface,
  Population,
  RangeStatSummary,
  StatSummary,
  ArrayManagerInterface,
} from "./types";
import {zip} from "./itertools";

/**
 * Generates unique identifiers for genomes.
 *
 * @template TGenome The type of genome objects in the population.
 *
 * @category Utils
 */
export class IdGenerator<TGenome extends BaseGenome> implements IdGeneratorInterface<TGenome> {
  private id: number = 1;

  public nextId(): number {
    return this.id++;
  }

  public reset(population: TGenome[]): void {
    this.id = population.reduce((max, genome) => Math.max(max, genome.id), 0) + 1;
  }
}

/**
 * Manages an array of `T` objects.
 *
 * @template T The type of the objects to manage.
 */
export class ArrayManager<T> implements ArrayManagerInterface<T> {
  protected readonly _data: T[];

  /**
   * Creates a new `ArrayManager` from an array of `T` objects.
   *
   * @param data The array of `T` objects to manage.
   */
  constructor(data: T[]) {
    this._data = data;
  }

  /**
   * Updates elements of the managed array that match the given filter.
   *
   * @param filter A function that returns true if the element should be updated.
   * @param update A function that updates the element.
   *
   * @returns The updated items.
   */
  update(filter: (genome: T) => boolean, update: (genome: T) => void): T[] {
    let updated: T[] = [];
    for (const genome of this._data) {
      if (filter(genome)) {
        update(genome);
        updated.push(genome);
      }
    }
    return updated;
  }

  /**
   * Removes elements of the managed array that match the given filter and optionally sorts the rest of the array.
   *
   * @param filter A function that returns true if the element should be removed.
   * @param maxCount The maximum number of elements to remove.
   * @param order The order to sort the remaining elements.
   *
   * @returns The removed items.
   */
  remove(filter: (genome: T) => boolean, maxCount: number = Infinity, order: 'asc' | 'desc' = 'asc'): T[] {
    const buf = [...this._data];

    if (order === 'desc') {
      buf.reverse();
    }

    this._data.length = 0;
    let removed: T[] = [];

    for (const genome of buf) {
      if (filter(genome) && removed.length < maxCount) {
        removed.push(genome);
      } else {
        this._data.push(genome);
      }
    }

    if (order === 'desc') {
      this._data.reverse();
    }

    return removed;
  }
}

/**
 * Creates a deep copy of an object.
 *
 * @template T The type of the object to copy.
 * @param obj The object to copy.
 * @returns A deep copy of the object.
 *
 * @category Utils
 */
export const fullCopyObject = <T extends Record<string, any>>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;

/**
 * Rounds a number to a given precision.
 *
 * @param value The number to round.
 * @param precision The precision to round to.
 * @returns The rounded number.
 *
 * @category Utils
 */
export function round(value: number, precision: number): number {
  return Number(value.toFixed(precision));
}

/**
 * Generates an array of a given length, filled with a specified value.
 *
 * @template T The type of the values in the array.
 * @param length The length of the array to generate.
 * @param value The value to fill the array with.
 * @returns An array of the specified length, filled with the specified value.
 *
 * @category Utils
 */
export function createFilledArray<T>(length: number, value: T): T[] {
  return Array.from({ length }, () => value);
}

/**
 * Calculates the sum of an array of numbers.
 *
 * @param input The array of numbers to sum.
 * @returns The sum of the input array.
 *
 * @category Utils
 */
export function arraySum(input: number[]): number {
  return input.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculates the mean of an array of numbers.
 *
 * @param input The array of numbers to calculate the mean of.
 * @returns The mean of the input array.
 *
 * @category Utils
 */
export function arrayMean(input: number[]): number {
  return arraySum(input) / input.length;
}

/**
 * Calculates the median of a sorted array of numbers.
 *
 * @param sortedInput The sorted array of numbers to find the median of.
 * @returns The median value of the input array.
 *
 * @category Utils
 */
export function arrayMedian(sortedInput: number[]): number {
  const middleIndex = Math.floor(sortedInput.length / 2);
  if (sortedInput.length % 2 !== 0) {
    return sortedInput[middleIndex];
  }
  return (sortedInput[middleIndex - 1] + sortedInput[middleIndex]) / 2;
}

/**
 * Applies a binary operator to two arrays of the same length.
 *
 * @template T The type of the values in the arrays.
 * @param lhs The left-hand side array.
 * @param rhs The right-hand side array.
 * @param operator The binary operator to apply.
 * @returns A new array with the result of applying the operator to each pair of values.
 *
 * @category Utils
 */
export function arrayBinaryOperation<T>(lhs: Array<T>, rhs: Array<T>, operator: (lhs: T, rhs: T) => T): Array<T> {
  const result: Array<T> = [];
  const len = Math.min(lhs.length, rhs.length);

  for (let i = 0; i < len; ++i) {
    result.push(operator(lhs[i], rhs[i]));
  }

  return result;
}

/**
 * Returns a random element from the input array.
 *
 * @template T The type of the values in the array.
 * @param input The array to select a random element from.
 * @returns A random element from the input array.
 *
 * @category Utils
 */
export function getRandomArrayItem<T>(input: T[]): T {
  return input[Math.floor(Math.random() * input.length)];
}

/**
 * Normalizes an array of numbers to the range from -1 to 1, where the `reference` value is mapped to 0.
 *
 * @param input The array of numbers to normalize.
 * @param reference The reference value to map to 0.
 * @returns The normalized array of numbers.
 *
 * @category Utils
 */
export function normalizePhenomeRow(input: PhenomeRow, reference: number): PhenomeRow {
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

/**
 * Normalizes the columns of a matrix of phenome to the range from -1 to 1, where the `reference` value is mapped to 0.
 *
 * @param input The matrix of phenome to normalize.
 * @param reference The reference value to map to 0.
 * @returns The normalized matrix of phenome.
 *
 * @category Utils
 */
export function normalizePhenomeMatrixColumns(
  input: GenerationPhenomeMatrix,
  reference: PhenomeRow,
): GenerationPhenomeMatrix {
  const result = fullCopyObject(input);

  if (result.length === 0) {
    return result;
  }

  for (let i = 0; i < result[0].length; i++) {
    const columnNormalized = normalizePhenomeRow(result.map((row) => row[i]), reference[i]);
    for (let j = 0; j < result.length; j++) {
      result[j][i] = columnNormalized[j];
    }
  }

  return result;
}

/**
 * Normalizes the columns of a matrix of phenome to the range from -1 to 1, where the `reference` value is mapped to 0.
 *
 * @param matrix The matrix of phenome to normalize.
 * @param reference The reference value to map to 0.
 * @param abs Whether to take the absolute value of the normalized values.
 * @returns The normalized matrix of phenome.
 *
 * @category Utils
 */
export function normalizePhenomeMatrix(matrix: GenerationPhenomeMatrix, reference: PhenomeRow, abs: boolean = true): GenerationPhenomeMatrix {
  const result = normalizePhenomeMatrixColumns(matrix, reference);

  if (abs) {
    return result.map((row) => row.map((x) => Math.abs(x)));
  }

  return result;
}

/**
 * Creates an empty `StatSummary` object.
 *
 * A `StatSummary` object contains the count of genomes in the population,
 * as well as the best, second best, mean, median, and worst values.
 * This function initializes a `StatSummary` with all values set to zero.
 *
 * @returns An initialized `StatSummary` object with all fields set to zero.
 *
 * @category Utils
 */
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

/**
 * Creates an empty `GroupedStatSummary` object.
 *
 * A `GroupedStatSummary` object contains a summary of the statistics of a population of genomes,
 * grouped by origin into three categories: initial, crossover, and mutation.
 * This function initializes a `GroupedStatSummary` with all values set to zero.
 *
 * @returns An initialized `GroupedStatSummary` object with all fields set to zero.
 *
 * @category Utils
 */
export function createEmptyGroupedStatSummary(): GroupedStatSummary {
  return {
    initial: createEmptyStatSummary(),
    crossover: createEmptyStatSummary(),
    mutation: createEmptyStatSummary(),
  };
}

/**
 * Creates an empty `RangeStatSummary` object.
 *
 * A `RangeStatSummary` object contains the minimum, mean, and maximum values
 * for a set of numerical data.
 * This function initializes a `RangeStatSummary` with all values set to zero.
 *
 * @returns An initialized `RangeStatSummary` object with all fields set to zero.
 *
 * @category Utils
 */
export function createEmptyRangeStatSummary(): RangeStatSummary {
  return {
    min: 0,
    mean: 0,
    max: 0,
  };
}

/**
 * Calculates a summary of the statistics for a sorted array of numbers.
 *
 * The summary includes the count of numbers in the array,
 * as well as the best, second best, mean, median, and worst values.
 *
 * @param sortedSource The sorted array of numbers.
 * @returns A summary of the statistics for the array of numbers.
 *
 * @category Utils
 */
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

/**
 * Calculates a summary of the statistics for a sorted array of numbers.
 *
 * The summary includes the minimum, mean, and maximum values
 * for a set of numerical data.
 *
 * @param source The array of numbers.
 * @returns A summary of the statistics for the array of numbers.
 *
 * @category Utils
 */
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

/**
 * Rounds the fields of a StatSummary object to a given precision.
 *
 * @param summary The StatSummary object to round.
 * @param precision The number of decimal places to round to.
 * @returns A new StatSummary object with rounded fields.
 *
 * @category Utils
 */
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

/**
 * Rounds the fields of a GroupedStatSummary object to a given precision.
 *
 * This function rounds the statistics in each category of the GroupedStatSummary
 * (initial, crossover, mutation) to the specified number of decimal places.
 *
 * @param summary The GroupedStatSummary object to round.
 * @param precision The number of decimal places to round to.
 * @returns A new GroupedStatSummary object with rounded fields.
 *
 * @category Utils
 */
export function roundGroupedStatSummary(summary: GroupedStatSummary, precision: number): GroupedStatSummary {
  return {
    initial: roundStatSummary(summary.initial, precision),
    crossover: roundStatSummary(summary.crossover, precision),
    mutation: roundStatSummary(summary.mutation, precision),
  };
}

/**
 * Rounds the fields of a RangeStatSummary object to a given precision.
 *
 * This function rounds the minimum, mean, and maximum values of the RangeStatSummary
 * to the specified number of decimal places.
 *
 * @param summary The RangeStatSummary object to round.
 * @param precision The number of decimal places to round to.
 * @returns A new RangeStatSummary object with rounded fields.
 *
 * @category Utils
 */
export function roundRangeStatSummary(summary: RangeStatSummary, precision: number): RangeStatSummary {
  return {
    min: round(summary.min, precision),
    mean: round(summary.mean, precision),
    max: round(summary.max, precision),
  };
}

/**
 * Creates an array of `EvaluatedGenome` objects from a population and its fitness and phenome.
 *
 * @param population The population of genomes.
 * @param fitnessColumn The fitness column of the population.
 * @param phenomeMatrix The phenome matrix of the population.
 * @returns An array of EvaluatedGenome objects.
 *
 * @category Utils
 */
export function createEvaluatedPopulation<TGenome extends BaseGenome>(
  population: Population<TGenome>,
  fitnessColumn: GenerationFitnessColumn,
  phenomeMatrix: GenerationPhenomeMatrix,
): Array<EvaluatedGenome<TGenome>> {
  const zipped = [...zip(population, fitnessColumn, phenomeMatrix)];
  return zipped.map(([genome, fitness, phenome]) => ({ genome, fitness, phenome }));
}

/**
 * Extracts the population, fitness column, and phenome matrix from an array of
 * [[EvaluatedGenome]] objects.
 *
 * @param input The array of [[EvaluatedGenome]] objects.
 * @returns An array of three elements: the population, fitness column, and phenome matrix.
 *
 * @category Utils
 */
export function extractEvaluatedPopulation<TGenome extends BaseGenome>(
  input: Array<EvaluatedGenome<TGenome>>,
): [Population<TGenome>, GenerationFitnessColumn, GenerationPhenomeMatrix] {
  return [
    input.map((x) => x.genome),
    input.map((x) => x.fitness),
    input.map((x) => x.phenome),
  ];
}
