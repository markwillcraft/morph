import Link from "next/link";
import { PAGES, type PageHref } from "./pages";

/** The pages, the questions and the downloads, beside the column on wide screens. */
export function Sidebar({ current }: { current: PageHref }) {
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
        <Link href="/#questions">Questions</Link>
      </nav>
      <nav aria-label="Get it">
        <p className="sidebar-heading">Get it</p>
        <a href="/morph/morph.zip">morph.zip</a>
        <a href="https://github.com/markwillcraft/morph">GitHub</a>
        <a href="https://x.com/iangerado">@iangerado</a>
      </nav>
    </aside>
  );
}
