# Checking a melt

## Blank frames

`thinnestMeltFrame(grid, from, to)` steps through the melt and returns the emptiest frame as a share of the smaller picture's dots, plus `ok` when that share is at least `THINNEST_SHARE` (0.35).

It runs without a browser for pictures made with `pictureFromCells` or `pictureFromRows`, so it fits in a unit test. For canvas pictures, call it in the browser once the pictures are drawn.

When it fails, the picture is too thin to survive the blur:

- thicken one-cell lines to two or three cells
- add ring fill inside outlines
- or move a ring band behind the line art

## Looking at frames

The live animation hides single bad frames. Render the melt at fixed steps (`melt.sample(from, to, step / 12)` for 1…11) into a row of small canvases and look at them together. Look for:

- a frame where most dots are gone
- dots flashing between solid and ring at the edges
- the old picture still visible after 80%
