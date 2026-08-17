import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ParentPresents",
    // Per-page titles are already written to fit within 60 characters, so the
    // template adds nothing — a suffix would push them past the truncation
    // point that pageMetadata() guards against.
    template: "%s",
  },
  icons: {
    // Rendered from the logo mark itself rather than a hand-drawn SVG
    // approximation — the two interlocking P's don't survive simplification.
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/favicon-180.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* One variable face covers headings and body, so it is render-critical.
            Preloading avoids the swap flash that would show up as a CLS penalty. */}
        <link
          rel="preload"
          href="/fonts/inter-latin-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-page"
        >
          Skip to content
        </a>

        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
