import type { Metadata } from "next";
import { MorphPiece } from "@/components/morph-piece";
import { ProductPiece } from "@/components/product-piece";
import { Top } from "@/components/top";
import { PIECE_SLUGS } from "@/pictures/collection";
import { PRODUCTS } from "@/pictures/products";

export const metadata: Metadata = { title: "Collection · Morph" };

export default function Collection() {
  return (
    <main>
      <div className="column">
        <Top current="/collection" subtitle="collection" />
        <p className="tagline">
          {PRODUCTS.length} stories and {PIECE_SLUGS.length} pairs. Hover, focus or press one to play it.
        </p>
        <h2 className="pieces-heading">Stories</h2>
        <div className="pieces">
          {PRODUCTS.map(({ slug }) => (
            <ProductPiece key={slug} slug={slug} />
          ))}
        </div>
        <h2 className="pieces-heading">Pairs</h2>
        <div className="pieces">
          {PIECE_SLUGS.map((slug) => (
            <MorphPiece key={slug} slug={slug} caption />
          ))}
        </div>
      </div>
    </main>
  );
}
