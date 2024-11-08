type ZipTuple<TValue, TFiller> = {
  [K in keyof TValue]:
  | (TValue[K] extends Iterable<infer V> ? V : never)
  | TFiller;
};

type Comparable = string | number | boolean | Array<unknown>;
type Comparator<T> = (lhs: T, rhs: T) => number;

export function* sort<T>(data: Iterable<T>, comparator: Comparator<T>): Iterable<T> {
  const result = [...data];
  result.sort(comparator);
  for (const datum of result) {
    yield datum;
  }
}

export function* repeat<T>(item: T, repetitions: number): Iterable<T> {
  for (let i = repetitions; i > 0; --i) {
    yield item;
  }
}

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
