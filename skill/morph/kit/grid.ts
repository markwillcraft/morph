export const EMPTY = 0;
export const RING = 1;
export const SOLID = 2;

export type CellState = typeof EMPTY | typeof RING | typeof SOLID;

export interface Grid {
  columns: number;
  rows: number;
}

/** One state per cell, row by row. */
export type Picture = Uint8Array;

export function blankPicture({ columns, rows }: Grid): Picture {
  return new Uint8Array(columns * rows);
}

export function pictureFromCells(grid: Grid, paint: (column: number, row: number) => CellState): Picture {
  const picture = blankPicture(grid);
  for (let row = 0; row < grid.rows; row++) {
    for (let column = 0; column < grid.columns; column++) picture[row * grid.columns + column] = paint(column, row);
  }
  return picture;
}

/** `#` is a solid dot, `o` a ring, anything else empty. */
export function pictureFromRows(grid: Grid, lines: string[]): Picture {
  return pictureFromCells(grid, (column, row) => {
    const mark = lines[row]?.[column];
    return mark === "#" ? SOLID : mark === "o" ? RING : EMPTY;
  });
}

export function countPresent(picture: Picture): number {
  let present = 0;
  for (const state of picture) if (state !== EMPTY) present++;
  return present;
}
