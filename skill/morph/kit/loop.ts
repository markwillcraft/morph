import type { Grid, Picture } from "./grid";
import { Melt } from "./melt";

export interface Beat {
  name: string;
  /** The picture `seconds` into its hold. It should be a pure function of time. */
  picture: (seconds: number) => Picture;
  /** How long this beat holds, and how long it takes to melt into the next, when they differ from the loop's. */
  hold?: number;
  melt?: number;
}

export interface LoopTiming {
  hold: number;
  melt: number;
}

export const LOOP_TIMING: LoopTiming = { hold: 2.4, melt: 1.1 };

/** A row of beats played as one endless loop: each holds, then melts into the next, and the last melts into the first. */
export class Loop {
  readonly duration: number;
  private melt: Melt;
  private resting: Picture[];
  private leaving: Picture[];
  private timings: LoopTiming[];
  private starts: number[];

  constructor(
    grid: Grid,
    private beats: Beat[],
    timing: LoopTiming = LOOP_TIMING,
  ) {
    this.timings = beats.map((beat) => ({ hold: beat.hold ?? timing.hold, melt: beat.melt ?? timing.melt }));
    this.starts = [];
    let start = 0;
    for (const { hold, melt } of this.timings) {
      this.starts.push(start);
      start += hold + melt;
    }
    this.duration = start;
    this.melt = new Melt(grid);
    this.resting = beats.map((beat) => beat.picture(0));
    this.leaving = beats.map((beat, index) => beat.picture(this.timings[index].hold));
  }

  at(seconds: number) {
    const t = ((seconds % this.duration) + this.duration) % this.duration;
    let index = this.starts.length - 1;
    while (this.starts[index] > t) index--;
    const { hold, melt } = this.timings[index];
    const next = (index + 1) % this.beats.length;
    const into = t - this.starts[index];
    if (into < hold) return { picture: this.beats[index].picture(into), beat: this.beats[index], melting: 0 };
    const progress = (into - hold) / melt;
    return { picture: this.melt.sample(this.leaving[index], this.resting[next], progress), beat: this.beats[index], melting: progress };
  }
}
