import type { Grid } from "@kit/grid";
import { pictureFromCanvas } from "@kit/paint";
import { coverScene, type BlogCoverMotif } from "./context/covers";

/**
 * Context.dev's six blog covers, from context-website's blog-cover-scenes. Each scene draws its cover in shaded greys on
 * an 800 × 600 card with a dot every 10 units: `morph` runs it from the cover (0) to its second picture (1), and `spin`
 * keeps whatever moves going while the card is hovered. Every frame is read into Morph's dots.
 */

export const PIECE: Grid = { columns: 80, rows: 60 };
const COVER_UNITS_PER_CELL = 10;

export interface Piece {
  slug: BlogCoverMotif;
  name: string;
  /** What the cover shows, as a /morph prompt would describe it. */
  description: string;
}

export const PIECES: Piece[] = [
  {
    slug: "blocked",
    name: "Blocked to let through",
    description: "a padlock ringed by eight requests, three of them crossed out; on hover the lock opens and every request goes round",
  },
  {
    slug: "trends",
    name: "Orbits to a thought",
    description: "planets on dashed orbits round a sphere; on hover the sphere becomes a brain while the planets keep circling",
  },
  {
    slug: "pages",
    name: "Pages to one page",
    description: "three small pages side by side that gather and fuse into one large page",
  },
  {
    slug: "integration",
    name: "Two agents to one",
    description: "the Cursor and Claude icons that move together, turn and combine into the Context.dev mark",
  },
  {
    slug: "images",
    name: "Tiles to one picture",
    description: "six image tiles in a dashed frame that grow together into one picture",
  },
  {
    slug: "extract",
    name: "Source to records",
    description: "a source page beside a table of records, with a highlight walking down the rows as they are read",
  },
];

export const PIECE_SLUGS = PIECES.map((piece) => piece.slug);

/** The cover `morph` of the way to its second picture, with its moving parts `spin` radians along. */
export function coverAt(slug: BlogCoverMotif, morph: number, spin: number) {
  const scene = coverScene(slug);
  return pictureFromCanvas(PIECE, (context) => {
    context.scale(1 / COVER_UNITS_PER_CELL, 1 / COVER_UNITS_PER_CELL);
    // Both of the scene's layers go into one canvas: the dots' easing does the softening the site's goo layer does.
    scene.draw({ goo: context, crisp: context }, { morph, spin });
  });
}

export const coverMotion = (slug: BlogCoverMotif) => {
  const { spinSpeed, spinPeriod } = coverScene(slug);
  return { spinSpeed, spinPeriod };
};
