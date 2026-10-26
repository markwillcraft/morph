export const PAGES = [
  { href: "/", label: "Overview" },
  { href: "/collection", label: "Collection" },
  { href: "/how-i-built-it", label: "How I built it" },
] as const;

export type PageHref = (typeof PAGES)[number]["href"];
