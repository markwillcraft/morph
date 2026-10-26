import type { Metadata } from "next";
import { CoverPiece } from "@/components/cover-piece";
import { PostPiece } from "@/components/post-piece";
import { ProductPiece } from "@/components/product-piece";
import { Top } from "@/components/top";
import { PIECE_SLUGS } from "@/pictures/collection";
import { POST_COVERS } from "@/pictures/context/posts";
import { PRODUCTS } from "@/pictures/products";

export const metadata: Metadata = { title: "Collection · Morph" };

export default function Collection() {
  const pairs = PIECE_SLUGS.length + POST_COVERS.length;
  return (
    <main>
      <div className="column">
        <Top current="/collection" subtitle="collection" />
        <p className="tagline">
          {PRODUCTS.length} stories and {pairs} covers. Hover, focus or press one to play it, and copy its prompt to make
          your own.
        </p>
        <h2 className="pieces-heading">Stories</h2>
        <div className="pieces">
          {PRODUCTS.map(({ slug }) => (
            <ProductPiece key={slug} slug={slug} withPrompt />
          ))}
        </div>
        <h2 className="pieces-heading">Moving covers</h2>
        <div className="pieces">
          {PIECE_SLUGS.map((slug) => (
            <CoverPiece key={slug} slug={slug} />
          ))}
        </div>
        <h2 className="pieces-heading">Post covers</h2>
        <div className="pieces">
          {POST_COVERS.map(({ slug }) => (
            <PostPiece key={slug} slug={slug} />
          ))}
        </div>
      </div>
    </main>
  );
}
