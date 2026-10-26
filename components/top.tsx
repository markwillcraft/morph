import Link from "next/link";
import { DotColorToggle } from "./dot-color";
import { PAGES, type PageHref, type SidebarSection } from "./pages";
import { Sidebar } from "./sidebar";

export const SUBTITLE = "a skill for Claude Code and Codex";

export function Top({
  current,
  subtitle = SUBTITLE,
  sections,
}: {
  current: PageHref;
  subtitle?: string;
  sections?: SidebarSection[];
}) {
  return (
    <>
      <Sidebar current={current} sections={sections} />
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
