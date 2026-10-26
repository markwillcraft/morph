"use client";

import { useEffect, useState } from "react";

/** Copies `text` and says so for a moment. */
export function CopyButton({ text, label = "Copy", className = "copy" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const reset = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(reset);
  }, [copied]);

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}
      aria-live="polite"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
