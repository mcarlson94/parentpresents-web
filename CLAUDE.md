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
shopping for their parents. It replaces a WordPress site that did 1.49M
pageviews and failed commercially in specific, measured ways. The architecture
exists to make those failure modes structurally impossible, so the constraints
below are load-bearing, not preferences.

## Non-negotiables

- **Canonical domain is `parentpresents.com`** — plural, apex, no `www`, no
  trailing slash. The singular `parentpresent.com` appears in the old WordPress
  export and is wrong.
- **Trailing slashes.** `trailingSlash: "never"` plus `build.format: "file"` in
  `astro.config.mjs`. Both halves are required: the format setting is what makes
  Cloudflare Pages 301 `/foo/` → `/foo` at the edge. The old site split metrics
  across both forms for years.
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

Tailwind v4 — **no `tailwind.config.js`**. Tokens live in the `@theme` block of
`src/styles/global.css` and generate utilities (`--color-indigo` → `bg-indigo`,
`text-indigo`, `border-indigo`).

Contrast is measured, not eyeballed. Two tokens fail AA as body text and are
**fill-only**: `amber` (2.1:1) and `sage` (3.3:1). For type in those families
use `amber-deep` (5.7:1) or `sage-deep` (6.1:1). `/styleguide` renders the whole
token layer with ratios.

Display type uses Fraunces' `opsz`, `SOFT` and `WONK` axes via the `font-display`
and `font-display-sm` utilities — don't apply `font-family` directly or you lose
the axis settings that make the brand voice.

`src/components/Tag.astro` is the site's **one** signature element: a punched-hole
gift tag, pure CSS, used for category labels, price bands and the verified badge.
Don't add a second signature element and don't extend the tag to a fourth use.

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
