# ParentPresents — Rebuild Specification

**Status:** foundation shipped, content layer not started.
**Last reviewed:** 13 September 2026.

`CLAUDE.md` is the short, agent-facing compression of this document. Where the
two disagree, this one explains *why* and `CLAUDE.md` states *what* — fix both.

---

## 1. What this is

A ground-up rebuild of parentpresents.com: gift guides for adult children,
roughly 18–30, shopping for their parents.

The mission is helping people show their parents they matter while it is still
easy to. That is a trust proposition, not an SEO one. The site competes against
an endless supply of affiliate listicles that are cheaper to produce and worse
to read; the only durable advantage is being visibly, checkably honest.

The architecture is not neutral. It exists to make a specific set of measured
commercial failures *structurally impossible* rather than merely discouraged.
Every constraint in §5 maps to a failure it prevents. None of them are
preferences.

## 2. The reader

An adult child who loves their parent, has no idea what to buy, and feels
slightly guilty about both facts. They have been burned by gift listicles that
recommend twelve interchangeable things and disclose nothing. They are not
looking for the objectively best product; they are looking for permission to
stop searching.

Three consequences:

- **Every published idea says who it is wrong for.** A recommendation that fits
  everyone fits nobody, and the "skip this if…" line is the single clearest
  signal that a human made a judgement.
- **Fewer picks, longer reasoning.** Six considered ideas beat thirty scraped
  ones. The guide template is built for that ratio.
- **Trust claims go above the fold**, not on an `/about-us` page nobody reads.
  The homepage's how-we-pick pillars are load-bearing conversion copy.

## 3. The diagnosis

What is live at the domain today (checked 3 August 2026) is a Vite-built SPA —
a swipe-based gift discovery product with wishlists. The legacy guide and
resource content still exists at its original slugs, but it is **client-rendered
only**: every URL returns a byte-identical 6,214-byte shell titled
"ParentPresents - Find the Perfect Gift". The real title and body appear only
after JavaScript executes.

So the site's search equity — **720k lifetime pageviews across 82 URLs**, some
pulling 94% of their traffic from Google — is being served to crawlers as
duplicate empty shells. The content is not lost. It is invisible.

Three further measurements shape the plan:

| Measurement | Consequence |
| --- | --- |
| Identity / interest / condition pages drew **92%** of Google traffic; price-tier pages drew **8–14%** | Price is a filter, not a taxonomy (§5) |
| Informational (`resources/`) content was the **best-performing type and the least produced** | It is a peer collection, not a blog (§8) |
| `/foo` and `/foo/` were tracked as separate pages for years | Trailing-slash handling is a non-negotiable, not a detail (§5) |

Prerendering the content statically is the recovery mechanism. That is the whole
reason this rebuild is static-first: the fix for "crawlers see an empty shell"
is HTML in the response body, and everything else follows from it.

## 4. Architecture

Next.js 16 App Router with `output: "export"`, React 19, TypeScript strict,
Tailwind v4, self-hosted Inter. `npm run build` prerenders everything to plain
HTML in `./out`, which Cloudflare Pages serves. Imports use `@/*` → `./src/*`.

**There is no server runtime.** Route handlers, ISR, middleware, and dynamic
`headers()` / `cookies()` all fail the export. Anything that looks like it needs
a request-time server needs a build-time solution instead — generate it, or push
it to the edge config in `public/_headers` / `public/_redirects`.

Four pieces carry more weight than their size suggests:

- **`src/lib/metadata.ts`** — `pageMetadata()` is how every page declares its
  head. It builds the canonical URL from a root-relative path and **throws** if
  the title exceeds 60 characters or the description 155. Because the guards run
  during prerender, a too-long title fails `npm run build` rather than shipping.
  Do not hand-roll a `metadata` export to dodge them. The root layout's title
  `template` is deliberately `"%s"`: a suffix would push page titles past the
  limit the guard enforces.
- **`src/app/globals.css`** — the entire design system as Tailwind v4 `@theme`
  tokens. There is no `tailwind.config.js` and there should not be one.
- **`public/_headers`** — Cloudflare response headers, including the host-scoped
  staging `noindex` (§5.3) and immutable caching for fingerprinted assets.
- **`public/_redirects`** — the canonical-host 301 and, eventually, the
  generated legacy URL map.

Components are plain server components in `src/components`. Nothing is a client
component. The header's mobile menu is a `<details>` element specifically so it
needs no JS. Adding `"use client"` should be a deliberate, justified decision.

`src/lib/cn.ts` is a nine-line class joiner rather than clsx + tailwind-merge,
because nothing here composes conflicting utilities. Reach for a dependency when
the problem actually appears, not in anticipation of it.

### Performance budget

The Astro predecessor shipped 0 bytes of JS. Moving to Next traded that away for
a React bundle, which makes the budget matter *more*, not less. Content pages
should add no client components and no dependencies without a specific reason.
Fonts are preloaded; `ImagePending` and every real image hold their aspect ratio
so nothing contributes CLS.

## 5. Non-negotiables

Each of these prevents a failure that has already cost this site money.

