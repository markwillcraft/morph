# Drawing pictures

`pictureFromCanvas(grid, draw)` hands `draw` a 2D context scaled so one unit is one cell. Each cell is read back from the 4 × 4 pixels it covers:

- covered less than half: empty
- covered, mostly dark: solid
- covered, mostly light: ring

So draw with exactly two inks, `#000` and `#fff`, on a transparent canvas. Greys split at the middle.

## What reads well

- **Solid for structure, rings for fill.** An outline in solid around a ring interior reads as an object; a field of one state reads as a texture.
- **Lines at least 1.1 cells wide.** Thinner strokes fall under half coverage and vanish in places.
- **Shading in two steps.** Light side rings, shadow side solid. Compute it per cell (`fillRect(column, row, 1, 1)`) when the edge matters.
- **Occlusion by painting order.** Draw back to front and let later shapes cover earlier ones. Fill behind a line with white to hide what is behind it.
- **Text** works with any loaded font. Draw it solid, with a few white copies offset behind it for depth.

## Hand-made pictures

For small icons, `pictureFromRows(grid, lines)` reads `#` as solid and `o` as ring, one string per row.
