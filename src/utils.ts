import { GenerationGradeMatrix, GenomeGradeRow, NextIdGetter } from "./types";

const EPSILON = 1e-10;

export const fullCopyObject = <T extends Record<string, any>>(obj: T) => JSON.parse(JSON.stringify(obj)) as T;

export function isClose(lhs: number, rhs: number) {
  return Math.abs(lhs - rhs) < EPSILON * 10;
}

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

export function createNextIdGetter(): NextIdGetter {
  return (() => {
    let id = 0;
    return () => ++id;
  })();
}

export function getRandomArrayItem<T>(input: T[]): T {
  return input[Math.floor(Math.random() * input.length)];
}

export function normalizeGradeRow(input: GenomeGradeRow, reference: number): GenomeGradeRow {
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

  // const max = Math.max(...input, reference);
  // const min = Math.min(...input, reference);
  //
  // let std = 1;
  // if (!isClose(min, max)) {
  //   std = max - min;
  // }
  //
  // return input.map((x) => (x - reference) / std);
}

export function normalizeGradeMatrixColumns(
  input: GenerationGradeMatrix,
  reference: GenomeGradeRow,
  inplace: boolean = false,
): GenerationGradeMatrix {
  const result = inplace ? input : fullCopyObject(input);

  if (result.length === 0) {
    return result;
  }

  for (let i = 0; i < result[0].length; i++) {
    const columnNormalized = normalizeGradeRow(result.map((row) => row[i]), reference[i]);
    for (let j = 0; j < result.length; j++) {
      result[j][i] = columnNormalized[j];
    }
  }

  return result;
}

export function normalizeGradeMatrix(matrix: GenerationGradeMatrix, reference: GenomeGradeRow): GenerationGradeMatrix {
  return normalizeGradeMatrixColumns(matrix, reference).map((row) => row.map((x) => Math.abs(x)));
}
