import type { Grid } from "@kit/grid";
import type { Beat, LoopTiming } from "@kit/loop";
import { pictureFromCanvas } from "@kit/paint";

/**
 * The bay: the Golden Gate in dots. Only one thing moves at a time, and each hands the eye to the next: a sailboat
 * crosses under the span, a run of cars takes the deck, a gull swoops across, and a motorboat wakes its way back. Clouds
 * drift right to left across the sun while the sun and water keep breathing, each on a period that divides the loop so
 * it closes seamlessly.
 */

export const HERO: Grid = { columns: 80, rows: 42 };

const SOLID = "#000";
const RING = "#fff";
const DURATION = 15;
const TAU = Math.PI * 2;
const { columns: COLS, rows: ROWS } = HERO;

// Played at half the pace the scene was drawn at, so each mover can be followed across.
const PACE = 0.5;

/** One beat that holds for the whole loop; it closes on itself, so the melt back to its start has nothing to do. */
export const HERO_TIMING: LoopTiming = { hold: DURATION / PACE, melt: 0.05 };

type Ctx = CanvasRenderingContext2D;

const TOWERS = [21, 58];
const TOP = 21;
const DECK = 30;
const WATER = 35;
const SAG = 27;
const SUN = { x: 40, y: 4.5 };

const SAIL = { from: 0, to: 6, x0: -5, x1: 86 };
const CARS = { from: 5.2, travel: 3.2, gap: 0.55, count: 3, x0: 82, x1: -6 };
const GULL = { from: 8.8, to: 12.6 };
const MOTOR = { from: 12, to: 15, x0: 86, x1: -16 };

const GULL_PATH = [{ x: 86, y: 23 }, { x: 40, y: 28 }, { x: -6, y: 4 }];

// Cumulus, in cells relative to each cloud's left foot: puffs [dx, dy, r] above a flat base, each crossing one wrap
// per loop so the loop closes.
const CLOUDS = [
  { x: 0, base: 9, puffs: [[2.4, -1.6, 2], [6, -2.8, 3], [10, -1.9, 2.4], [13, -1.2, 1.5]] },
  { x: 36, base: 5.6, puffs: [[1.8, -1.2, 1.5], [4.6, -2.3, 2.3], [7.6, -1.4, 1.7]] },
  { x: 66, base: 8.2, puffs: [[2.2, -1.5, 1.9], [5.6, -2.6, 2.7], [9, -1.6, 2]] },
];
const CLOUD_WRAP = COLS + 16;

const hash = (n: number) => {
  const h = Math.sin(n * 127.1) * 43758.5453;
  return h - Math.floor(h);
};

const span = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

const RIPPLES: { col: number; row: number; len: number; phase: number }[] = [];
for (let row = WATER; row < ROWS; row++) {
  for (let col = hash(row) * 8; col < COLS; col += 13 + hash(row * 31 + col) * 12) {
    RIPPLES.push({ col, row, len: 1 + Math.floor(hash(col * 7 + row) * 3), phase: hash(col + row * 13) * TAU });
  }
}

function fill(ctx: Ctx, ink: string, path: () => void) {
  ctx.fillStyle = ink;
  ctx.beginPath();
  path();
  ctx.fill();
}

function cut(ctx: Ctx, path: () => void) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  fill(ctx, "#000", path);
  ctx.restore();
}

const cell = (ctx: Ctx, ink: string, col: number, row: number, w = 1, h = 1) => fill(ctx, ink, () => ctx.rect(col, row, w, h));

const bezier = (p: { x: number; y: number }[], u: number) => ({
  x: (1 - u) ** 2 * p[0].x + 2 * u * (1 - u) * p[1].x + u * u * p[2].x,
  y: (1 - u) ** 2 * p[0].y + 2 * u * (1 - u) * p[1].y + u * u * p[2].y,
});

function cloudShape(ctx: Ctx, x: number, base: number, puffs: number[][], dy = 0) {
  ctx.beginPath();
  for (const [px, py, r] of puffs) {
    ctx.moveTo(x + px + r, base + py + dy);
    ctx.arc(x + px, base + py + dy, r, 0, TAU);
  }
  const left = Math.min(...puffs.map(([px, , r]) => px - r * 0.6));
  const right = Math.max(...puffs.map(([px, , r]) => px + r * 0.6));
  ctx.roundRect(x + left, base - 1.6 + dy, right - left, 1.6, 0.8);
}

