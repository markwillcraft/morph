import { thinnestMeltFrame } from "@kit/check";
import { EMPTY, RING, SOLID, pictureFromCells, type Grid } from "@kit/grid";

const GRID: Grid = { columns: 40, rows: 30 };
const [CX, CY] = [GRID.columns / 2, GRID.rows / 2];

function square(stroke: number) {
  return pictureFromCells(GRID, (column, row) => {
    const edge = Math.min(column - 9, 30 - column, row - 4, 25 - row);
    if (edge < 0) return EMPTY;
    return edge < stroke ? SOLID : stroke > 1 ? RING : EMPTY;
  });
}

function circle(stroke: number) {
  return pictureFromCells(GRID, (column, row) => {
    const inside = 10.5 - Math.hypot(column + 0.5 - CX, row + 0.5 - CY);
    if (inside < 0) return EMPTY;
    return inside < stroke ? SOLID : stroke > 1 ? RING : EMPTY;
  });
}

const percent = (share: number) => `${Math.round(share * 100)}%`;

export function thinExampleOutput() {
  return [1, 3]
    .map((stroke) => {
      const { share, progress, ok } = thinnestMeltFrame(GRID, square(stroke), circle(stroke));
      const label = stroke === 1 ? "1-cell outlines     " : "3-cell, ring filled ";
      return `${label} emptiest frame ${percent(share).padStart(4)} at ${percent(progress).padStart(3)}  ${ok ? "ok" : "too thin"}`;
    })
    .join("\n");
}
