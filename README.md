# Morph

A skill for Claude Code that melts dot pictures into each other, and the site that shows it.

- `skill/morph/`: the skill. `SKILL.md`, three reference notes, and `kit/`, which has no dependencies.
- `app/`, `components/`, `pictures/`: the site. It imports `kit/` through `@kit/*`, so the figures run the code the skill ships.

```bash
npm run dev      # zips skill/morph into public/morph.zip, then starts Next
npm run build
```
