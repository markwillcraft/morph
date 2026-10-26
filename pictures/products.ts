import type { Grid } from "@kit/grid";
import type { Beat } from "@kit/loop";
import {
  ANSWER,
  ANSWER_STORY_GRID,
  BOOKS,
  BOOK_SIZE,
  BRACES,
  CITED,
  FIELD_COUNT,
  FIELD_TEXTS,
  QUESTION,
  QUESTION_LINES,
  SOURCES,
  SOURCES_LABEL,
  THINKING,
  fieldAt,
} from "./context/answer";
import { clamp01 } from "./context/cells";
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotStoryText, type StoryPicture } from "./context/dots";
import {
  BLANK_WINDOW,
  FORMATS,
  OUTPUT_TEXT,
  OUTPUT_WINDOWS,
  PAGE,
  PAGE_LABELS,
  PUBLISHED_PAGE,
  tabsFor,
  WINDOW_ROWS,
  WINDOW_TOP_ROW,
} from "./context/extract";
import {
  KEYS,
  QUERY_LINES,
  RESULTS_FILLED,
  RESULTS_READ,
  RESULT_TEXTS,
  SCREEN_LABEL,
  TERMINAL,
  resultAt,
} from "./context/search";
import {
  BELL_AND_NOTICE,
  BELL_AT_REST,
  CHECKS,
  CLOCK_AT_REST,
  NOTICE,
  NOTICE_TEXTS,
  SCHEDULE,
  paintBell,
  paintClock,
  paintNotice,
} from "./context/watch";

/**
 * Context.dev's four products, told as their product cards tell them on context.dev (context-website's search,
 * extract, answer and watch stories), with the pictures and text copied from there. Each story is several pictures in
 * a row: most melt into the next, and some are built in dot by dot instead, where the site builds them.
 */

export const PRODUCT: Grid = { columns: ANSWER_STORY_GRID.columns, rows: ANSWER_STORY_GRID.rows };
/** The space the site sets its text in: one cell is this many units. */
export const PRODUCT_PITCH = ANSWER_STORY_GRID.pitch;

const { columns, rows } = PRODUCT;
const MELT = 1.1;
const CURSOR_GAP = 3;

// Where a melt would thin to nothing (braces, a clock face's outline), the next picture spreads out from the middle
// instead, so no frame of the story goes blank.
const fromMiddle = (column: number, row: number) =>
  clamp01(Math.hypot(column - columns / 2, (row - rows / 2) * 1.5) / (columns / 2));

export interface Pen {
  text: (text: DotStoryText, presence?: number) => void;
  /** Types `text` from `startsAt` seconds into the hold, with a cursor until `cursorLingers` after the last letter. */
  type: (
    text: DotStoryText,
    held: number,
    typing: { startsAt: number; perSecond: number; cursorLingers?: number },
  ) => void;
}

/** What a product draws over its dots: text, plus a block cursor where something is being typed. */
export interface Ink {
  text: (text: DotStoryText, presence: number) => void;
  cursor: (text: DotStoryText, x: number, presence: number) => void;
  measure: (text: DotStoryText) => number;
}

interface Step {
  picture: StoryPicture;
  hold: number;
  /** Builds the picture over the last one's dots instead of melting into it: each dot changes once `order` is reached. */
  builds?: { seconds: number; order: (column: number, row: number) => number };
  /** Moves the held picture's parts: `states` starts as the picture and is changed in place. */
  animate?: (states: Uint8Array, held: number) => void;
  /** Writes over the held picture; the writing fades out as the next picture arrives. */
  write?: (pen: Pen, held: number) => void;
}

export interface Story {
  beats: Beat[];
  duration: number;
  /** Where the story stands before anyone hovers it: the frame the site shows as its still. */
  rest: number;
  write: (ink: Ink, seconds: number) => void;
}

const typingSeconds = (text: DotStoryText, perSecond: number) => text.text.length / perSecond;

function penFor(ink: Ink, presence: number): Pen {
  return {
    text: (text, fade = 1) => ink.text(text, presence * fade),
    type(text, held, { startsAt, perSecond, cursorLingers = 0.4 }) {
      const typed = { ...text, text: text.text.slice(0, Math.max(0, Math.floor((held - startsAt) * perSecond))) };
      ink.text(typed, presence);
      if (held < startsAt || held > startsAt + typingSeconds(text, perSecond) + cursorLingers) return;
      ink.cursor(text, text.x + ink.measure(typed) + CURSOR_GAP, presence);
    },
  };
}