// Lit from above: a rim of solid dots along the top, rings through the body, and it hides whatever it passes in front of.
function clouds(ctx: Ctx, t: number) {
  for (const { x: x0, base, puffs } of CLOUDS) {
    const travel = (CLOUD_WRAP * t) / DURATION;
    const x = ((((x0 - travel) % CLOUD_WRAP) + CLOUD_WRAP) % CLOUD_WRAP) - 15;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    cloudShape(ctx, x, base, puffs);
    ctx.fill();
    ctx.restore();

    ctx.save();
    cloudShape(ctx, x, base, puffs);
    ctx.clip();
    ctx.fillStyle = SOLID;
    cloudShape(ctx, x, base, puffs);
    ctx.fill();
    ctx.fillStyle = RING;
    cloudShape(ctx, x, base, puffs, 1.05);
    ctx.fill();
    ctx.restore();
  }
}

// The sun's outer rays light in a slow chase, twice round per loop.
function sun(ctx: Ctx, t: number) {
  fill(ctx, SOLID, () => ctx.arc(SUN.x, SUN.y, 1.75, 0, TAU));
  const head = (t / (DURATION / 2)) * 8;
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const ray = (r: number) => [Math.floor(SUN.x + r * Math.cos(a)), Math.floor(SUN.y + r * Math.sin(a))];
    const [ic, ir] = ray(3.1);
    cell(ctx, SOLID, ic, ir);
    if ((head - k + 16) % 8 < 3) {
      const [oc, or] = ray(4.4);
      cell(ctx, RING, oc, or);
    }
  }
}

function water(ctx: Ctx, t: number) {
  for (const { col, row, len, phase } of RIPPLES) {
    const x = Math.round(col + 0.8 * Math.sin((TAU * t) / 3.75 + phase));
    cell(ctx, RING, x, row, len);
  }
  // The towers' reflections, broken every other row.
  for (const c of TOWERS) {
    for (let row = WATER + 1; row < ROWS; row += 2) {
      cell(ctx, RING, c - 2, row);
      cell(ctx, RING, c + 2, row);
    }
  }
}

function cableRow(col: number) {
  const x = col + 0.5;
  const [a, b] = TOWERS.map((c) => c + 0.5);
  if (x >= a && x <= b) {
    const u = (x - (a + b) / 2) / ((b - a) / 2);
    return Math.round(SAG - (SAG - TOP) * u * u);
  }
  // Side spans fall steeply off the tower top and flatten towards their anchorages at the edges.
  const u = x < a ? (a - x) / a : (x - b) / (COLS - b);
  return Math.round(TOP + (DECK - 2 - TOP) * (2 * u - u * u));
}

function bridge(ctx: Ctx) {
  // One dot per column of cable, with the steep runs by the towers filled in so the line never breaks.
  let prev = cableRow(0);
  for (let col = 0; col < COLS; col++) {
    const row = cableRow(col);
    const lo = row < prev ? row : Math.min(row, prev + 1);
    const hi = row < prev ? Math.max(row, prev - 1) : row;
    cell(ctx, SOLID, col, lo, 1, hi - lo + 1);
    prev = row;
    const nearTower = TOWERS.some((c) => Math.abs(col - c) <= 3);
    if ((col - TOWERS[0]) % 2 === 0 && !nearTower && row + 1 < DECK) cell(ctx, RING, col, row + 1, 1, DECK - row - 1);
  }

  for (const c of TOWERS) {
    cell(ctx, SOLID, c - 2, TOP, 1, WATER - TOP);
    cell(ctx, SOLID, c + 2, TOP, 1, WATER - TOP);
    cell(ctx, SOLID, c - 2, TOP, 5);
    cell(ctx, SOLID, c - 2, TOP + 4, 5);
    cell(ctx, SOLID, c - 3, WATER - 1, 7);
  }

  cell(ctx, SOLID, 0, DECK, COLS);
  cell(ctx, SOLID, 0, DECK + 3, COLS);
}

