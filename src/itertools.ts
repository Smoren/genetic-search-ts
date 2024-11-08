type ZipTuple<TValue, TFiller> = {
  [K in keyof TValue]:
  | (TValue[K] extends Iterable<infer V> ? V : never)
  | TFiller;
};

type Comparable = string | number | boolean | Array<unknown>;

export function* zip<T extends Array<Iterable<unknown>>>(
  ...iterables: T
): Iterable<ZipTuple<T, never>> {
  iterate: while (true) {
    const tuple = [];
    const iterators = iterables.map(iterable => iterable[Symbol.iterator]());

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

export function* distinct<T>(
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