/** Turns a story's steps into beats: a step that builds holds for its build, and the step before it hands over at once. */
function story(name: string, steps: Step[], rest: { step: number; held: number }): Story {
  const built = (step: Step) => step.builds?.seconds ?? 0;
  const beats: Beat[] = steps.map((step, index) => {
    const next = steps[(index + 1) % steps.length];
    return {
      name: `${name} ${index + 1}`,
      hold: built(step) + step.hold,
      melt: next.builds ? 0 : MELT,
      picture: (seconds) => {
        const states = step.picture.states.slice();
        if (step.builds && seconds < built(step)) {
          const from = beats[(index - 1 + steps.length) % steps.length];
          const before = from.picture(from.hold!);
          const reached = seconds / built(step);
          for (let cell = 0; cell < states.length; cell++) {
            if (step.builds.order(cell % columns, Math.floor(cell / columns)) > reached) states[cell] = before[cell];
          }
          return states;
        }
        step.animate?.(states, seconds - built(step));
        return states;
      },
    };
  });

  const starts: number[] = [];
  let duration = 0;
  for (const beat of beats) {
    starts.push(duration);
    duration += beat.hold! + beat.melt!;
  }

  return {
    beats,
    duration,
    rest: starts[rest.step] + built(steps[rest.step]) + rest.held,
    write(ink, seconds) {
      const t = ((seconds % duration) + duration) % duration;
      let index = starts.length - 1;
      while (starts[index] > t) index--;
      const step = steps[index];
      const held = t - starts[index] - built(step);
      if (!step.write || held < 0) return;
      // The writing fades out over the first half of the melt into the next picture.
      const leaving = held - step.hold;
      const melt = beats[index].melt!;
      const presence = leaving <= 0 ? 1 : melt > 0 ? 1 - clamp01(leaving / (melt / 2)) : 0;
      if (presence > 0) step.write(penFor(ink, presence), Math.min(held, step.hold));
    },
  };
}

// ── Search: the question is typed at the terminal, a key going down with each letter; the terminal melts into three
// ranked results, and their rings clear one result at a time as what was read is written in. ──

const SEARCH_TYPING = { startsAt: 0.5, perSecond: 11 };
const SECOND_LINE_AT = SEARCH_TYPING.startsAt + typingSeconds(QUERY_LINES[0], SEARCH_TYPING.perSecond);
const TYPED_AT = SECOND_LINE_AT + typingSeconds(QUERY_LINES[1], SEARCH_TYPING.perSecond);
const RESULT_READ = { everySeconds: 0.45, textSeconds: 0.3 };

function pressKey(states: Uint8Array, held: number) {
  if (held < SEARCH_TYPING.startsAt || held > TYPED_AT) return;
  const letter = Math.floor((held - SEARCH_TYPING.startsAt) * SEARCH_TYPING.perSecond);
  const key = KEYS[(letter * 37 + 11) % KEYS.length];
  states[key.row * columns + key.column] = DOT_FILLED;
}

const search = story(
  "Search",
  [
    {
      picture: TERMINAL,
      hold: TYPED_AT + 0.9,
      animate: pressKey,
      write(pen, held) {
        pen.text(SCREEN_LABEL);
        pen.type(QUERY_LINES[0], held, { ...SEARCH_TYPING, cursorLingers: 0 });
        pen.type(QUERY_LINES[1], held, { ...SEARCH_TYPING, startsAt: SECOND_LINE_AT, cursorLingers: Infinity });
      },
    },
    { picture: RESULTS_FILLED, hold: 0.2 },
    {
      picture: RESULTS_READ,
      hold: 3.6,
      builds: { seconds: 1.2, order: (column, row) => (resultAt(row) + column / columns) / RESULT_TEXTS.length },
      write: (pen, held) =>
        RESULT_TEXTS.forEach((texts, index) =>
          texts.forEach((text) =>
            pen.text(text, clamp01((held - index * RESULT_READ.everySeconds) / RESULT_READ.textSeconds)),
          ),
        ),
    },
    { picture: RESULTS_FILLED, hold: 0.1, builds: { seconds: 0.5, order: (column) => column / columns } },
  ],
  { step: 2, held: 2.4 },
);

// ── Scrape: a scan runs down a live page, reading its rings into solid dots; the page melts into a window, which
// steps through each output format in turn, typing the text ones and building the image and screenshot ones. ──

const SCAN = { startsAt: 0.5, seconds: 2.2 };
const FORMAT_TYPING = { startsAt: 0.25, perSecond: 44, pauseSeconds: 0.1 };

