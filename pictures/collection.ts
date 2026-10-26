import type { Grid } from "@kit/grid";
import { pictureFromCanvas, type Drawing } from "@kit/paint";

export const PIECE: Grid = { columns: 44, rows: 30 };

const BLACK = "#000";
const WHITE = "#fff";
const [CX, CY] = [PIECE.columns / 2, PIECE.rows / 2];

export interface Piece {
  slug: string;
  name: string;
  rest: Drawing;
  active: Drawing;
}

function disc(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function outlined(context: CanvasRenderingContext2D, path: Path2D, band = 3) {
  context.strokeStyle = WHITE;
  context.lineWidth = band * 2;
  context.lineJoin = "round";
  context.stroke(path);
  context.fillStyle = BLACK;
  context.fill(path);
}

function triangle() {
  const path = new Path2D();
  path.moveTo(CX - 6, CY - 9);
  path.lineTo(CX + 9, CY);
  path.lineTo(CX - 6, CY + 9);
  path.closePath();
  return path;
}

function pauseBars() {
  const path = new Path2D();
  path.roundRect(CX - 8, CY - 9, 6, 18, 1);
  path.roundRect(CX + 2, CY - 9, 6, 18, 1);
  return path;
}

function cloud(context: CanvasRenderingContext2D, lift: number, fill: string, edge: string) {
  const puffs: [number, number, number][] = [
    [CX - 9, CY + 1, 5],
    [CX - 3, CY - 4, 7],
    [CX + 5, CY - 2, 6],
    [CX + 10, CY + 2, 4.5],
  ];
  for (const [x, y, radius] of puffs) disc(context, x, y - lift, radius + 1.4, edge);
  context.fillStyle = edge;
  context.fillRect(CX - 10, CY + 1 - lift, 21, 5.9);
  for (const [x, y, radius] of puffs) disc(context, x, y - lift, radius, fill);
  context.fillStyle = fill;
  context.fillRect(CX - 9, CY + 1 - lift, 19, 4.5);
}

function lock(context: CanvasRenderingContext2D, open: boolean) {
  context.strokeStyle = BLACK;
  context.lineWidth = 2.6;
  context.lineCap = "round";
  const lift = open ? 4 : 0;
  context.beginPath();
  context.moveTo(CX - 6, CY - 1);
  context.lineTo(CX - 6, CY - 6 - lift);
  context.arc(CX, CY - 6 - lift, 6, Math.PI, 0);
  context.lineTo(CX + 6, open ? CY - 7 : CY - 1);
  context.stroke();
  context.fillStyle = BLACK;
  context.beginPath();
  context.roundRect(CX - 10, CY - 2, 20, 14, 2);
  context.fill();
  context.fillStyle = WHITE;
  context.beginPath();
  context.roundRect(CX - 8, CY, 16, 10, 1);
  context.fill();
  disc(context, CX, CY + 4, 2, BLACK);
  context.fillStyle = BLACK;
  context.fillRect(CX - 0.8, CY + 4, 1.6, 4);
}

function soil(context: CanvasRenderingContext2D) {
  context.fillStyle = WHITE;
  context.fillRect(4, CY + 6, PIECE.columns - 8, 8);
  for (const [x, y] of [[9, 23], [16, 26], [29, 24], [36, 27], [12, 27], [33, 22]]) disc(context, x, y, 0.9, BLACK);
}

function eye(context: CanvasRenderingContext2D, open: boolean) {
  context.lineCap = "round";
  if (!open) {
    context.strokeStyle = BLACK;
    context.lineWidth = 2.4;
    context.beginPath();
    context.ellipse(CX, CY - 4, 14, 8, 0, Math.PI * 0.12, Math.PI * 0.88);
    context.stroke();
    context.lineWidth = 1.6;
    for (const angle of [0.25, 0.38, 0.5, 0.62, 0.75]) {
      const a = Math.PI * angle;
      const [x, y] = [CX + 14 * Math.cos(a), CY - 4 + 8 * Math.sin(a)];
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + 2.4 * Math.cos(a), y + 3 * Math.sin(a));
      context.stroke();
    }
    return;
  }
  const almond = new Path2D();
  almond.ellipse(CX, CY + 10, 20, 18, 0, Math.PI * 1.17, Math.PI * 1.83);
  almond.ellipse(CX, CY - 10, 20, 18, 0, Math.PI * 0.17, Math.PI * 0.83);
  almond.closePath();
  context.fillStyle = WHITE;
  context.fill(almond);
  context.strokeStyle = BLACK;
  context.lineWidth = 1.8;
  context.stroke(almond);
  disc(context, CX, CY, 6.5, BLACK);
  disc(context, CX + 2, CY - 2, 2, WHITE);
}

