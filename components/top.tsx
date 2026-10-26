import Link from "next/link";
import { DotColorToggle } from "./dot-color";
import { PAGES, type PageHref } from "./pages";
import { Sidebar } from "./sidebar";

export const SUBTITLE = "a skill for Claude Code and Codex";

export function Top({ current, subtitle = SUBTITLE }: { current: PageHref; subtitle?: string }) {
  return (
    <>
      <Sidebar current={current} />
      <header className="top">
        <h1>
          <Link href="/" style={{ textDecoration: "none" }}>
            Morph
          </Link>
          <span className="muted"> · {subtitle}</span>
        </h1>
        <nav>
          {PAGES.filter(({ href }) => href !== "/").map(({ href, label }) => (
            <Link key={href} href={href} className="top-page" aria-current={href === current ? "page" : undefined}>
              {label}
            </Link>
          ))}
          <DotColorToggle />
        </nav>
      </header>
    </>
  );
}