function scanPage(states: Uint8Array, held: number) {
  const scanned = clamp01((held - SCAN.startsAt) / SCAN.seconds);
  if (scanned <= 0) return;
  const bar = PAGE.top + Math.round(scanned * (PAGE.bottom - PAGE.top));
  for (let row = PAGE.top + 4; row <= Math.min(bar, PAGE.bottom - 1); row++) {
    for (let column = PAGE.left + 1; column < PAGE.right; column++) {
      const cell = row * columns + column;
      if (states[cell] === DOT_HOLLOW || (row === bar && scanned < 1 && PUBLISHED_PAGE.states[cell] === DOT_ABSENT)) {
        states[cell] = DOT_FILLED;
      }
    }
  }
}

const topToBottom = (_column: number, row: number) => clamp01((row - WINDOW_TOP_ROW) / WINDOW_ROWS);

function formatStep(format: (typeof FORMATS)[number], isFirst: boolean): Step {
  const texts = OUTPUT_TEXT[format];
  const typed = format === "Markdown" || format === "HTML" || format === "JSON" || format === "Highlights";
  const startsAt = texts.map(
    (_, index) =>
      FORMAT_TYPING.startsAt +
      texts
        .slice(0, index)
        .reduce((total, text) => total + typingSeconds(text, FORMAT_TYPING.perSecond) + FORMAT_TYPING.pauseSeconds, 0),
  );
  const typingEnds =
    texts.length === 0
      ? 0
      : startsAt[texts.length - 1] + typingSeconds(texts[texts.length - 1], FORMAT_TYPING.perSecond);
  return {
    picture: OUTPUT_WINDOWS[format],
    hold: typed ? typingEnds + 0.9 : 2.2,
    builds: { seconds: isFirst ? 0.5 : 0.35, order: topToBottom },
    write(pen, held) {
      tabsFor(format).forEach((tab) => pen.text(tab));
      if (typed) texts.forEach((text, index) => pen.type(text, held, { ...FORMAT_TYPING, startsAt: startsAt[index] }));
      else texts.forEach((text) => pen.text(text));
    },
  };
}

const scrape = story(
  "Scrape",
  [
    {
      picture: PUBLISHED_PAGE,
      hold: SCAN.startsAt + SCAN.seconds + 0.5,
      animate: scanPage,
      write: (pen) => PAGE_LABELS.forEach((label) => pen.text(label)),
    },
    { picture: BLANK_WINDOW, hold: 0.2 },
    ...FORMATS.map((format, index) => formatStep(format, index === 0)),
    { picture: BLANK_WINDOW, hold: 0.1, builds: { seconds: 0.5, order: topToBottom } },
  ],
  { step: 0, held: 0 },
);

// ── Research: the question is typed into its bubble and the bubble thinks; it melts into the sources, read one after
// another; they become a pair of braces, and the answer is written between them field by field. ──

const QUESTION_TYPING = { startsAt: 0.4, perSecond: 12 };
const QUESTION_SECOND_LINE_AT = QUESTION_TYPING.startsAt + typingSeconds(QUESTION_LINES[0], QUESTION_TYPING.perSecond);
const ASKED_AT = QUESTION_SECOND_LINE_AT + typingSeconds(QUESTION_LINES[1], QUESTION_TYPING.perSecond);
const READ = { startsAt: 0.2, secondsEach: 0.7, width: 3 };
const FIELD = { everySeconds: 0.45, textSeconds: 0.3 };

function think(states: Uint8Array, held: number) {
  for (const column of THINKING.columns) states[THINKING.row * columns + column] = DOT_ABSENT;
  if (held < ASKED_AT) return;
  const lit = Math.floor((held - ASKED_AT) / 0.25) % (THINKING.columns.length + 1);
  THINKING.columns.forEach((column, index) => {
    if (index < lit) states[THINKING.row * columns + column] = DOT_FILLED;
  });
}

function readSources(states: Uint8Array, held: number) {
  const reading = (held - READ.startsAt) / READ.secondsEach;
  const source = BOOKS[Math.floor(reading)];
  if (reading < 0 || !source) return;
  const band = source.left + BOOK_SIZE.spine + (reading % 1) * (BOOK_SIZE.columns - BOOK_SIZE.spine - BOOK_SIZE.pages);
  for (let row = source.top + 1; row < source.top + BOOK_SIZE.rows - 1; row++) {
    for (let column = Math.ceil(band - READ.width); column <= band; column++) {
      const cell = row * columns + column;
      if (column >= source.left + BOOK_SIZE.spine && states[cell] !== DOT_ABSENT) {
        states[cell] = states[cell] === DOT_FILLED ? DOT_HOLLOW : DOT_FILLED;
      }
    }
  }
}

