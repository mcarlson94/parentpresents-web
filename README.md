# ParentPresents

Gift guides for adult children shopping for their parents. Ground-up rebuild of
parentpresents.com, replacing the 2021–2026 WordPress site.

**Status: Phase 0 (foundation).** Design tokens, base layout and the gift-tag
motif exist. Content collections, the product data layer, monetization,
analytics and SEO infrastructure do not yet — see the build phases below.

## Setup

```bash
npm install
npm run dev
```

Dev server runs at http://localhost:4321.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build to `./dist` |
| `npm run preview` | Serve the production build |
| `npm run check` | `astro check` — typecheck `.astro` files |

## Stack

Astro 7 (static output) · TypeScript strict · Tailwind CSS v4 · self-hosted
Fraunces + Karla. Imports use the `@/*` → `./src/*` alias.

## Phases

| | Phase | State |
| --- | --- | --- |
| 0 | Foundation — tokens, layout, visual direction | **done, under review** |
| 1 | Content model — collections, product schema, Keystatic | not started |
| 2 | Templates — guide, resource, hub, seasonal, home; Pagefind | not started |
| 3 | Monetization — `<AffiliateLink />`, merchant resolution, `audit:products` | not started |
| 4 | Capture and measurement — analytics events, Kit, admin dashboard | not started |
| 5 | SEO infrastructure — schema, sitemaps, redirects, OG/Pin images, Lighthouse CI | not started |
| 6 | Migration tooling — WordPress XML → MDX drafts | not started |
| 7 | Documentation — README, `CONTENT-PLAYBOOK.md`, `DECISIONS.md` | not started |

Full docs land in Phase 7. This file is a placeholder until then.
