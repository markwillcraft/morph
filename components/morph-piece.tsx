"use client";

import { rethinkSans } from "@/app/fonts";
import { PIECE, piecePictures, pieces } from "@/pictures/collection";
import { DotToggle } from "./dot-toggle";

const findPiece = (slug: string) => pieces(rethinkSans.style.fontFamily).find((piece) => piece.slug === slug);

export function MorphPiece({ slug, caption = false }: { slug: string; caption?: boolean }) {
  const piece = findPiece(slug);
  if (!piece) return null;
  const load = () => document.fonts.load(`800 26px ${rethinkSans.style.fontFamily}`).then(() => piecePictures(piece));
  return <DotToggle grid={PIECE} name={piece.name} load={load} caption={caption} />;
}
