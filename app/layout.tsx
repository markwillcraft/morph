import type { Metadata } from "next";
import { DOT_COLOR_SCRIPT } from "@/components/dot-color";
import { rethinkSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morph · a skill for Claude Code",
  description: "Show or describe as many pictures as you like, and Claude melts each one into the next in dots.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={rethinkSans.className} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: DOT_COLOR_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
