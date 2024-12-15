/**
 * A type representing a tuple of iterables.
 *
 * The type `ZipTuple<TValue, TFiller>` is a type representing a tuple of
 * iterables. It is constructed by taking each element of the tuple `TValue`
 * and replacing it with the type of the elements of the iterable at the
 * same position in the tuple. If the element is not an iterable, the type
 * `TFiller` is used instead.
 *
 * @template TValue - The tuple of iterables to be transformed.
 * @template TFiller - The type to be used when an element is not an iterable.
 */
type ZipTuple<TValue, TFiller> = {
  [K in keyof TValue]:
  | (TValue[K] extends Iterable<infer V> ? V : never)
  | TFiller;
};

/**
 * A type representing a value that can be compared.
 *
 * This type is the union of types that can be compared using the
 * default comparison functions, such as strings, numbers, booleans,
 * and arrays.
 */
type Comparable = string | number | boolean | Array<unknown>;

/**
 * A type representing a comparison function.
 *
 * A comparison function takes two values and returns a number
 * indicating the result of the comparison. It is used to compare
 * values in the sorting functions.
 *
 * @param lhs The first value to be compared.
 * @param rhs The second value to be compared.
 * @returns A number indicating the result of the comparison. A negative
 * number indicates that `lhs` is less than `rhs`, a positive number
 * indicates that `lhs` is greater than `rhs`, and 0 indicates that
 * `lhs` is equal to `rhs`.
 */
type Comparator<T> = (lhs: T, rhs: T) => number;

/**
 * Sorts an iterable of values based on a custom comparator.
 *
 * @template T - The type of the iterable to be sorted.
 * @param data - The iterable to be sorted.
 * @param comparator - The comparator function to be used for sorting.
 * @returns An iterable of the sorted values.
 *
 * @example
 * const numbers = [1, 2, 3];
 * const sorted = sort(numbers, (lhs, rhs) => lhs - rhs);
 * for (const number of sorted) {
 *   console.log(number);
 * }
 * // Prints 1, 2, 3
 */
export function* sort<T>(data: Iterable<T>, comparator: Comparator<T>): Iterable<T> {
  const result = [...data];
  result.sort(comparator);
  for (const datum of result) {
    yield datum;
  }
}

/**
 * Repeats the given item the specified number of times.
 *
 * @template T - The type of the item to be repeated.
 * @param item - The item to be repeated.
 * @param repetitions - The number of times to repeat the item.
 * @returns An iterable of the repeated items.
 */
export function* repeat<T>(item: T, repetitions: number): Iterable<T> {
  for (let i = repetitions; i > 0; --i) {
    yield item;
  }
}

/**
 * Combines multiple iterables into a single iterable of tuples. Each tuple
 * contains the elements from the input iterables at the same position.
 *
 * @template T - An array of iterables to be zipped together.
 * @param iterables - The iterables to be zipped.
 * @returns An iterable of tuples, where each tuple contains elements from
 * each of the input iterables at the corresponding position.
 *
 * @example
 * const numbers = [1, 2, 3];
 * const letters = ['a', 'b', 'c'];
 * for (const pair of zip(numbers, letters)) {
 *   console.log(pair); // Logs: [1, 'a'], [2, 'b'], [3, 'c']
 * }
 */
export function* zip<T extends Array<Iterable<unknown>>>(...iterables: T): Iterable<ZipTuple<T, never>> {
  const iterators = iterables.map(iterable => iterable[Symbol.iterator]());

  iterate: while (true) {
    const tuple = [];

    for (const iterator of iterators) {
      const next = iterator.next();
      if (next.done) {
        break iterate;
      }
      tuple.push(next.value);
    }

    yield tuple as ZipTuple<T, never>;
  }
}

/**
 * Returns an iterable of unique elements from the input data, where uniqueness
 * is determined by the value returned from the provided `compareBy` function.
 *
 * @template T - The type of elements in the input data.
 * @param data - The input iterable containing elements to be filtered for uniqueness.
 * @param compareBy - A function that takes an element from the input data and
 * returns a comparable value to determine uniqueness.
 * @returns An iterable of unique elements from the input data.
 */
export function* distinctBy<T>(
  data: Iterable<T>,
  compareBy: (datum: T) => Comparable,
): Iterable<T> {
  const used = new Set();

  for (const datum of data) {
    const comparable = compareBy(datum);
    if (!used.has(comparable)) {
      yield datum;
      used.add(comparable);
    }
  }
}
