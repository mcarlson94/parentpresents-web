# CLAUDE.md

Guidance for Claude Code working in this repository. **Phase 0 placeholder** —
the full version, plus `DECISIONS.md` and `CONTENT-PLAYBOOK.md`, is Phase 7.

## Commands

```bash
npm run dev      # dev server on :4321
npm run build    # production build to ./dist
npm run preview  # serve the production build
npm run check    # astro check — typechecks .astro files
```

Astro's own docs: https://docs.astro.build

## What this is

Ground-up rebuild of parentpresents.com — gift guides for adult children
shopping for their parents. The architecture exists to make a specific set of
measured commercial failures structurally impossible, so the constraints below
are load-bearing, not preferences.

**What is actually live today** (checked 3 Aug 2026, and it is *not* the
WordPress site the build spec describes): parentpresents.com serves a Vite-built
SPA — a swipe-based gift discovery product with wishlists. The legacy guide and
resource content still exists at its original slugs, but it is **client-rendered
only**. Every URL, including nonsense ones, returns a byte-identical 6,214-byte
shell titled "ParentPresents - Find the Perfect Gift"; the real title and body
appear only after JS executes.

So the site's search equity — 720k lifetime pageviews across 82 URLs, some
pulling 94% from Google — is being served to crawlers as duplicate empty shells.
This reframes the migration work: the content isn't lost, it's invisible.
Prerendering it statically is the recovery mechanism.

This build **replaces** that site at the root. That retires the wishlist
feature, so any saved user wishlists need an export path before cutover.

## Non-negotiables

- **Canonical domain is `parentpresents.com`** — plural, apex, no `www`, no
  trailing slash. The singular `parentpresent.com` appears in the old WordPress
  export and is wrong.
- **Trailing slashes.** `trailingSlash: "never"` plus `build.format: "file"` in
  `astro.config.mjs`. Both halves are required: the format setting is what makes
  Cloudflare Pages 301 `/foo/` → `/foo` at the edge. The old site split metrics
  across both forms for years.
- **The staging `noindex` in `public/_headers` is host-scoped and permanent.**
  It matches `*.pages.dev` only, so production is unaffected and it does **not**
  get removed at launch. Deleting it exposes staging to indexing; widening it to
  a site-wide rule deindexes production. Either mistake is expensive — leave the
  scoping alone.
- **No merchant links outside `<AffiliateLink />`** (Phase 3). Not one raw `<a>`
  to a merchant, anywhere.
- **No product renders without `verifiedDate` + `verifiedBy`** (Phase 1). This
  is the structural guard against AI-invented products.
- **Price is a filter, not a taxonomy.** Identity/interest/condition pages drew
  92% of traffic from Google; price-tier pages drew 8–14%. The price URLs in the
  legacy preservation list survive as generated views over the product layer —
  do not author price-tier content.
- **Informational content (`resources/`) is a peer collection, not a blog.** It
  was the best-performing content type on the old site and the least produced.
- **Zero JS on content pages.** Currently 0 bytes; budget is 50KB. The header's
  mobile menu is a `<details>` element for exactly this reason. Keystatic pulls
  in React, but only on its own noindex admin route.

## Design system

Derived from the **live ParentPresents identity**, not invented. The build spec
prescribed a warm indigo/amber/Fraunces palette; that was rejected as off-brand
once the real identity was measured off parentpresents.com and the logo. Don't
reintroduce it.

| | |
| --- | --- |
| Rose (primary hue) | `#FF8FA2` |
| Cornflower (secondary hue) | `#5299E0` |
| Ink / muted | `#22222A` / `#6A6A7C` |
| Surfaces | `#FCFCFC` page, `#FFFFFF` card, `#F3F5F7` sunk |
| Type | Inter, one variable face, self-hosted |

Tailwind v4 — **no `tailwind.config.js`**. Tokens live in the `@theme` block of
`src/styles/global.css` and generate utilities (`--color-rose` → `bg-rose`,
`text-rose`, `border-rose`).

**Both brand hues are light and fail AA as body text** — rose 2.2:1, blue 2.9:1
against the page. They are fills, strokes and tints only. All type in either
family uses the `-deep` member: `rose-deep` (5.6:1) or `blue-deep` (6.3:1).
`/styleguide` renders the whole token layer with measured ratios.

There is no second font family. Display voice comes from weight and negative
tracking via the `font-display` and `font-display-sm` utilities.

`src/components/Chip.astro` is the site's **one** signature element — a pill
chip for category labels, price bands and the verified badge, following the
logo's construction language (uniform rounded strokes, fully rounded ends,
two-tone rose/cornflower). An earlier punched gift-tag motif was removed because
it duplicated an idea the logo already owns: the mark is itself a gift and
ribbon. Don't add a second signature element.

`src/components/ImagePending.astro` stands in for product photos that don't
exist yet. It must read as deliberate, never as a broken image, and must hold
the real image's aspect ratio so the eventual swap costs no layout shift.

## Brand voice

Warm, confident, a bit funny, never saccharine, never sales-y. The reader is an
adult child who loves their parent, doesn't know what to buy, and feels slightly
guilty. Plain verbs, sentence case, active voice. "Save this guide," not
"Submit." The affiliate disclosure is honest and readable, not legal fog.

Every published idea says who it's **wrong** for. A recommendation that fits
everyone fits nobody.

## Phase 0 state

Three pages exist: `/` (signpost, not the real homepage — that's Phase 2),
`/styleguide` (noindex token reference), and `/gifts-for-lawn-lovers` (noindex
design proof). The guide page's picks are category-level placeholders and its
"Check price" control is deliberately inert — **it is not publishable content**.
