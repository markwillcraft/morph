"use client";

import { useEffect, useState } from "react";

/** Copies `text` and says so for a moment. */
const CopyIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5.25" y="5.25" width="8.5" height="8.5" rx="1.75" />
    <path d="M10.75 5.25V3.5A1.25 1.25 0 0 0 9.5 2.25h-6A1.25 1.25 0 0 0 2.25 3.5v6a1.25 1.25 0 0 0 1.25 1.25h1.75" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M3 8.5l3.25 3.25L13 5" />
  </svg>
);

export function CopyButton({
  text,
  label = "Copy",
  className = "copy",
  icon = false,
}: {
  text: string;
  label?: string;
  className?: string;
  /** Shows a copy icon before the label, and a tick once copied. */
  icon?: boolean;
}) {
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
      {icon && (copied ? <CheckIcon /> : <CopyIcon />)}
      {copied ? "Copied" : label}
    </button>
  );
}
