import type { Metadata } from "next";
import { DOT_COLOR_SCRIPT } from "@/components/dot-color";
import { rethinkSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morph · a skill for Claude Code",
  description: "Give Claude two pictures, and it melts one into the other in dots.",
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
