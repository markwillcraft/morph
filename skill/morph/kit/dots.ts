import { EMPTY, SOLID, type Grid, type Picture } from "./grid";

export interface DotLayout {
  /** Distance between dot centres, in canvas pixels. */
  pitch: number;
  /** Radius of a full dot as a share of the pitch. */
  radius: number;
  /** Radius of a ring's hole as a share of the pitch. */
  hole: number;
}

export const DOT_LAYOUT: Omit<DotLayout, "pitch"> = { radius: 0.34, hole: 0.18 };

const EASE_SECONDS = 0.04;
const VISIBLE_SCALE = 0.04;

/**
 * Every dot carries a size and a fill that ease toward what the picture asks for, so a moving edge swells and drains
 * its dots instead of switching them.
 */
export class DotField {
  private scale: Float32Array;
  private fill: Float32Array;

  constructor(private grid: Grid) {
    this.scale = new Float32Array(grid.columns * grid.rows);
    this.fill = new Float32Array(grid.columns * grid.rows);
  }

  place(picture: Picture) {
    for (let cell = 0; cell < picture.length; cell++) {
      this.scale[cell] = picture[cell] === EMPTY ? 0 : 1;
      this.fill[cell] = picture[cell] === SOLID ? 1 : 0;
    }
  }

  ease(picture: Picture, seconds: number) {
    const step = 1 - Math.exp(-seconds / EASE_SECONDS);
    for (let cell = 0; cell < picture.length; cell++) {
      const state = picture[cell];
      // A dot on its way out keeps its fill while it shrinks, so it never flashes as a ring.
      const targetFill = state === EMPTY ? this.fill[cell] : state === SOLID ? 1 : 0;
      this.scale[cell] += ((state === EMPTY ? 0 : 1) - this.scale[cell]) * step;
      this.fill[cell] += (targetFill - this.fill[cell]) * step;
    }
  }

  draw(context: CanvasRenderingContext2D, { pitch, radius, hole }: DotLayout) {
    const { columns } = this.grid;
    context.beginPath();
    for (let cell = 0; cell < this.scale.length; cell++) {
      const scale = this.scale[cell];
      if (scale < VISIBLE_SCALE) continue;
      const x = ((cell % columns) + 0.5) * pitch;
      const y = (Math.floor(cell / columns) + 0.5) * pitch;
      const outer = radius * pitch * scale;
      const inner = hole * pitch * scale * (1 - this.fill[cell]);
      context.moveTo(x + outer, y);
      context.arc(x, y, outer, 0, Math.PI * 2);
      if (inner > 0.1) {
        context.moveTo(x + inner, y);
        context.arc(x, y, inner, 0, Math.PI * 2);
      }
    }
    context.fill("evenodd");
  }
}
