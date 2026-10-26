import Link from "next/link";
import { DotColorToggle } from "./dot-color";

const PAGES = [
  { href: "/collection", label: "Collection" },
  { href: "/how-i-built-it", label: "How I built it" },
] as const;

export function Top({ current, subtitle = "a skill for Claude Code" }: { current?: (typeof PAGES)[number]["href"]; subtitle?: string }) {
  return (
    <header className="top">
      <h1>
        <Link href="/" style={{ textDecoration: "none" }}>
          Morph
        </Link>
        <span className="muted"> · {subtitle}</span>
      </h1>
      <nav>
        {PAGES.map(({ href, label }) => (
          <Link key={href} href={href} aria-current={href === current ? "page" : undefined}>
            {label}
          </Link>
        ))}
        <DotColorToggle />
      </nav>
    </header>
  );
}