function letter(fontFamily: string, glyph: string): Drawing {
  return (context) => {
    context.font = `800 26px ${fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    for (let depth = 4; depth >= 1; depth--) {
      context.fillStyle = WHITE;
      context.fillText(glyph, CX - 1 + depth * 0.75, CY + 9 + depth * 0.75);
    }
    context.fillStyle = BLACK;
    context.fillText(glyph, CX - 1, CY + 9);
  };
}

function hourglass(context: CanvasRenderingContext2D, fallen: boolean) {
  context.fillStyle = BLACK;
  context.fillRect(CX - 9, CY - 13, 18, 2);
  context.fillRect(CX - 9, CY + 11, 18, 2);
  const glass = new Path2D();
  glass.moveTo(CX - 7, CY - 11);
  glass.lineTo(CX + 7, CY - 11);
  glass.lineTo(CX + 1, CY);
  glass.lineTo(CX + 7, CY + 11);
  glass.lineTo(CX - 7, CY + 11);
  glass.lineTo(CX - 1, CY);
  glass.closePath();
  context.fillStyle = WHITE;
  context.fill(glass);
  context.save();
  context.clip(glass);
  context.fillStyle = BLACK;
  if (fallen) {
    context.beginPath();
    context.moveTo(CX - 8, CY + 11);
    context.lineTo(CX, CY + 3);
    context.lineTo(CX + 8, CY + 11);
    context.fill();
  } else {
    context.fillRect(CX - 8, CY - 8, 16, 8);
  }
  context.restore();
}

export const pieces = (fontFamily: string): Piece[] => [
  {
    slug: "sun-moon",
    name: "Sun to moon",
    rest: (context) => {
      context.strokeStyle = WHITE;
      context.lineWidth = 2;
      context.lineCap = "round";
      for (let ray = 0; ray < 12; ray++) {
        const angle = (ray / 12) * Math.PI * 2;
        context.beginPath();
        context.moveTo(CX + 10.5 * Math.cos(angle), CY + 10.5 * Math.sin(angle));
        context.lineTo(CX + 13.5 * Math.cos(angle), CY + 13.5 * Math.sin(angle));
        context.stroke();
      }
      disc(context, CX, CY, 8.5, BLACK);
      disc(context, CX, CY, 4, WHITE);
    },
    active: (context) => {
      disc(context, CX, CY, 11, BLACK);
      context.globalCompositeOperation = "destination-out";
      disc(context, CX + 6, CY - 4, 9.5, BLACK);
      context.globalCompositeOperation = "source-over";
      for (const [x, y] of [[CX + 9, CY + 6], [CX + 13, CY - 1], [CX + 5, CY + 10]]) disc(context, x, y, 1, WHITE);
      disc(context, CX - 6, CY + 3, 1.8, WHITE);
    },
  },
  {
    slug: "play-pause",
    name: "Play to pause",
    rest: (context) => outlined(context, triangle()),
    active: (context) => outlined(context, pauseBars()),
  },
  {
    slug: "lock",
    name: "Locked to open",
    rest: (context) => lock(context, false),
    active: (context) => lock(context, true),
  },
  {
    slug: "cloud-rain",
    name: "Cloud to rain",
    rest: (context) => cloud(context, 0, WHITE, BLACK),
    active: (context) => {
      cloud(context, 4, BLACK, WHITE);
      context.strokeStyle = BLACK;
      context.lineWidth = 1.3;
      context.lineCap = "round";
      for (const [x, y] of [[CX - 8, CY + 6], [CX - 2, CY + 8], [CX + 4, CY + 6], [CX + 10, CY + 8], [CX - 5, CY + 12], [CX + 7, CY + 12]]) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x - 1.4, y + 3);
        context.stroke();
      }
    },
  },
  {
    slug: "seed-sprout",
    name: "Seed to sprout",
    rest: (context) => {
      soil(context);
      context.fillStyle = BLACK;
      context.beginPath();
      context.ellipse(CX, CY + 4, 5, 3.4, -0.3, 0, Math.PI * 2);
      context.fill();
    },
    active: (context) => {
      soil(context);
      context.strokeStyle = BLACK;
      context.lineWidth = 1.6;
      context.beginPath();
      context.moveTo(CX, CY + 8);
      context.quadraticCurveTo(CX - 2, CY, CX, CY - 6);
      context.stroke();
      context.fillStyle = BLACK;
      context.beginPath();
      context.ellipse(CX - 5, CY - 6, 5, 2.4, -0.5, 0, Math.PI * 2);
      context.ellipse(CX + 5, CY - 8, 5, 2.4, 0.5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = WHITE;
      context.beginPath();
      context.ellipse(CX, CY + 6, 4.4, 2.6, -0.3, 0, Math.PI * 2);
      context.fill();
    },
  },
  {
    slug: "eye",
    name: "Open to shut",
    rest: (context) => eye(context, true),
    active: (context) => eye(context, false),
  },
  {
    slug: "letter",
    name: "A to a",
    rest: letter(fontFamily, "A"),
    active: letter(fontFamily, "a"),
  },
  {
    slug: "hourglass",
    name: "Full to empty",
    rest: (context) => hourglass(context, false),
    active: (context) => hourglass(context, true),
  },
];

export const piecePictures = (piece: Piece) => ({
  rest: pictureFromCanvas(PIECE, piece.rest),
  active: pictureFromCanvas(PIECE, piece.active),
});

export const PIECE_SLUGS = pieces("sans-serif").map((piece) => piece.slug);
