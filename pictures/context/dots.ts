import { cellsOfStates, paintedStates, type DotPainter } from "./cells";
import type { GlyphCell } from "./glyphs";

// The few pieces of context-website's dot player that its story pictures are written against.

export interface DotGrid {
  columns: number;
  rows: number;
  pitch: number;
  dotRadius: number;
  ringStroke: number;
  haloRadius: number;
}

export const DOT_ABSENT = 0;
export const DOT_HOLLOW = 1;
export const DOT_FILLED = 2;

export interface StoryPicture {
  states: Uint8Array;
  cells: GlyphCell[];
}

/** Text the site writes over a picture. Morph draws only dots, so these are kept for the layout and never drawn. */
export interface DotStoryText {
  text: string;
  x: number;
  y: number;
  size: number;
  weight: number;
  muted?: boolean;
  color?: string;
  anchor?: "start" | "middle" | "end";
}

export const pictureOf = (grid: DotGrid, painter: DotPainter): StoryPicture => {
  const states = paintedStates(grid, painter);
  return { states, cells: cellsOfStates(grid, states) };
};
