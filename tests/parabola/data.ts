export function dataProviderForGetParabolaMax(): Array<[[number, number], [number, number]]> {
  return [
    [
      [0, 0],
      [0, 0],
    ],
    [
      [1, 0],
      [-1, 0],
    ],
    [
      [0, 1],
      [0, 1],
    ],
    [
      [1, 1],
      [-1, 1],
    ],
    [
      [-1, -1],
      [1, -1],
    ],
    [
      [-10, 5],
      [10, 5],
    ],
    [
      [12, -3],
      [-12, -3],
    ],
  ];
}
