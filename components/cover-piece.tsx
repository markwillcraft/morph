"use client";

import { DOT_LAYOUT, DotField } from "@kit/dots";
import { useEffect, useRef } from "react";
import { PIECE, PIECES, coverAt, coverMotion } from "@/pictures/collection";
import type { BlogCoverMotif } from "@/pictures/context/covers";
import { PieceCaption, hoverPrompt } from "./piece-caption";

// Timed as context.dev's cover player: the cover runs to its second picture in 1.1 s and back in 0.7 s, its moving
// parts spin up while hovered, and on leaving they spring back to the nearest resting place.
const MORPH_IN_SECONDS = 1.1;
const MORPH_OUT_SECONDS = 0.7;
const SPIN_UP_SECONDS = 0.45;
const REWIND_STIFFNESS = 70;
const REWIND_DAMPING = 2 * Math.sqrt(REWIND_STIFFNESS);
const REWIND_LOOKAHEAD_SECONDS = 0.2;
const RESTING_SPIN_DISTANCE = 0.004;
const RESTING_SPIN_VELOCITY = 0.02;
const LONGEST_STEP = 0.05;
// Each frame of the scene is cut to whole dots, so dots ease toward it more slowly than the kit's default: edges glide
// across cells instead of stepping. Below 1 slows the easing.
const DOT_EASING = 0.3;
// How long the dots get to ease home before the last frame is drawn exactly and the player sleeps.
const SETTLE_SECONDS = 0.5;

function playCover(canvas: HTMLCanvasElement, slug: BlogCoverMotif) {
  const context = canvas.getContext("2d")!;
  const { spinSpeed, spinPeriod } = coverMotion(slug);
  const field = new DotField(PIECE);
  const resting = coverAt(slug, 0, 0);
  field.place(resting);

  const paint = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = getComputedStyle(canvas).color;
    field.draw(context, { ...DOT_LAYOUT, pitch: canvas.width / PIECE.columns });
  };
  const fit = () => {
    const ratio = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round((canvas.width * PIECE.rows) / PIECE.columns);
    paint();
  };
  const resizes = new ResizeObserver(fit);
  resizes.observe(canvas);
  const themes = new MutationObserver(paint);
  themes.observe(document.documentElement, { attributes: true });
  fit();

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let hovering = false;
  let morph = 0;
  let spin = 0;
  let spinVelocity = 0;
  let restingSpin = 0;
  let frame = 0;
  let last = 0;
  let homeFor = 0;

  const tick = (now: number) => {
    const step = last ? Math.min((now - last) / 1000, LONGEST_STEP) : 0;
    last = now;
    if (hovering) {
      morph = Math.min(1, morph + step / MORPH_IN_SECONDS);
      spinVelocity += (spinSpeed - spinVelocity) * (1 - Math.exp(-step / SPIN_UP_SECONDS));
    } else {
      morph = Math.max(0, morph - step / MORPH_OUT_SECONDS);
      spinVelocity += (-REWIND_STIFFNESS * (spin - restingSpin) - REWIND_DAMPING * spinVelocity) * step;
    }
    spin += spinVelocity * step;
    const home =
      !hovering &&
      morph === 0 &&
      Math.abs(spin - restingSpin) < RESTING_SPIN_DISTANCE &&
      Math.abs(spinVelocity) < RESTING_SPIN_VELOCITY;
    field.ease(home ? resting : coverAt(slug, morph, spin), step * DOT_EASING);
    paint();
    homeFor = home ? homeFor + step : 0;
    if (homeFor > SETTLE_SECONDS) {
      field.place(resting);
      paint();
      spin = spinVelocity = restingSpin = 0;
      homeFor = 0;
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  return {
    point(isActive: boolean) {
      if (still) {
        field.place(coverAt(slug, isActive ? 1 : 0, 0));
        paint();
        return;
      }
      hovering = isActive;
      if (!isActive) restingSpin = Math.round((spin + spinVelocity * REWIND_LOOKAHEAD_SECONDS) / spinPeriod) * spinPeriod;
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    },
    stop() {
      cancelAnimationFrame(frame);
      resizes.disconnect();
      themes.disconnect();
    },
  };
}

/** One of Context.dev's blog covers, played as its site plays it: hover runs it to its second picture and keeps it moving. */
export function CoverPiece({ slug }: { slug: BlogCoverMotif }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<ReturnType<typeof playCover> | null>(null);
  const piece = PIECES.find((piece) => piece.slug === slug);

  useEffect(() => {
    if (!canvas.current) return;
    player.current = playCover(canvas.current, slug);
    return () => {
      player.current?.stop();
      player.current = null;
    };
  }, [slug]);

  if (!piece) return null;
  const point = (active: boolean) => player.current?.point(active);

  return (
    <figure>
      <button
        type="button"
        className="piece"
        aria-label={piece.name}
        onPointerEnter={(event) => event.pointerType === "mouse" && point(true)}
        onPointerLeave={(event) => event.pointerType === "mouse" && point(false)}
        onFocus={() => point(true)}
        onBlur={() => point(false)}
        onPointerDown={(event) => event.pointerType !== "mouse" && point(true)}
        onPointerUp={(event) => event.pointerType !== "mouse" && point(false)}
        onPointerCancel={() => point(false)}
      >
        <canvas ref={canvas} className="dots" style={{ aspectRatio: `${PIECE.columns} / ${PIECE.rows}` }} />
      </button>
      <PieceCaption name={piece.name} prompt={hoverPrompt(piece.description)} />
    </figure>
  );
}
