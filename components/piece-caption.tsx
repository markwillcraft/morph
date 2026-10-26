import { CopyButton } from "./copy-button";

/** A piece's name, with a button that copies a /morph prompt for making one like it. */
export function PieceCaption({ name, prompt }: { name: string; prompt?: string }) {
  return (
    <figcaption className="piece-caption">
      <span>{name}</span>
      {prompt && <CopyButton text={prompt} label="Copy" className="copy-chip" icon />}
    </figcaption>
  );
}

export const hoverPrompt = (description: string) => `/morph ${description}. Play it on hover.`;
