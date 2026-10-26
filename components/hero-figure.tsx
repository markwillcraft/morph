"use client";

import { Loop } from "@kit/loop";
import { playLoop } from "@kit/play";
import { useEffect, useRef } from "react";
import { HERO, HERO_TIMING, heroBeats } from "@/pictures/hero";

// Context.dev's logomark, from the official SVG (context-website src/components/icons.tsx): a square with a hole
// cut from its lower left, and a disc beside it.
function ContextMark() {
  return (
    <svg viewBox="0 0 772.32 531.2" aria-label="Context.dev" role="img">
      <path
        fillRule="evenodd"
        d="M287.56,0H745.26A27.06,27.06,0,0,1,772.32,27.06V484.77A27.06,27.06,0,0,1,745.26,511.83H284.51A24.01,24.01,0,0,1,260.5,487.82V27.06A27.06,27.06,0,0,1,287.56,0Z M260.5,358.28a153.55,153.55,0,1,0,307.1,0a153.55,153.55,0,1,0,-307.1,0Z"
      />
      <circle cx="153.55" cy="377.64" r="153.55" />
    </svg>
  );
}

export function HeroFigure() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => playLoop(canvas.current!, HERO, new Loop(HERO, heroBeats(), HERO_TIMING)), []);

  return (
    <div className="bay">
      <canvas
        ref={canvas}
        className="dots"
        style={{ aspectRatio: `${HERO.columns} / ${HERO.rows}` }}
        role="img"
        aria-label="The Golden Gate in dots: a sailboat passes under the span, cars cross the deck, a gull swoops by and a motorboat wakes back across the bay"
      />
      <div className="lockup">
        <ContextMark />
        <p>Start building with Context.dev</p>
      </div>
    </div>
  );
}
