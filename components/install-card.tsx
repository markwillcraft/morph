"use client";

import { useSyncExternalStore } from "react";
import { INSTALL_PROMPT } from "@/lib/install";
import { CopyButton } from "./copy-button";

const DISMISSED_KEY = "install-card-dismissed";
const listeners = new Set<() => void>();

const isDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
};

function dismiss() {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {}
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** A small card in the corner: Morph has to be installed before /morph does anything. Closing it keeps it closed. */
export function InstallCard() {
  // Hidden on the server and until the browser has said whether it was closed, so it never flashes.
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);
  if (dismissed) return null;

  return (
    <aside className="install-card" aria-label="Install Morph">
      <button type="button" className="install-card-close" aria-label="Close" onClick={dismiss}>
        ×
      </button>
      <p className="install-card-title">Install the skill first</p>
      <p className="install-card-body">
        Paste one prompt into Claude Code or Codex and it installs Morph for you. Then use <code>/morph</code> or{" "}
        <code>$morph</code>.
      </p>
      <div className="install-card-field">
        <input type="text" readOnly value={INSTALL_PROMPT.replace(/\s+/g, " ")} aria-label="Install prompt" tabIndex={-1} />
        <CopyButton text={INSTALL_PROMPT} label="Copy" className="button button-primary" />
      </div>
      <p className="install-card-alt">
        Or <a href="/morph.zip">download the ZIP</a>.
      </p>
    </aside>
  );
}
