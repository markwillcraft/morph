"use client";

import { POST_COVERS, POST_GRID, postPictures } from "@/pictures/context/posts";
import { DotToggle } from "./dot-toggle";
import { PieceCaption, hoverPrompt } from "./piece-caption";

export function PostPiece({ slug }: { slug: string }) {
  const cover = POST_COVERS.find((cover) => cover.slug === slug);
  if (!cover) return null;
  return (
    <DotToggle
      grid={POST_GRID}
      name={cover.name}
      load={async () => postPictures(cover)}
      caption={<PieceCaption name={cover.name} prompt={hoverPrompt(cover.description)} />}
    />
  );
}
