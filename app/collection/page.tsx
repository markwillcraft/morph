import type { Metadata } from "next";
import { MorphPiece } from "@/components/morph-piece";
import { Top } from "@/components/top";
import { PIECE_SLUGS } from "@/pictures/collection";

export const metadata: Metadata = { title: "Collection · Morph" };

export default function Collection() {
  return (
    <main>
      <div className="column">
        <Top current="/collection" subtitle="collection" />
        <p className="tagline">{PIECE_SLUGS.length} pairs. Hover, focus or press one to melt it.</p>
        <div className="pieces">
          {PIECE_SLUGS.map((slug) => (
            <MorphPiece key={slug} slug={slug} caption />
          ))}
        </div>
      </div>
    </main>
  );
}
