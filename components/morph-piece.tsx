"use client";

import { PIECE, PIECES, piecePictures } from "@/pictures/collection";
import { DotToggle } from "./dot-toggle";

export function MorphPiece({ slug, caption = false }: { slug: string; caption?: boolean }) {
  const piece = PIECES.find((piece) => piece.slug === slug);
  if (!piece) return null;
  return <DotToggle grid={PIECE} name={piece.name} load={async () => piecePictures(piece)} caption={caption} />;
}
