import { RING, SOLID, blankPicture, type Grid, type Picture } from "./grid";

export type Drawing = (context: CanvasRenderingContext2D, grid: Grid) => void;

const SAMPLES_PER_CELL = 4;
const PRESENT_AT = 0.5;
const SOLID_AT = 0.5;

const canvases = new Map<string, CanvasRenderingContext2D>();

function contextFor({ columns, rows }: Grid) {
  const key = `${columns}x${rows}`;
  let context = canvases.get(key);
  if (!context) {
    const canvas = document.createElement("canvas");
    canvas.width = columns * SAMPLES_PER_CELL;
    canvas.height = rows * SAMPLES_PER_CELL;
    context = canvas.getContext("2d", { willReadFrequently: true })!;
    canvases.set(key, context);
  }
  return context;
}

/**
 * Draws with the canvas API in cell units, then reads each cell back: black ink is a solid dot, white ink a ring and
 * bare canvas nothing. Anything a canvas can draw (paths, text, gradients, clipping) becomes a dot picture.
 */
export function pictureFromCanvas(grid: Grid, draw: Drawing): Picture {
  const context = contextFor(grid);
  const { width, height } = context.canvas;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);
  context.setTransform(SAMPLES_PER_CELL, 0, 0, SAMPLES_PER_CELL, 0, 0);
  context.save();
  draw(context, grid);
  context.restore();

  const pixels = context.getImageData(0, 0, width, height).data;
  const picture = blankPicture(grid);
  const samples = SAMPLES_PER_CELL * SAMPLES_PER_CELL;
  for (let row = 0; row < grid.rows; row++) {
    for (let column = 0; column < grid.columns; column++) {
      let coverage = 0;
      let darkness = 0;
      for (let y = 0; y < SAMPLES_PER_CELL; y++) {
        let pixel = ((row * SAMPLES_PER_CELL + y) * width + column * SAMPLES_PER_CELL) * 4;
        for (let x = 0; x < SAMPLES_PER_CELL; x++, pixel += 4) {
          const alpha = pixels[pixel + 3] / 255;
          const lightness = (pixels[pixel] * 0.2126 + pixels[pixel + 1] * 0.7152 + pixels[pixel + 2] * 0.0722) / 255;
          coverage += alpha;
          darkness += alpha * (1 - lightness);
        }
      }
      if (coverage / samples < PRESENT_AT) continue;
      picture[row * grid.columns + column] = darkness / coverage >= SOLID_AT ? SOLID : RING;
    }
  }
  return picture;
}
