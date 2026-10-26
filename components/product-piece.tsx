"use client";

import { DOT_LAYOUT, DotField } from "@kit/dots";
import { Loop } from "@kit/loop";
import { useEffect, useRef } from "react";
import { doto } from "@/app/fonts";
import { PRODUCT, PRODUCT_PITCH, PRODUCTS, type Ink, type Story } from "@/pictures/products";
import { PieceCaption } from "./piece-caption";

// Longer than this between frames and the dots are placed outright instead of eased.
const LONGEST_STEP = 0.1;
// The stories are timed as context.dev plays them; here they run at half that pace, so each step can be read.
const PACE = 0.5;
// The greys Context.dev sets its picture text in: darker than the page's muted grey, since the text is small.
const TEXT_COLORS = { ink: "#27272a", muted: "#52525b" };

/**
 * Plays a product's story while it is pointed at, and holds wherever it got to when the pointer leaves. Before anyone
 * points at it, it shows the frame the site uses as its still. The dots are the kit's; the text is drawn over them.
 */
function playStory(canvas: HTMLCanvasElement, story: Story) {
  const context = canvas.getContext("2d")!;
  const loop = new Loop(PRODUCT, story.beats);
  const field = new DotField(PRODUCT);
  // The canvas carries Doto's class, so its face is on the page and the canvas's own font is Doto.
  const fontFamily = getComputedStyle(canvas).fontFamily;
  let seconds = story.rest;
  field.place(loop.at(seconds).picture);

  const paint = () => {
    const style = getComputedStyle(canvas);
    const colors = TEXT_COLORS;
    const pitch = canvas.width / PRODUCT.columns;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = style.color;
    field.draw(context, { ...DOT_LAYOUT, pitch });

    const scale = pitch / PRODUCT_PITCH;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.textBaseline = "alphabetic";
    const ink: Ink = {
      text({ text, x, y, size, weight, muted, anchor = "start" }, presence) {
        if (presence <= 0 || !text) return;
        context.font = `${weight} ${size}px ${fontFamily}`;
        context.textAlign = anchor === "middle" ? "center" : anchor;
        context.fillStyle = muted ? colors.muted : colors.ink;
        context.globalAlpha = presence;
        context.fillText(text, x, y);
        context.globalAlpha = 1;
      },
      cursor({ y, size }, x, presence) {
        context.fillStyle = colors.ink;
        context.globalAlpha = presence;
        context.fillRect(x, y - size * 0.78, size * 0.5, size * 0.84);
        context.globalAlpha = 1;
      },
      measure({ text, size, weight }) {
        context.font = `${weight} ${size}px ${fontFamily}`;
        return context.measureText(text).width;
      },
    };
    story.write(ink, seconds);
  };

  const fit = () => {
    const ratio = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round((canvas.width * PRODUCT.rows) / PRODUCT.columns);
    paint();
  };
  const resizes = new ResizeObserver(fit);
  resizes.observe(canvas);
  const themes = new MutationObserver(paint);
  themes.observe(document.documentElement, { attributes: true });
  Promise.all([600, 700, 800].map((weight) => document.fonts.load(`${weight} 16px ${fontFamily}`))).then(paint);
  fit();

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frame = 0;
  let last = 0;
  const tick = (now: number) => {
    const step = last ? (now - last) / 1000 : 0;
    last = now;
    seconds += Math.min(step, LONGEST_STEP) * PACE;
    const { picture } = loop.at(seconds);
    if (step > 0 && step <= LONGEST_STEP) field.ease(picture, step);
    else field.place(picture);
    paint();
    frame = requestAnimationFrame(tick);
  };

  return {
    point(isActive: boolean) {
      if (still) return;
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (isActive) frame = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(frame);
      resizes.disconnect();
      themes.disconnect();
    },
  };
}

export function ProductPiece({ slug, withPrompt = false }: { slug: string; withPrompt?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<ReturnType<typeof playStory> | null>(null);
  const product = PRODUCTS.find((product) => product.slug === slug);

  useEffect(() => {
    const product = PRODUCTS.find((product) => product.slug === slug);
    if (!product || !canvas.current) return;
    player.current = playStory(canvas.current, product.story);
    return () => {
      player.current?.stop();
      player.current = null;
    };
  }, [slug]);

  if (!product) return null;
  const point = (active: boolean) => player.current?.point(active);

  return (
    <figure>
      <button
        type="button"
        className="piece"
        aria-label={`${product.name}: hover to play`}
        onPointerEnter={(event) => event.pointerType === "mouse" && point(true)}
        onPointerLeave={(event) => event.pointerType === "mouse" && point(false)}
        onFocus={() => point(true)}
        onBlur={() => point(false)}
        onPointerDown={(event) => event.pointerType !== "mouse" && point(true)}
        onPointerUp={(event) => event.pointerType !== "mouse" && point(false)}
        onPointerCancel={() => point(false)}
      >
        <canvas ref={canvas} className={`dots ${doto.className}`} style={{ aspectRatio: `${PRODUCT.columns} / ${PRODUCT.rows}` }} />
      </button>
      {withPrompt ? (
        <PieceCaption name={product.name} prompt={`/morph ${product.description}. Play it on hover.`} />
      ) : (
        <figcaption>{product.name}</figcaption>
      )}
    </figure>
  );
}
