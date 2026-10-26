"use client";

import type { Grid, Picture } from "@kit/grid";
import { playToggle } from "@kit/play";
import { useEffect, useRef, type ReactNode } from "react";

export interface TogglePictures {
  rest: Picture;
  active: Picture;
}

/** A dot picture that melts to its other picture while it is hovered, focused or pressed. */
export function DotToggle({
  grid,
  name,
  load,
  caption,
}: {
  grid: Grid;
  name: string;
  load: () => Promise<TogglePictures>;
  caption?: ReactNode;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<ReturnType<typeof playToggle> | null>(null);
  const loader = useRef(load);

  useEffect(() => {
    let cancelled = false;
    loader.current().then(({ rest, active }) => {
      if (cancelled || !canvas.current) return;
      player.current = playToggle(canvas.current, grid, rest, active);
    });
    return () => {
      cancelled = true;
      player.current?.stop();
      player.current = null;
    };
  }, [grid, name]);

  const point = (active: boolean) => player.current?.point(active);

  return (
    <figure>
      <button
        type="button"
        className="piece"
        aria-label={name}
        onPointerEnter={(event) => event.pointerType === "mouse" && point(true)}
        onPointerLeave={(event) => event.pointerType === "mouse" && point(false)}
        onFocus={() => point(true)}
        onBlur={() => point(false)}
        onPointerDown={(event) => event.pointerType !== "mouse" && point(true)}
        onPointerUp={(event) => event.pointerType !== "mouse" && point(false)}
        onPointerCancel={() => point(false)}
      >
        <canvas ref={canvas} className="dots" style={{ aspectRatio: `${grid.columns} / ${grid.rows}` }} />
      </button>
      {caption}
    </figure>
  );
}