const research = story(
  "Research",
  [
    {
      picture: QUESTION,
      hold: ASKED_AT + 1.2,
      builds: { seconds: 0.8, order: fromMiddle },
      animate: think,
      write(pen, held) {
        pen.type(QUESTION_LINES[0], held, { ...QUESTION_TYPING, cursorLingers: 0 });
        pen.type(QUESTION_LINES[1], held, { ...QUESTION_TYPING, startsAt: QUESTION_SECOND_LINE_AT });
      },
    },
    {
      picture: SOURCES,
      hold: READ.startsAt + BOOKS.length * READ.secondsEach + 0.3,
      animate: readSources,
      write: (pen) => pen.text(SOURCES_LABEL),
    },
    { picture: BRACES, hold: 0.1, builds: { seconds: 0.8, order: fromMiddle } },
    {
      picture: ANSWER,
      hold: 3.6,
      builds: { seconds: 1.4, order: (_column, row) => fieldAt(row) / FIELD_COUNT },
      write(pen, held) {
        FIELD_TEXTS.forEach((text, index) =>
          pen.text(text, clamp01((held - index * FIELD.everySeconds) / FIELD.textSeconds)),
        );
        pen.text(CITED, clamp01((held - FIELD_COUNT * FIELD.everySeconds) / FIELD.textSeconds));
      },
    },
  ],
  { step: 3, held: 2.6 },
);

// ── Monitor: the clock's hand goes round once, a check landing at each quarter; the last check finds a change, and
// the clock melts into a bell that rings while the notice of what changed is written out beside it. ──

const DAY = { startsAt: 0.4, seconds: 3.2, textSeconds: 0.3 };
const RING = { swings: 3, columns: 2.2, secondsEach: 0.42, sound: { from: 13, to: 19 } };
const RINGING_SECONDS = RING.swings * RING.secondsEach;
const NOTICE_LINE = { everySeconds: 0.35, seconds: 0.3 };

const turnsAt = (held: number) => clamp01((held - DAY.startsAt) / DAY.seconds);

function ring(states: Uint8Array, held: number) {
  const rung = held / RINGING_SECONDS;
  if (rung >= 1) return;
  const swing = Math.round(RING.columns * (1 - rung) * Math.sin(rung * RING.swings * Math.PI * 2));
  paintBell(states, swing, RING.sound.from + ((held / RING.secondsEach) % 1) * (RING.sound.to - RING.sound.from));
}

const monitor = story(
  "Monitor",
  [
    {
      picture: CLOCK_AT_REST,
      hold: DAY.startsAt + DAY.seconds + 0.5,
      builds: { seconds: 0.8, order: fromMiddle },
      animate: (states, held) => void paintClock(states, turnsAt(held)),
      write(pen, held) {
        pen.text(SCHEDULE);
        CHECKS.forEach(({ time, result }, index) => {
          const checked = clamp01(
            (turnsAt(held) * DAY.seconds - ((index + 1) / CHECKS.length) * DAY.seconds + DAY.textSeconds) /
              DAY.textSeconds,
          );
          pen.text(time, checked);
          pen.text(result, checked);
        });
      },
    },
    { picture: BELL_AT_REST, hold: RINGING_SECONDS, animate: ring },
    {
      picture: BELL_AND_NOTICE,
      hold: 4,
      builds: { seconds: 0.6, order: (column) => clamp01((column - NOTICE.left) / NOTICE.columns) },
      animate(states, held) {
        if (held > RINGING_SECONDS) return;
        ring(states, held);
        paintNotice(states);
      },
      write: (pen, held) =>
        NOTICE_TEXTS.forEach((text, index) =>
          pen.text(text, clamp01((held - index * NOTICE_LINE.everySeconds) / NOTICE_LINE.seconds)),
        ),
    },
  ],
  { step: 2, held: 2.8 },
);

export interface Product {
  slug: string;
  name: string;
  story: Story;
}

export const PRODUCTS: Product[] = [
  { slug: "search", name: "Search", story: search },
  { slug: "scrape", name: "Scrape", story: scrape },
  { slug: "research", name: "Research", story: research },
  { slug: "monitor", name: "Monitor", story: monitor },
];
