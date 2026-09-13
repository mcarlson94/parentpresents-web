# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Source of truth

**`docs/REBUILD_SPEC.md` is the authoritative product and architecture
specification for ParentPresents.** It defines the data model, the routes, and
the redirect requirement, and it is derived from the old WordPress export and
the GA4 all-time report.

If this file, the existing application code, or any other documentation
conflicts with `docs/REBUILD_SPEC.md`, **follow the spec and flag the conflict
explicitly** in your response rather than silently reconciling it.

`docs/CURRENT_CODEBASE_NOTES.md` describes the code as it stands today. It is
observation, not product intent, and it predates the spec — do not treat it as
authoritative.

`docs/TASK_QUEUE.md` defines the Phase A autonomous task queue. GitHub Issues in
`mcarlson94/parentpresents-web` are authoritative for live task status; the
repository remains authoritative for product, architecture, and operating rules.

**The code currently in this repository is a legacy implementation, not product
intent.** Where it conflicts with the spec (see "Legacy implementation" below),
it is superseded. Do not extend it along its existing lines, and do not change
application code without being asked.

## What this is

ParentPresents is returning to its original premise: **content-led gift guides,
SEO, and affiliate commerce.** This is a relaunch of an existing site, not a
fresh build.

The old site was WordPress on `parentpresent.com` (singular): 166 published
posts, 9 published pages, and roughly 7,100 affiliate links managed by the Lasso
plugin. Those URLs carry 311,977 lifetime search views. Per the spec,
**preserving them is the single highest-value constraint on this project.**

Lifetime traffic was 1,485,171 views, of which Instagram sent 752,886 and Google
sent 311,977. Instagram traffic does not recur; search traffic does. That is why
the rebuild order in the spec is ranked by search traffic, not total views.

**The wishlist feature is retired.** It is not part of the rebuild and should
receive no further development.

## Target architecture

Per `docs/REBUILD_SPEC.md`. Read the spec for the authoritative detail; this is
orientation only.

**Next.js on Railway**, deployed from GitHub. This replaces the static
Cloudflare Pages export the current code targets.

**Database-backed**, with four tables — `products`, `posts`, `placements`, and
`clicks`. `placements` is the one that matters: it holds the blurb for a given
product on a given post, which is what lets one product appear on several guides
with different write-ups and what makes click attribution per-post possible. The
spec is explicit that the blurb must not be collapsed into `products`.

Routes, all defined in the spec:

- `/` — home
- `/[slug]` — post page; must match legacy slugs exactly
- `/go/[placementId]` — affiliate redirect: log the click, then **302** to
  `affiliate_url`
- `/admin` — **auth-gated**: post + product editing, task queue
- `/preview/[slug]` — **auth-gated** preview of a draft

Public pages query `where status = 'live'`. Admin sees everything. There is no
staging site and no second deployment.

## Non-negotiables

All of these come from `docs/REBUILD_SPEC.md`.

- **Legacy SEO equity and exact legacy slugs are preserved.** `/[slug]` must
  match the legacy slugs exactly. Slugs are equity, not naming decisions.
- **`parentpresent.com` must ultimately 301 to `parentpresents.com`**, per-URL
  and preserving the path, handled in the Next.js app as the spec describes —
  not on the old WordPress host. Keep the old domain registration forever; it
  holds every backlink the site has earned.
- **Never have both domains serving the same content at once.** Publish a post
  on the new domain, then redirect its old URL in the same sitting.
- **`/go/[placementId]` uses a 302, not a 301.** A 301 gets cached by browsers
  and click recording stops. Outbound links are marked
  `rel="nofollow sponsored"` and `target="_blank"`. This route is the only way
  to know which post drove a click.
- **Price is stored but never rendered.** Amazon's operating agreement prohibits
  displaying a cached price. Show the button, not the number.
- **Everything seeds as `status: "draft"`.** Nothing is public until it is
  reviewed.
- **Verify `stock_status` before a post goes live.** Amazon product data was
  last synced in December 2023, so expect dead or out-of-stock ASINs on a
  50-product guide. Publishing 50 links where a dozen are broken is worse than
  publishing nothing.
- **Do not prioritise the under-$25 / under-$50 guides.** They rank high on
  total views but draw only 8–11% of that traffic from search; the rest came
  from Instagram and is spent.
- **Also required by the spec:** `sitemap.xml`, `robots.txt`, and a canonical
  tag on every post pointing at the `parentpresents.com` URL.

## Legacy implementation

The code in this repository targets a static Cloudflare Pages export. The spec
supersedes it. These are the specific conflicts — treat each as legacy, and flag
it if a task would build on it:

- **`output: "export"` with no server runtime** (`next.config.ts`) cannot support
  the spec's middleware, database, `/go/[placementId]` logging, or auth-gated
  routes.
- **Cloudflare edge config** — `public/_headers` and `public/_redirects`,
  including the host-scoped `*.pages.dev` staging `noindex`. The spec states
  there is no staging site and no second deployment.
- **Trailing-slash handling via flat-file export** depends on Cloudflare Pages
  serving `/foo.html`; it does not carry over to Railway as written.
- **`parentpresent.com` is described as "wrong"** in the current text. Under the
  spec it is the old domain, and it is load-bearing: it must redirect per-URL and
  its registration must be kept.
- **`verifiedDate` / `verifiedBy`** is not the spec's model. The spec gates
  publication on `status` and `stock_status` instead.
- **`<AffiliateLink />`** does not exist, and the spec does not specify a
  component. What the spec specifies is that affiliate links route through
  `/go/[placementId]`. Until that route exists, there must still be no raw `<a>`
  to a merchant anywhere.
- **Traffic figures in the old text** (720k pageviews across 82 URLs, 94% from
  Google, 92% / 8–14% by page type) predate the GA4 all-time report the spec is
  built on. Use the spec's figures.

Current routes in the repo are `/` and `/gifts-for-moms-birthday` (an example
guide, `noindex`, with placeholder picks and inert buy controls). It is not
publishable content. Most links in the header, footer and chip grids point at
routes that do not exist.

## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # static export to ./out
npm run preview  # serve the exported build
npm run check    # tsc --noEmit
npm run lint     # eslint (eslint-config-next)
```

These describe the current legacy build, which still produces a static export.
There is no test suite. `npm run build` typechecks, and the metadata guards in
`src/lib/metadata.ts` throw during prerender, so a too-long title fails the
build rather than shipping.

## Design system

Not covered by `docs/REBUILD_SPEC.md`. It is derived from the **live
ParentPresents identity** and is implemented in `src/app/globals.css`; it
carries over unless the spec is extended to say otherwise. An earlier proposal
prescribed a warm indigo/amber/Fraunces palette; that was rejected as off-brand
once the real identity was measured off the site and the logo. Don't reintroduce
it.

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

Not covered by `docs/REBUILD_SPEC.md`; it carries over unless the spec is
extended to say otherwise.

Warm, confident, a bit funny, never saccharine, never sales-y. The reader is an
adult child who loves their parent, doesn't know what to buy, and feels slightly
guilty. Plain verbs, sentence case, active voice. "Save this guide," not
"Submit." The affiliate disclosure is honest and readable, not legal fog.

The mission involves running out of time with your parents. Reference it with
restraint — a clause, not a paragraph. The homepage's "we're not going to be
weird about the mortality thing" is the calibration point.

Every published idea says who it's **wrong** for. A recommendation that fits
everyone fits nobody.
