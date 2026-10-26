"use client";

import { useSyncExternalStore } from "react";

type DotColor = "mono" | "blue";

const STORAGE_KEY = "dots";

/** Runs before first paint so a remembered colour never flashes the default first. */
export const DOT_COLOR_SCRIPT = `try{if(localStorage.getItem("${STORAGE_KEY}")==="blue")document.documentElement.dataset.dots="blue"}catch(e){}`;

const read = (): DotColor => (document.documentElement.dataset.dots === "blue" ? "blue" : "mono");

const subscribe = (onChange: () => void) => {
  const changes = new MutationObserver(onChange);
  changes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-dots"] });
  return () => changes.disconnect();
};

function choose(color: DotColor) {
  if (color === "blue") document.documentElement.dataset.dots = "blue";
  else delete document.documentElement.dataset.dots;
  try {
    localStorage.setItem(STORAGE_KEY, color);
  } catch {}
}

export function DotColorToggle() {
  const current = useSyncExternalStore(subscribe, read, () => "mono");
  const blue = current === "blue";
  return (
    <button
      type="button"
      role="switch"
      className="switch"
      aria-label="Blue dots"
      aria-checked={blue}
      onClick={() => choose(blue ? "mono" : "blue")}
    />
  );
}