1. **Canonical domain is `parentpresents.com`** — plural, apex, no `www`, no
   trailing slash. The singular `parentpresent.com` appears in the old WordPress
   export and is wrong. If the singular is registered, redirect it at the
   Cloudflare zone level, not in `_redirects`.
2. **Trailing slashes.** `output: "export"` plus `trailingSlash: false`. Both
   halves are required: the export format emits `/foo.html` rather than
   `/foo/index.html`, and that flat file is what makes Cloudflare Pages 301
   `/foo/` → `/foo` at the edge. Do not add trailing-slash rules to
   `_redirects`; they fight the native behaviour.
3. **The staging `noindex` is host-scoped and permanent.** It matches
   `*.pages.dev` only, so production is unaffected and it does **not** get
   removed at launch. Deleting it exposes staging to indexing; widening it to a
   site-wide rule deindexes production. Either mistake is expensive. Verify
   after the first deploy that the header is present on the pages.dev host and
   absent on the apex.
4. **No merchant links outside `<AffiliateLink />`.** That component does not
   exist yet, and until it does there must not be one raw `<a>` to a merchant
   anywhere in the repo. Buy controls currently render as inert `aria-disabled`
   spans.
5. **No product renders without `verifiedDate` + `verifiedBy`.** This is the
   structural guard against AI-invented products — the schema makes an
   unverified product unrenderable rather than merely discouraged. Corollary:
   never put the `verified` Chip variant on unverified content. Use the `flag`
   variant, as `/gifts-for-moms-birthday` does.
6. **Price is a filter, not a taxonomy.** Price URLs in the legacy preservation
   list survive as generated views over the product layer. Do not author
   price-tier content.
7. **`resources/` is a peer collection, not a blog.** It gets the same template
   care, internal linking and sitemap weight as guides.
8. **Keep content pages light.** See the performance budget above.

## 6. Design system

Derived from the **live ParentPresents identity**, measured off the site and the
logo — not invented. An earlier spec prescribed a warm indigo/amber/Fraunces
palette; it was rejected as off-brand once the real identity was measured. Do
not reintroduce it.

| Role | Token | Value |
| --- | --- | --- |
| Primary hue (fill only) | `--color-rose` | `#FF8FA2` — 2.2:1 |
| Secondary hue (fill only) | `--color-blue` | `#5891EB` — 3.1:1 |
| Primary, text-safe | `--color-rose-deep` | `#B5384F` — 5.6:1 |
| Secondary, text-safe | `--color-blue-deep` | `#1F5FA8` — 6.3:1 |
| Body / meta | `--color-ink` / `--color-muted` | `#22222A` / `#6A6A7C` |
| Surfaces | `page` / `surface` / `sunk` / `rule` | `#FCFCFC` / `#FFFFFF` / `#F3F5F7` / `#E4E8EC` |

**Both brand hues fail WCAG AA as body text.** They are fills, strokes and tints
only; all type in either family uses the `-deep` member. This one rule is what
keeps the palette usable, and it is why each family has `-deep` and `-soft`
members rather than a single colour.

There is no second font family. One variable Inter face covers everything;
display voice comes from weight and negative tracking via the `font-display` and
`font-display-sm` utilities. Inter needs the negative tracking at large sizes or
headings read as UI chrome rather than editorial.

`src/components/chip.tsx` is the site's **one** signature element — a pill chip
for category labels, price bands and status badges, following the logo's
construction language: uniform rounded strokes, fully rounded ends, two-tone
rose/cornflower. An earlier punched gift-tag motif was removed because it
duplicated an idea the logo already owns; the mark is itself a gift and ribbon.
Do not add a second signature element.

`src/components/image-pending.tsx` stands in for product photos that do not
exist yet. It must read as deliberate, never as a broken image, and must hold
the real image's aspect ratio so the eventual swap costs no layout shift.

## 7. Brand voice

Warm, confident, a bit funny, never saccharine, never sales-y. Plain verbs,
sentence case, active voice. "Save this guide," not "Submit." The affiliate
disclosure is honest and readable, not legal fog.

The mission involves running out of time with your parents. Reference it with
restraint — a clause, not a paragraph. The homepage's "we're not going to be
weird about the mortality thing" is the calibration point.

Editorial standard for any published pick:

- a specific reason it works, not a spec sheet;
- **who it is wrong for**, stated plainly and without hedging;
- a price band, never a scraped live price;
- `verifiedDate` and `verifiedBy`, or it does not render.

## 8. Content model — to build

Not yet started. The shape it needs to support:

**Collections.** `guides/` (recipient × occasion × interest), `resources/`
(informational — wishes, activities, explainers), and hub pages that route
between them. MDX for prose with typed frontmatter validated at build time, in
the same throw-during-prerender style as `pageMetadata()`.

**Product schema.** The unit of trust. Minimum fields: stable id, name, price
band (not a live price), the fit/skip pair, merchant reference, image, and the
mandatory `verifiedDate` + `verifiedBy`. Validation belongs at build time so an
unverified product cannot reach a page.

**Generated views.** Price-tier URLs from the legacy preservation list are
rendered as filtered views over the product layer, satisfying the old URLs
without creating authored price-tier content (§5.6).

