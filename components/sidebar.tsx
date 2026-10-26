"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DotColorToggle } from "./dot-color";
import { PAGES, type PageHref, type SidebarSection } from "./pages";

/** Follows the section nearest the top of the screen, so the sidebar can mark where the reader is. */
function useCurrentSection(sections: SidebarSection[]) {
  const [current, setCurrent] = useState<string>();
  useEffect(() => {
    const elements = sections.flatMap(({ id }) => document.getElementById(id) ?? []);
    if (elements.length === 0) return;
    const update = () => {
      const line = innerHeight * 0.3;
      let found: string | undefined;
      for (const element of elements) if (element.getBoundingClientRect().top <= line) found = element.id;
      setCurrent(found);
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [sections]);
  return current;
}

/** Pages, this page's sections, the dot colour and the downloads, beside the column on wide screens. */
export function Sidebar({ current, sections = [] }: { current: PageHref; sections?: SidebarSection[] }) {
  const reading = useCurrentSection(sections);
  return (
    <aside className="sidebar" aria-label="Site">
      <Link href="/" className="sidebar-mark">
        Morph
      </Link>
      <nav aria-label="Pages">
        {PAGES.map(({ href, label }) => (
          <Link key={href} href={href} aria-current={href === current ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      {sections.length > 0 && (
        <nav aria-label="On this page">
          <p className="sidebar-heading">On this page</p>
          {sections.map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={id === reading ? "location" : undefined}>
              {label}
            </a>
          ))}
        </nav>
      )}
      <div className="sidebar-group">
        <p className="sidebar-heading">Dots</p>
        <label className="sidebar-switch">
          <DotColorToggle />
          <span>Blue</span>
        </label>
      </div>
      <nav aria-label="Get it">
        <p className="sidebar-heading">Get it</p>
        <a href="/morph.zip">morph.zip</a>
        <a href="https://github.com/markwillcraft/morph">GitHub</a>
        <a href="https://x.com/iangerado">@iangerado</a>
      </nav>
    </aside>
  );
}
