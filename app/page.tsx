import Link from "next/link";
import { HeroFigure } from "@/components/hero-figure";
import { ProductPiece } from "@/components/product-piece";
import { Top } from "@/components/top";
import { HERO } from "@/pictures/hero";
import { PRODUCTS } from "@/pictures/products";

const QUESTIONS = [
  {
    question: "Does it need React?",
    answer: "No. The kit is plain TypeScript that draws on a canvas. This site uses React, but nothing in the kit does.",
  },
  {
    question: "Can I change a picture after it is made?",
    answer: "Yes. Every picture is a canvas drawing in code, so ask Claude to change it, or edit the drawing yourself.",
  },
  {
    question: "Will it slow my page down?",
    answer: "A loop only draws while it is on screen, and a hover piece only draws while its dots are moving.",
  },
  {
    question: "Is it accessible?",
    answer: "Under reduced motion a loop holds its first picture and a hover piece swaps without melting. Pieces are buttons with labels, so focus melts them too.",
  },
  {
    question: "Light or dark?",
    answer:
      "Either. The dots paint in the canvas's CSS colour, so they follow your theme. The switch at the top of this page swaps that colour.",
  },
  {
    question: "How do I get the best result?",
    answer: "Give pictures mass. Solid shapes and ring fills melt well; one-cell outlines blur away halfway, and the kit's check will tell you.",
  },
];

export default function Home() {
  return (
    <main>
      <div className="column">
        <Top />
        <p className="tagline">Give Claude two pictures, and it melts one into the other in dots.</p>
        <div className="strip">
          {PRODUCTS.map(({ slug }) => (
            <ProductPiece key={slug} slug={slug} />
          ))}
        </div>
        <div className="meta">
          <p>
            <span>/morph</span>
            <a href="#install">Install ↓</a>
          </p>
          <p>
            Built by <a href="https://x.com/iangerado">Ian Gerado</a>
          </p>
        </div>
        <div className="prose">
          <p>
            Every picture is a grid of dots, and each dot is solid, a ring, or gone. To get from one picture to the next,
            both are blurred together and cut back to a hard edge, so shapes grow necks and pour into each other instead of
            fading.
          </p>
        </div>
      </div>

      <figure className="column hero">
        <HeroFigure />
        <figcaption className="caption">
          The Golden Gate: a sailboat, cars, a gull and a motorboat. {(HERO.columns * HERO.rows).toLocaleString("en-US")} dots.
        </figcaption>
      </figure>

      <div className="column">
        <section>
          <h2>
            <span className="number">01</span>Use
          </h2>
          <p>Describe the pictures and where they go.</p>
          <ul className="plain" style={{ marginTop: 14 }}>
            <li>
              <code>/morph a sun that melts into a moon on hover</code>
            </li>
            <li>
              <code>/morph our logo, looping through the three product icons</code>
            </li>
            <li>
              <code>/morph why does the chart-to-list melt go blank halfway?</code>
            </li>
          </ul>
          <p style={{ marginTop: 14 }}>
            Claude draws each picture with the canvas API, reads it back into dots, checks every melt for blank frames, then
            wires it to hover or a loop.
          </p>
        </section>

        <section id="install">
          <h2>
            <span className="number">02</span>Install
          </h2>
          <p>
            Download <a href="/morph.zip">morph.zip</a> and unzip it into your skills folder.
          </p>
          <figure className="code">
            <pre>
              <code>unzip ~/Downloads/morph.zip -d ~/.claude/skills</code>
            </pre>
          </figure>
        </section>

        <section>
          <h2>
            <span className="number">03</span>Limits
          </h2>
          <ul className="plain">
            <li>Pictures need mass. One-cell outlines blur away mid-melt; the kit&apos;s check catches them.</li>
            <li>Three states per dot, one colour. No greys inside a picture.</li>
            <li>Canvas 2D. Tens of thousands of dots is fine; far past that, move the dots to WebGL.</li>
          </ul>
        </section>

        <section className="questions">
          <h2 className="ruled">
            Questions<span className="count">{QUESTIONS.length}</span>
          </h2>
          {QUESTIONS.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </section>

        <footer>
          <p>
            Made by Ian Gerado, <a href="https://x.com/iangerado">@iangerado</a>. Built with Claude Code. Set in Rethink
            Sans. The product pictures are Context.dev&apos;s, from the cards on its site.
          </p>
          <p>
            <Link href="/how-i-built-it">How I built it</Link> · <a href="/morph.zip">morph.zip</a> ·{" "}
            <a href="https://x.com/iangerado">@iangerado on X</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