**Templates still needed:** guide, resource, recipient hub, interest hub,
seasonal/occasion, plus on-site search. Search must be build-time-indexed and
cheap; it is the one place a client component is clearly justified.

## 9. Information architecture

Currently shipped: `/` and `/gifts-for-moms-birthday` (example guide,
`noindex`). Everything below is referenced by the header, footer or homepage
chip grids and **does not exist yet** — the footer carries the full taxonomy on
purpose, as the internal-linking backbone and crawl path to every hub.

- **Recipients:** `/mom`, `/dad`, `/grandma`, `/grandpa`, `/in-laws`
- **Interests:** `/gifts-for-lawn-lovers`, `/golf-dad-gifts`,
  `/gifts-for-fishing-dads`, `/gifts-for-puzzle-lovers`, `/cooking-gifts-for-mom`
- **Occasions:** `/occasions` and its children
- **Resources:** `/resources`, `/birthday-wishes-for-mom`,
  `/things-to-do-with-mom-on-her-birthday`, `/funny-birthday-jokes-for-dad`,
  `/gift-vs-present`
- **Trust and legal:** `/about-us`, `/gifting-101`, `/how-we-pick`,
  `/disclosure`, `/privacy`

Slugs for legacy URLs are fixed by the preservation list — they are equity, not
naming decisions. New pages may be named freely.

## 10. Monetization

`<AffiliateLink />` is the only route to a merchant (§5.4). It owns tagging,
`rel`, target behaviour, click instrumentation, and the per-link disclosure
affordance, so that changing any of those is one edit rather than an audit.

Merchant resolution — mapping a product to a live destination per network — is a
build-time concern. The editorial rule stands above the mechanism: **picks are
chosen before payout is checked**, and the site says so in the footer. Do not
introduce anything that makes that claim untrue.

## 11. Measurement and capture

Analytics must be light enough not to blow the JS budget and must capture, at
minimum: guide entry, pick impression, affiliate click by product and merchant,
email capture, and search query. Attribution matters more than volume.

Email capture is presentation-only today. The real implementation needs a
static-export-compatible path — a third-party endpoint posted to directly, since
there is no server route to accept a form.

## 12. Migration and cutover

1. **Export the legacy content** to MDX drafts. Tooling does not exist yet.
2. **Generate the URL map** into `public/_redirects` from
   `src/data/redirects.json`. That section is generated; do not hand-edit it.
3. **Preserve the 82 URLs.** Anything with lifetime traffic either keeps its
   slug or gets a 301. Confirm the 94%-from-Google pages individually.
4. **Export saved wishlists before cutover.** This build replaces the live SPA
   at the root, which retires the wishlist feature. Users with saved wishlists
   need an export path first — this is a blocker on cutover, not a follow-up.
5. **Verify the staging/production `noindex` split** on the first deploy (§5.3).
6. **Cut over,** then watch Search Console for coverage recovery on the
   previously shell-rendered URLs.

## 13. Build phases

Ordered by dependency, not by appeal.

| Phase | Deliverable | Done when |
| --- | --- | --- |
| 0 ✅ | Foundation — tokens, layout, Chip, ImagePending, metadata guards, edge config | Shipped |
| 1 | Content model — MDX collections, product schema, build-time validation | An unverified product fails the build |
| 2 | Templates — guide, resource, hubs, seasonal, search | A guide can be authored without touching TSX |
| 3 | Monetization — `<AffiliateLink />`, merchant resolution | No inert buy control remains |
| 4 | Capture and measurement — analytics events, email | Affiliate clicks attribute to product and merchant |
| 5 | SEO infrastructure — schema, sitemaps, OG images | Every route is in the sitemap with valid structured data |
| 6 | Migration — legacy → MDX, redirect map, wishlist export | All 82 legacy URLs resolve 200 or 301 |

## 14. Quality gates

There is no test suite. **`npm run build` is the real gate**: it typechecks, and
the metadata guards throw during prerender, so a too-long title fails the build
rather than shipping. `npm run check` and `npm run lint` are the fast loop.

Before any content ships:

- [ ] Title ≤ 60, description ≤ 155, built via `pageMetadata()`
- [ ] Canonical URL correct; `noindex` set if the page is not publishable
- [ ] Every pick carries `verifiedDate` + `verifiedBy`
- [ ] Every pick says who it is wrong for
- [ ] No raw merchant `<a>`; no `verified` Chip on unverified content
- [ ] No new client component or dependency on a content page
- [ ] All type in a brand hue uses the `-deep` member

## 15. Open questions

Decisions not yet made, each blocking the phase it sits in:

- Email platform and its static-compatible endpoint (phase 4).
- Analytics vendor, weighed against the JS budget (phase 4).
- Affiliate networks and merchant coverage (phase 3).
- Search implementation — build-time index format and client bundle size (phase 2).
- Whether `parentpresent.com` is registered, and by whom (phase 6).
- Wishlist export mechanism and the user notice that precedes cutover (phase 6).
- Launch date, and whether migration ships before or alongside new content.
