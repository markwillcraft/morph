import { EMPTY, RING, SOLID, blankPicture, type Grid, type Picture } from "./grid";

export interface MeltTuning {
  /** How far the outgoing picture draws in toward its middle as it lets go. */
  retreatScale: number;
  /** Blur at the middle of the melt, in cells. */
  blurCells: number;
  samplesPerCell: number;
  /** Room around the grid so a blurred edge has somewhere to spread. */
  marginCells: number;
  presentAt: number;
  solidAt: number;
}

export const MELT_TUNING: MeltTuning = {
  retreatScale: 0.78,
  blurCells: 1.4,
  samplesPerCell: 2,
  marginCells: 4,
  presentAt: 0.5,
  solidAt: 0.5,
};

export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const phase = (x: number, start: number, end: number) => Math.min(1, Math.max(0, (x - start) / (end - start)));

/** Where each part of the melt is at `progress` (0…1). */
export function meltEnvelope(progress: number, tuning: MeltTuning = MELT_TUNING) {
  return {
    retreat: 1 + (tuning.retreatScale - 1) * easeInOutCubic(phase(progress, 0.05, 0.6)),
    handover: easeInOutCubic(phase(progress, 0.3, 0.75)),
    blur: tuning.blurCells * Math.sin(Math.PI * phase(progress, 0.05, 0.95)),
  };
}

const kernels = new Map<number, Float32Array>();

function gaussianKernel(sigma: number) {
  const key = Math.round(sigma * 20) / 20;
  let kernel = kernels.get(key);
  if (!kernel) {
    const radius = Math.ceil(key * 3);
    kernel = new Float32Array(radius * 2 + 1);
    let total = 0;
    for (let i = -radius; i <= radius; i++) total += kernel[i + radius] = Math.exp(-(i * i) / (2 * key * key));
    for (let i = 0; i < kernel.length; i++) kernel[i] /= total;
    kernels.set(key, kernel);
  }
  return kernel;
}

function blurInPlace(values: Float32Array, scratch: Float32Array, width: number, height: number, sigma: number) {
  const kernel = gaussianKernel(sigma);
  const radius = (kernel.length - 1) / 2;
  for (let y = 0; y < height; y++) {
    const rowStart = y * width;
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        const sx = x + k;
        if (sx >= 0 && sx < width) sum += values[rowStart + sx] * kernel[k + radius];
      }
      scratch[rowStart + x] = sum;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        const sy = y + k;
        if (sy >= 0 && sy < height) sum += scratch[sy * width + x] * kernel[k + radius];
      }
      values[y * width + x] = sum;
    }
  }
}

/**
 * Melts one picture into another. Both are laid into one small raster (coverage, and how much of that cover is solid)
 * that is blurred and cut back to a hard edge, so shapes that come close grow liquid necks and one picture flows into
 * the next instead of cross-fading.
 */
export class Melt {
  private width: number;
  private height: number;
  private coverage: Float32Array;
  private darkness: Float32Array;
  private scratch: Float32Array;

  constructor(
    private grid: Grid,
    private tuning: MeltTuning = MELT_TUNING,
  ) {
    this.width = (grid.columns + tuning.marginCells * 2) * tuning.samplesPerCell;
    this.height = (grid.rows + tuning.marginCells * 2) * tuning.samplesPerCell;
    this.coverage = new Float32Array(this.width * this.height);
    this.darkness = new Float32Array(this.width * this.height);
    this.scratch = new Float32Array(this.width * this.height);
  }

  sample(from: Picture, to: Picture, progress: number): Picture {
    if (progress <= 0) return from;
    if (progress >= 1) return to;
    const { retreat, handover, blur } = meltEnvelope(progress, this.tuning);
    this.lay(from, to, retreat, handover);
    const sigma = blur * this.tuning.samplesPerCell;
    if (sigma > 0.05) {
      blurInPlace(this.coverage, this.scratch, this.width, this.height, sigma);
      blurInPlace(this.darkness, this.scratch, this.width, this.height, sigma);
    }
    return this.readBack();
  }

  /** The new picture is laid over the old, as one canvas drawing over another would. */
  private lay(from: Picture, to: Picture, retreat: number, handover: number) {
    const { columns, rows } = this.grid;
    const { samplesPerCell, marginCells } = this.tuning;
    const [middleColumn, middleRow] = [columns / 2, rows / 2];
    const stateAt = (picture: Picture, column: number, row: number) =>
      column < 0 || row < 0 || column >= columns || row >= rows ? EMPTY : picture[row * columns + column];

    for (let y = 0; y < this.height; y++) {
      const row = (y + 0.5) / samplesPerCell - marginCells;
      const fromRow = Math.floor(middleRow + (row - middleRow) / retreat);
      for (let x = 0; x < this.width; x++) {
        const column = (x + 0.5) / samplesPerCell - marginCells;
        const fromState = stateAt(from, Math.floor(middleColumn + (column - middleColumn) / retreat), fromRow);
        const toState = stateAt(to, Math.floor(column), Math.floor(row));
        const fromCover = fromState === EMPTY ? 0 : 1 - handover;
        const toCover = toState === EMPTY ? 0 : handover;
        const index = y * this.width + x;
        this.coverage[index] = toCover + fromCover * (1 - toCover);
        this.darkness[index] = toCover * (toState === SOLID ? 1 : 0) + fromCover * (fromState === SOLID ? 1 : 0) * (1 - toCover);
      }
    }
  }

  private readBack(): Picture {
    const { columns, rows } = this.grid;
    const { samplesPerCell, marginCells, presentAt, solidAt } = this.tuning;
    const picture = blankPicture(this.grid);
    const samples = samplesPerCell * samplesPerCell;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        let coverage = 0;
        let darkness = 0;
        for (let y = 0; y < samplesPerCell; y++) {
          const start = ((row + marginCells) * samplesPerCell + y) * this.width + (column + marginCells) * samplesPerCell;
          for (let x = 0; x < samplesPerCell; x++) {
            coverage += this.coverage[start + x];
            darkness += this.darkness[start + x];
          }
        }
        if (coverage / samples < presentAt) continue;
        picture[row * columns + column] = darkness / coverage >= solidAt ? SOLID : RING;
      }
    }
    return picture;
  }
}
