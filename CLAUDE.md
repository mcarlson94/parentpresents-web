# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # static export to ./out
npm run preview  # serve the exported build
npm run check    # tsc --noEmit
npm run lint     # eslint (eslint-config-next)
```

There is no test suite yet. `npm run build` is the real gate: it typechecks,
and the metadata guards in `src/lib/metadata.ts` throw during prerender, so a
too-long title fails the build rather than shipping.

## What this is

Ground-up rebuild of parentpresents.com — gift guides for adult children (18–30)
shopping for their parents. The mission is helping people show their parents
they matter while it is still easy to. It is an emotional trust brand, not a
generic SEO gift-guide site, and the architecture exists to make a specific set
of measured commercial failures structurally impossible. The constraints below
are load-bearing, not preferences.

**What is live at the domain today** (checked 3 Aug 2026) is a Vite-built SPA —
a swipe-based gift discovery product with wishlists. The legacy guide and
resource content still exists at its original slugs, but it is **client-rendered
only**: every URL returns a byte-identical 6,214-byte shell titled
"ParentPresents - Find the Perfect Gift", and the real title and body appear
only after JS executes.

So the site's search equity — 720k lifetime pageviews across 82 URLs, some
pulling 94% from Google — is being served to crawlers as duplicate empty shells.
The content isn't lost, it's invisible. Prerendering it statically is the
recovery mechanism, and the reason this rebuild is static-first.

This build **replaces** that site at the root, which retires the wishlist
feature — saved user wishlists need an export path before cutover.

## Architecture

Next.js 16 App Router with `output: "export"`. There is no server runtime:
`npm run build` prerenders everything to plain HTML in `./out`, which Cloudflare
Pages serves. Anything requiring a request-time server (route handlers, ISR,
middleware, dynamic `headers()`/`cookies()`) will fail the export — reach for a
build-time solution instead.

Three pieces carry more weight than their size suggests:

- **`src/lib/metadata.ts`** — `pageMetadata()` is how every page declares its
  head. It builds the canonical URL from a root-relative path and **throws** if
  the title exceeds 60 chars or the description 155. Don't hand-roll a
  `metadata` export to dodge those assertions; they exist because a truncated
  title is the kind of defect that ships unnoticed for months. The root layout's
  title `template` is deliberately `"%s"` — a suffix would push page titles past
  the limit the guard enforces.
- **`src/app/globals.css`** — the entire design system, as Tailwind v4 `@theme`
  tokens. See below.
- **`public/_headers` and `public/_redirects`** — the Cloudflare edge behaviour.
  Both contain comments explaining why their rules are shaped as they are; read
  them before editing either.

Components are plain server components in `src/components`. Nothing is a client
component yet, and adding `"use client"` should be a deliberate decision rather
than a reflex — the header's mobile menu is a `<details>` element specifically
so it needs no JS.

Imports use the `@/*` → `./src/*` alias.

## Non-negotiables

- **Canonical domain is `parentpresents.com`** — plural, apex, no `www`, no
  trailing slash. The singular `parentpresent.com` appears in the old WordPress
  export and is wrong.
- **Trailing slashes.** `output: "export"` plus `trailingSlash: false` in
  `next.config.ts`. Both halves are required: the export format is what emits
  `/foo.html` rather than `/foo/index.html`, and that flat file is what makes
  Cloudflare Pages 301 `/foo/` → `/foo` at the edge. The old site split metrics
  across both forms for years.
- **The staging `noindex` in `public/_headers` is host-scoped and permanent.**
  It matches `*.pages.dev` only, so production is unaffected and it does **not**
  get removed at launch. Deleting it exposes staging to indexing; widening it to
  a site-wide rule deindexes production. Either mistake is expensive — leave the
  scoping alone.
- **No merchant links outside `<AffiliateLink />`.** That component doesn't
  exist yet, and until it does there must not be one raw `<a>` to a merchant
  anywhere. Buy controls currently render as inert `aria-disabled` spans.
- **No product renders without `verifiedDate` + `verifiedBy`.** This is the
  structural guard against AI-invented products. The corollary: never put the
  `verified` Chip variant on unverified content — use the `flag` variant, as
  `/gifts-for-moms-birthday` does.
- **Price is a filter, not a taxonomy.** Identity/interest/condition pages drew
  92% of traffic from Google; price-tier pages drew 8–14%. Price URLs in the
  legacy preservation list survive as generated views over the product layer —
  do not author price-tier content.
- **Informational content (`resources/`) is a peer collection, not a blog.** It
  was the best-performing content type on the old site and the least produced.
- **Keep content pages light.** The Astro predecessor shipped 0 bytes of JS;
  moving to Next traded that away for a React bundle, so the budget matters more
  now, not less. Don't add client components or dependencies to content pages
  casually.

## Design system

Derived from the **live ParentPresents identity**, not invented. An earlier spec
prescribed a warm indigo/amber/Fraunces palette; that was rejected as off-brand
once the real identity was measured off the site and the logo. Don't
reintroduce it.

| | |
| --- | --- |
| Rose (primary hue) | `#FF8FA2` |
| Cornflower (secondary hue) | `#5299E0` |
| Ink / muted | `#22222A` / `#6A6A7C` |
| Surfaces | `#FCFCFC` page, `#FFFFFF` card, `#F3F5F7` sunk |
| Type | Inter, one variable face, self-hosted and preloaded |

Tailwind v4 — **no `tailwind.config.js`**. Tokens live in the `@theme` block of
`src/app/globals.css` and generate utilities (`--color-rose` → `bg-rose`,
`text-rose`, `border-rose`).

**Both brand hues are light and fail AA as body text** — rose 2.2:1, blue 2.9:1
against the page. They are fills, strokes and tints only. All type in either
family uses the `-deep` member: `rose-deep` (5.6:1) or `blue-deep` (6.3:1).

There is no second font family. Display voice comes from weight and negative
tracking via the `font-display` and `font-display-sm` utilities.

`src/components/chip.tsx` is the site's **one** signature element — a pill chip
for category labels, price bands and status badges, following the logo's
construction language (uniform rounded strokes, fully rounded ends, two-tone
rose/cornflower). An earlier punched gift-tag motif was removed because it
duplicated an idea the logo already owns: the mark is itself a gift and ribbon.
Don't add a second signature element.

`src/components/image-pending.tsx` stands in for product photos that don't exist
yet. It must read as deliberate, never as a broken image, and must hold the real
image's aspect ratio so the eventual swap costs no layout shift.

## Brand voice

Warm, confident, a bit funny, never saccharine, never sales-y. The reader is an
adult child who loves their parent, doesn't know what to buy, and feels slightly
guilty. Plain verbs, sentence case, active voice. "Save this guide," not
"Submit." The affiliate disclosure is honest and readable, not legal fog.

The mission involves running out of time with your parents. Reference it with
restraint — a clause, not a paragraph. The homepage's "we're not going to be
weird about the mortality thing" is the calibration point.

Every published idea says who it's **wrong** for. A recommendation that fits
everyone fits nobody.

## Current state

Two routes exist: `/` (homepage — mission hero, trust pillars,
identity/interest routing) and `/gifts-for-moms-birthday` (example guide,
`noindex`). The guide's picks are category-level placeholders, its buy controls
are inert, and its email capture is presentation only — **it is not publishable
content**. Most links in the header, footer and chip grids point at routes that
don't exist yet.

Not yet built: the content model (MDX collections, product schema), remaining
templates and on-site search, `<AffiliateLink />` and merchant resolution,
analytics and email capture, schema/sitemaps/OG images, and legacy content
migration.
