import { GenerationMetricsMatrix, GenomeMetricsRow } from "./types";

export const fullCopyObject = <T extends Record<string, any>>(obj: T) => JSON.parse(JSON.stringify(obj)) as T;

export function arraySum(input: number[]): number {
  return input.reduce((acc, val) => acc + val, 0);
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
