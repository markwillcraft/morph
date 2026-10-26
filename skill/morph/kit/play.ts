import { DOT_LAYOUT, DotField } from "./dots";
import type { Grid, Picture } from "./grid";
import type { Loop } from "./loop";
import { Toggle } from "./toggle";

// Longer than this between frames (a background tab, a seek) and the dots are placed outright instead of eased.
const LONGEST_STEP = 0.1;
const SETTLE_SECONDS = 0.3;

const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Sizes the canvas to its box and the device's pixels, and paints the dots in the canvas's CSS `color`. */
function dotCanvas(canvas: HTMLCanvasElement, grid: Grid, field: DotField) {
  const context = canvas.getContext("2d")!;
  const paint = () => {
    const pitch = canvas.width / grid.columns;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = getComputedStyle(canvas).color;
    field.draw(context, { ...DOT_LAYOUT, pitch });
  };
  const fit = () => {
    const ratio = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round((canvas.width * grid.rows) / grid.columns);
    paint();
  };
  const resizes = new ResizeObserver(fit);
  resizes.observe(canvas);
  // A theme switch on the page changes the colour without moving a dot, so still canvases repaint here.
  const themes = new MutationObserver(paint);
  themes.observe(document.documentElement, { attributes: true });
  fit();
  return {
    paint,
    stop: () => {
      resizes.disconnect();
      themes.disconnect();
    },
  };
}

/** Plays a loop while the canvas is on screen. Under reduced motion it shows the first beat and stays still. */
export function playLoop(canvas: HTMLCanvasElement, grid: Grid, loop: Loop) {
  const field = new DotField(grid);
  field.place(loop.at(0).picture);
  const surface = dotCanvas(canvas, grid, field);
  if (prefersReducedMotion()) return surface.stop;

  let seconds = 0;
  let last = 0;
  let frame = 0;
  let visible = false;
  const tick = (now: number) => {
    const step = last ? (now - last) / 1000 : 0;
    last = now;
    seconds += Math.min(step, LONGEST_STEP);
    const { picture } = loop.at(seconds);
    if (step > 0 && step <= LONGEST_STEP) field.ease(picture, step);
    else field.place(picture);
    surface.paint();
    frame = requestAnimationFrame(tick);
  };
  const views = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(frame);
    last = 0;
    if (visible) frame = requestAnimationFrame(tick);
  });
  views.observe(canvas);
  return () => {
    cancelAnimationFrame(frame);
    views.disconnect();
    surface.stop();
  };
}

/** Shows `rest` and melts toward the other picture whenever it is pointed at; it only draws while something moves. */
export function playToggle(canvas: HTMLCanvasElement, grid: Grid, rest: Picture, active: Picture) {
  const toggle = new Toggle(grid, rest, active);
  const field = new DotField(grid);
  field.place(rest);
  const surface = dotCanvas(canvas, grid, field);
  const still = prefersReducedMotion();

  let frame = 0;
  let last = 0;
  let settledFor = 0;
  const tick = (now: number) => {
    const step = last ? Math.min((now - last) / 1000, LONGEST_STEP) : 0;
    last = now;
    field.ease(toggle.advance(step), step);
    surface.paint();
    settledFor = toggle.settled ? settledFor + step : 0;
    frame = settledFor < SETTLE_SECONDS ? requestAnimationFrame(tick) : 0;
  };

  return {
    point(isActive: boolean) {
      if (still) {
        field.place(isActive ? active : rest);
        surface.paint();
        return;
      }
      toggle.point(isActive);
      settledFor = 0;
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    },
    stop() {
      cancelAnimationFrame(frame);
      surface.stop();
    },
  };
}
