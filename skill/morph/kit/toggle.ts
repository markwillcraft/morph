import type { Grid, Picture } from "./grid";
import { Melt } from "./melt";

/** Two pictures and a switch between them, for hover: it melts toward whichever side it is pointed at, at melt speed. */
export class Toggle {
  private melt: Melt;
  private progress = 0;
  private target = 0;

  constructor(
    grid: Grid,
    private rest: Picture,
    private active: Picture,
    private meltSeconds = 1.1,
  ) {
    this.melt = new Melt(grid);
  }

  point(active: boolean) {
    this.target = active ? 1 : 0;
  }

  get settled() {
    return this.progress === this.target;
  }

  advance(seconds: number): Picture {
    const step = seconds / this.meltSeconds;
    this.progress = this.target > this.progress ? Math.min(this.target, this.progress + step) : Math.max(this.target, this.progress - step);
    return this.melt.sample(this.rest, this.active, this.progress);
  }
}
