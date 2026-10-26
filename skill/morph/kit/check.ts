import { countPresent, type Grid, type Picture } from "./grid";
import { Melt } from "./melt";

export const THINNEST_SHARE = 0.35;

/**
 * Steps through a melt and finds its emptiest frame, as a share of the smaller picture's dots. Pictures made of thin
 * lines blur away before the next one arrives and leave a blank frame; anything under THINNEST_SHARE needs more mass.
 */
export function thinnestMeltFrame(grid: Grid, from: Picture, to: Picture, steps = 60) {
  const melt = new Melt(grid);
  const smaller = Math.min(countPresent(from), countPresent(to));
  let thinnest = { progress: 0, share: 1 };
  for (let step = 1; step < steps; step++) {
    const progress = step / steps;
    const share = smaller === 0 ? 0 : countPresent(melt.sample(from, to, progress)) / smaller;
    if (share < thinnest.share) thinnest = { progress, share };
  }
  return { ...thinnest, ok: thinnest.share >= THINNEST_SHARE };
}
