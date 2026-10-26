# The melt

Per frame, at `progress` 0…1:

1. The outgoing picture shrinks toward the grid's middle (to `retreatScale`, 0.78) between 5% and 60%.
2. The incoming picture is laid over it with weight `handover`, which eases from 0 to 1 between 30% and 75%. The outgoing one fades by the same amount.
3. Two fields are laid at 2 × 2 samples per cell with a 4-cell margin: coverage, and how much of the cover is solid.
4. Both are blurred. The blur rises from 0 to `blurCells` (1.4 cells) and back on a sine across the melt.
5. Each cell reads back: present if its coverage is at least 0.5, solid if its solid share is at least 0.5.

The blur is what makes it melt rather than fade: where two shapes come within a couple of cells, the blurred cover between them passes 0.5 and a neck forms.

Dots then ease toward the result with a 40 ms time constant (`DotField.ease`), so a cell that flips swells or drains over a few frames.

## Tuning

- More `blurCells` makes it gooier and thins small parts sooner.
- A smaller `retreatScale` pulls the old picture in harder, which helps when both pictures fill the same box.
- Keep the melt between 0.9 and 1.3 s. Shorter reads as a cut; longer reads as a loading state.
