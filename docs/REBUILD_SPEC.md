# Parent Presents — Rebuild Spec

Hand this file to Claude Code along with the `seed/` folder. It describes the data model, the routes, and the redirect requirement. Everything here is derived from the old WordPress export and the GA4 all-time report (2021-07-03 to 2026-07-30).

---

## Context

- Old site: WordPress on `[www.parentpresent.com](https://www.parentpresent.com)` (singular). 166 published posts, 9 published pages, ~7,100 affiliate links managed by the Lasso plugin.
- New site: `parentpresents.com`, Next.js, GitHub → Railway.
- This is a relaunch, not a fresh build. The old URLs carry 311,977 lifetime search views. Preserving them is the single highest-value constraint on this project.

---

## Seed data

| File | Rows | What it is |
|---|---:|---|
| `products.json` | 3,304 | Every product used on a live post |
| `posts.json` | 166 | Every published post, intro text, section headings, traffic |
| `placements.json` | 3,429 | Product-on-post, with the exact blurb for that post |
| `redirects.json` | 175 | Old path → new path, ordered by search value |

All posts seed with `status: "draft"`. Nothing is public until it is reviewed.

---

## Data model

Three tables. The third is the one that matters.

```text
products
  id                text primary key        -- "p_14166"
  name              text not null
  network           text                    -- amazon | other
  asin              text
  affiliate_url     text not null
  image_url         text
  price_at_export   text                    -- historical, do not display
  last_synced       timestamptz
  stock_status      text default 'unverified'  -- in_stock | oos | dead | unverified
  commission_rate   numeric

posts
  slug              text primary key
  title             text not null
  status            text default 'draft'    -- draft | in_review | live
  intro             text
  published_at      date
  legacy_url        text

placements
  id                serial primary key
  post_slug         text references posts(slug)
  product_id        text references products(id)
  position          int not null
  blurb             text not null           -- copy for THIS product on THIS post
  unique (post_slug, product_id)

clicks
  id                serial primary key
  placement_id      int references placements(id)
  occurred_at       timestamptz default now()
  referrer          text
  user_agent        text
```

placements is why a product can appear on six guides with six different write-ups, and why click attribution can say which post produced a sale. Do not collapse the blurb into products.

Product price is stored but must not be rendered. Amazon's operating agreement prohibits displaying a cached price. Show the button, not the number.

## Routes

```text
/                          home
/[slug]                    post page — must match legacy slugs exactly
/go/[placementId]          affiliate redirect: log click, then 302 to affiliate_url
/admin                     auth-gated: post + product editing, task queue
/preview/[slug]            auth-gated preview of a draft
```

Public pages query where status = 'live'. Admin sees everything. There is no staging site and no second deployment.

### /go/[placementId]

Every affiliate link on the site routes through this. It writes a clicks row and then redirects. This is the only way to know which post drove a click — Amazon's own reporting will not tell you.

Use a 302, not a 301, or browsers will cache it and you will stop recording clicks.

Mark the outbound link rel="nofollow sponsored" and target="_blank".

## Redirects — the load-bearing requirement

parentpresent.com (singular, the old domain) must 301 to parentpresents.com (plural) on a per-URL basis, preserving the path.

Do this in the Next.js app, not on the old WordPress host:

1. Point parentpresent.com DNS at the same Railway service. Add it as a second custom domain.
2. In middleware.ts, check the hostname. If it is parentpresent.com or [www.parentpresent.com](https://www.parentpresent.com), 301 to https://parentpresents.com + the same pathname.
3. WordPress hosting can then be shut off entirely. Keep the domain registration forever — it holds every backlink the site has ever earned.

```ts
// middleware.ts
export function middleware(req: Request) {
  const url = new URL(req.url);

  if (url.hostname.endsWith('parentpresent.com')) {
    url.hostname = 'parentpresents.com';
    return Response.redirect(url.toString(), 301);
  }
}
```

Never have both domains serving the same content at once. Two sites you own with identical posts means Google picks one, and it will usually pick the older domain. The new site then loses to its own archive.

Publish a post on the new domain, then redirect its old URL in the same sitting.

Also required:

- sitemap.xml
- robots.txt
- a canonical tag on every post pointing at the parentpresents.com URL

## Rebuild order

Ranked by search traffic, because Instagram sent 752,886 of 1,485,171 lifetime views and that traffic does not recur. Google sent 311,977 and does.

### First three — search traffic and fully monetised

| Slug | Google views | % search | Products |
|---|---:|---:|---:|
| gifts-for-lawn-lovers | 11,288 | 89.7% | 50 |
| gifts-for-back-pain | 7,391 | 71.5% | 50 |
| gifts-for-farmer-dad | 5,565 | 87.0% | 50 |

Then:

- gamer-dad-gifts
- gifts-for-puzzle-lovers
- beach-lover-gifts
- gifts-for-fishing-dads
- pickleball-gifts-for-dad

### High-traffic posts with no products

- birthday-wishes-for-mom — 33,706 Google views
- things-to-do-with-mom-on-her-birthday — 33,390 Google views
- funny-birthday-jokes-for-dad — 26,608 Google views
- funny-birthday-jokes-for-mom — 8,022 Google views

These four posts account for 101,726 search views with near-zero monetisation.

These do not need to become gift guides. Each needs one internal link to the matching gift guide. Four edits.

### Do not prioritise

Do not prioritise the under-$25 / under-$50 guides.

They rank high on total views but draw only 8–11% of that traffic from search. That traffic came primarily from Instagram and is spent.

## Before publishing any rebuilt post

Amazon product data was last synced in December 2023.

On a 50-product guide, expect a meaningful share of dead or out-of-stock ASINs.

Verify against the Amazon Product Advertising API, or check manually, and set stock_status before a post goes live.

Publishing 50 links where a dozen are broken is worse than publishing nothing.