// The movers: cell-exact sprites ("o" solid, ":" ring) snapped to the grid, each clearing a margin of `halo` cells
// around itself so it reads in front of the bridge and water.
function sprite(ctx: Ctx, rows: string[], x: number, bottom: number, halo = 1) {
  const left = Math.round(x - rows[0].length / 2);
  const top = Math.round(bottom) - rows.length + 1;
  const lit = rows.flatMap((line, r) => [...line].flatMap((ch, c) => (ch === " " ? [] : [{ c: left + c, r: top + r, ch }])));
  for (const { c, r } of lit) cut(ctx, () => ctx.rect(c - halo, r - halo, 1 + 2 * halo, 1 + 2 * halo));
  for (const { c, r, ch } of lit) cell(ctx, ch === "o" ? SOLID : RING, c, r);
}

const SAILBOAT = [
  "    o    ",
  "   :oo   ",
  "   :ooo  ",
  "  ::ooo  ",
  "  ::oooo ",
  " :::oooo ",
  " :::ooooo",
  "    o    ",
  "ooooooooo",
  " ooooooo ",
];
const CAR = [" ooo ", "ooooo"];
const MOTORBOAT = ["   o::o   ", "oooooooooo", " ooooooooo"];
const GULL_FLAP = [
  ["o       o", " o     o ", "  oo oo  ", "    o    "],
  ["oo     oo", "  oo oo  ", "    o    "],
  ["  oo oo  ", " o  o  o ", "o       o"],
  ["oo     oo", "  oo oo  ", "    o    "],
];
const GULL_GLIDE = GULL_FLAP[1];

function motorboat(ctx: Ctx, x: number) {
  // A V of wake opening behind it, fading out with distance.
  for (let k = 1; k <= 9; k++) {
    ctx.globalAlpha = 1 - k / 14;
    const col = Math.round(x) + 4 + k;
    cell(ctx, RING, col, Math.round(39.5 - k * 0.25));
    cell(ctx, RING, col, Math.round(40.5 + k * 0.15));
  }
  ctx.globalAlpha = 1;
  sprite(ctx, MOTORBOAT, x, 40);
}

function gull(ctx: Ctx, t: number) {
  if (t < GULL.from || t > GULL.to) return;
  const u = span(t, GULL.from, GULL.to);
  const { x, y } = bezier(GULL_PATH, easeInOut(u));
  // Flaps in, glides over the span, and flaps again to climb out.
  const wings = u > 0.3 && u < 0.62 ? GULL_GLIDE : GULL_FLAP[Math.floor(t * 12) % 4];
  sprite(ctx, wings, x, y);
}

function bay(ctx: Ctx, t: number) {
  sun(ctx, t);
  clouds(ctx, t);
  bridge(ctx);
  water(ctx, t);

  if (t >= SAIL.from && t <= SAIL.to) sprite(ctx, SAILBOAT, SAIL.x0 + (SAIL.x1 - SAIL.x0) * span(t, SAIL.from, SAIL.to), 40);

  for (let i = 0; i < CARS.count; i++) {
    const from = CARS.from + i * CARS.gap;
    if (t >= from && t <= from + CARS.travel) sprite(ctx, CAR, CARS.x0 + (CARS.x1 - CARS.x0) * span(t, from, from + CARS.travel), DECK + 2, 0);
  }

  gull(ctx, t);

  if (t >= MOTOR.from && t <= MOTOR.to) {
    // Throttles up out of the turn, then holds speed off the edge.
    const u = span(t, MOTOR.from, MOTOR.to);
    motorboat(ctx, MOTOR.x0 + (MOTOR.x1 - MOTOR.x0) * (0.35 * easeInOut(Math.min(u * 2, 1)) + 0.65 * u));
  }
}

const theBay: Beat = {
  name: "The bay",
  picture: (seconds) => {
    const t = seconds * PACE;
    return pictureFromCanvas(HERO, (context) => bay(context, ((t % DURATION) + DURATION) % DURATION));
  },
};

export const heroBeats = (): Beat[] => [theBay];
