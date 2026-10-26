---
name: morph
description: Dot pictures that melt into each other. Use when adding motion to dot art, making a dot illustration change on hover, looping a row of dot pictures, or fixing a dot melt that flickers or goes blank.
---

# Morph

A picture is a grid of cells, each solid, a ring or empty. Motion is always one picture melting into another: both are laid into one raster, blurred, and cut back to a hard edge, and every dot eases toward the result. Never sway, twist or distort a single picture; give it a second picture and melt.

## Steps

1. **Copy the kit.** Copy `kit/` into the project (for example `lib/morph/`). It has no dependencies.
2. **Fix the grid.** Pick `columns × rows` once per figure. Every picture in a figure shares it. Around 40 × 30 suits an icon, 160 × 100 a hero.
3. **Draw each picture** with `pictureFromCanvas(grid, draw)`. Draw in cell units: black ink is a solid dot, white ink a ring, bare canvas nothing. Solid for structure, rings for fill. See `references/pictures.md`.
4. **Pair pictures that share a shape.** The melt reads best when the second picture keeps some of the first's mass in place: sun and moon, closed and open lock.
5. **Check every melt** with `thinnestMeltFrame(grid, from, to)`. Anything under `THINNEST_SHARE` goes blank mid-melt: thicken lines to two or three cells or add ring fill, then check again. See `references/checking.md`.
6. **Wire it up.**
   - Hover or press: `playToggle(canvas, grid, rest, active)`, then call `point(true)` / `point(false)` from pointer and focus events.
   - Loop: build `Beat`s whose `picture(seconds)` is a pure function of time, then `playLoop(canvas, grid, new Loop(grid, beats))`. A beat can set its own `hold` and `melt` when a story needs one picture to stay longer than the rest.
   - Set the dot colour with CSS `color` on the canvas, and reserve its box with `aspect-ratio: columns / rows`.
7. **Wait for fonts** before drawing text into a picture: `await document.fonts.load(...)`.
8. **Look at frames.** Render the melt at several progress values and look at them side by side, not just the live animation.

## Rules

- Keep the tuning in `kit/melt.ts` (`MELT_TUNING`) and the loop timing (`LOOP_TIMING`, hold 2.4 s, melt 1.1 s) unless the user asks otherwise. See `references/melt.md`.
- Pictures used in a loop must be pure functions of time, so any frame can be rendered on its own.
- A dot on its way out keeps its fill while it shrinks. Do not change that in `DotField`.
- Under reduced motion, `playLoop` shows the first beat and `playToggle` swaps without melting. Keep it.
- Give the canvas an accessible name that says what the pictures are.

## Files

- `kit/grid.ts`: cell states, `Picture`, `pictureFromCells`, `pictureFromRows`
- `kit/paint.ts`: `pictureFromCanvas`
- `kit/melt.ts`: `Melt`, `MELT_TUNING`, `meltEnvelope`
- `kit/dots.ts`: `DotField`, `DOT_LAYOUT`
- `kit/loop.ts`, `kit/toggle.ts`: a looping row of beats, and a two-picture switch
- `kit/play.ts`: `playLoop`, `playToggle` (canvas sizing, frames, offscreen pause, reduced motion)
- `kit/check.ts`: `thinnestMeltFrame`
