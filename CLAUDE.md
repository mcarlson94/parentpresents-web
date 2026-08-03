# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on :3000 (Turbopack)
npm run build    # production build — also the strictest typecheck
npm start        # serve the production build
npm run lint     # eslint (flat config, eslint-config-next)
npx tsc --noEmit # typecheck without building
```

There is no test runner configured. `npm run build` is currently the real
verification gate: it typechecks, then prerenders every route, so a broken
`generateStaticParams` or a bad `params` signature fails there and nowhere else.

## Stack

Next.js 16.2.12 (App Router, Turbopack) · React 19 · TypeScript strict ·
Tailwind CSS v4. Imports use the `@/*` → `./src/*` alias.

Two version-specific details that bite:

- **Tailwind v4 has no `tailwind.config.js`.** Theme tokens are declared in the
  `@theme` block of `src/app/globals.css`, and Tailwind generates utilities from
  them (`--color-clay` → `bg-clay`, `text-clay`, `border-clay`). Add a design
  token by adding a CSS custom property there, not by editing a JS config.
- **Route `params` is a `Promise`** in Next 16. Page components take
  `params: Promise<{ slug: string }>` and must `await` it. Same in
  `generateMetadata`.

## Architecture

### Content is data, not JSX

Every gift guide lives as a typed `Guide` object in `src/content/guides.ts` and
renders through one dynamic route, `src/app/guides/[slug]/page.tsx`. There is no
per-guide page file and there should not be one.

To add a guide: append a `Guide` to the `guides` array. `generateStaticParams`
picks it up, the route prerenders it, and it appears automatically on both the
homepage and `/guides` because both map over the same array.

The `GiftIdea` type encodes the site's editorial stance in the schema itself:
`effort` is a required field alongside `priceRange` (time is treated as a real
cost), and `notFor` is required, so an idea cannot be published without stating
who it's wrong for. Keep those required — dropping them to optional would let
the content quietly drift into generic-gift-guide territory.

`src/content/guides.ts` is also the intended seam for a CMS or MDX pipeline
later; keep the rendering components reading from the `Guide`/`GiftIdea` types
rather than from any future source directly.

### Layout and components

`src/app/layout.tsx` owns the fonts, the skip link, and the header/footer, so
pages render only their own content. Components in `src/components/` are plain
presentational server components — there is no `"use client"` anywhere in the
project, and nothing so far needs it.

## Brand and design constraints

This is an emotional trust brand, not an SEO gift-guide site. The distinction is
load-bearing for content and copy decisions:

- **Short over comprehensive.** Six defensible ideas beat sixty affiliate links.
- **No paid placement**, and price ranges are indicative rather than live quotes
  — the guide page says so in print. Don't add live pricing or affiliate links
  without the user explicitly deciding to change that positioning.
- **Ideas are category-level, not branded products** (e.g. "her handwriting,
  made permanent," not a specific vendor). Don't invent specific product
  recommendations; a real person is meant to evaluate anything named.
- **The mortality framing is the point but must stay restrained.** "You have a
  finite number of birthdays left with them" is the register — honest and quiet.
  Don't escalate it into urgency or guilt copy.

Visually: warm printed-paper palette, Fraunces (serif headings) + Inter (body).
**The site is intentionally light-only** — no dark mode, no
`prefers-color-scheme` handling. The warmth is the brand and it inverts cold, so
adding dark mode is a brand decision, not a cleanup task.

Sample copy in `src/content/guides.ts` is marked as placeholder in a header
comment. Preserve that marker until real reviewed content replaces it.

## Known state

- `npm audit` reports 3 high-severity advisories in `postcss` and `sharp`, both
  transitive dependencies of `next@16.2.12`. `npm audit fix --force` "resolves"
  them by downgrading to `next@9` — do not run it. They clear when Next ships
  bumped versions.
- `origin` is set to `github.com/mcarlson94/parentpresents-web` but nothing has
  been pushed yet.
