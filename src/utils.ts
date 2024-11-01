import { GradeRow } from "./types";

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

export function createNextIdGenerator(): () => number {
  return (() => {
    let id = 0;
    return () => ++id;
  })();
}

export function getRandomArrayItem<T>(input: T[]): T {
  return input[Math.floor(Math.random() * input.length)];
}

export function normalizeGradeRow(input: GradeRow, mean: number): number[] {
  const max = Math.max(...input, mean);
  const min = Math.min(...input, mean);

  let std = 1;
  if (!isClose(min, max)) {
    std = max - min;
  } else if (!isClose(mean, max)) {
    std = Math.abs(max - mean);
  }

  return input.map((x) => (x - mean) / std);
}

export function normalizeGradeMatrixColumns(input: GradeRow[], mean: GradeRow, inplace: boolean = false): number[][] {
  const result = inplace ? input : fullCopyObject(input);

  if (result.length === 0) {
    return result;
  }

  for (let i = 0; i < result[0].length; i++) {
    const columnNormalized = normalizeGradeRow(result.map((row) => row[i]), mean[i]);
    for (let j = 0; j < result.length; j++) {
      result[j][i] = columnNormalized[j];
    }
  }

  return result;
}

export function normalizeGradeMatrix(matrix: GradeRow[], reference: GradeRow): number[][] {
  return normalizeGradeMatrixColumns(matrix, reference).map((row) => row.map((x) => Math.abs(x)));
}
