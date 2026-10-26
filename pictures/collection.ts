import type { Grid } from "@kit/grid";
import { pictureFromCanvas } from "@kit/paint";
import { coverScene, type BlogCoverMotif } from "./context/covers";

/**
 * Context.dev's six blog covers, from context-website's blog-cover-scenes. Each scene draws its cover at `morph` 0 and
 * its second picture at `morph` 1, in shaded greys on an 800 × 600 card with a dot every 10 units. Here both ends are
 * read into Morph's dots, and the kit melts between them.
 */

export const PIECE: Grid = { columns: 80, rows: 60 };
const COVER_UNITS_PER_CELL = 10;

export interface Piece {
  slug: BlogCoverMotif;
  name: string;
}

export const PIECES: Piece[] = [
  { slug: "blocked", name: "Blocked to let through" },
  { slug: "trends", name: "Orbits to a thought" },
  { slug: "pages", name: "Pages to one page" },
  { slug: "integration", name: "Two agents to one" },
  { slug: "images", name: "Tiles to one picture" },
  { slug: "extract", name: "Source to records" },
];

function coverAt(slug: BlogCoverMotif, morph: number) {
  const scene = coverScene(slug);
  return pictureFromCanvas(PIECE, (context) => {
    context.scale(1 / COVER_UNITS_PER_CELL, 1 / COVER_UNITS_PER_CELL);
    // Both of the scene's layers are drawn into one canvas: the kit's melt does the fusing the site's goo layer does.
    scene.draw({ goo: context, crisp: context }, { morph, spin: 0 });
  });
}

export const piecePictures = ({ slug }: Piece) => ({ rest: coverAt(slug, 0), active: coverAt(slug, 1) });

export const PIECE_SLUGS = PIECES.map((piece) => piece.slug);
