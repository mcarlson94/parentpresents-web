# ParentPresents

Gift guides for adult children shopping for their parents. Ground-up rebuild of
parentpresents.com.

**Status: foundation.** Design tokens, root layout, shared components and two
example pages exist. The content model, product data layer, monetization,
analytics and SEO infrastructure do not yet.

## Setup

```bash
npm install
npm run dev
```

Dev server runs at http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Static export to `./out` |
| `npm run preview` | Serve the exported build |
| `npm run check` | `tsc --noEmit` — typecheck |
| `npm run lint` | ESLint (`eslint-config-next`) |

## Stack

Next.js 16 App Router, `output: "export"` · React 19 · TypeScript strict ·
Tailwind CSS v4 · self-hosted Inter. Imports use the `@/*` → `./src/*` alias.

Static export means there is no server runtime: `npm run build` emits plain HTML
to `./out`, which is what Cloudflare Pages serves. `trailingSlash: false` makes
it emit `/foo.html` rather than `/foo/index.html` — that is what lets Cloudflare
301 `/foo/` → `/foo` at the edge.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Homepage — mission hero, trust pillars, recipient/interest routing |
| `/gifts-for-moms-birthday` | Example guide. `noindex` — placeholder picks, inert buy controls |

## Next up

1. Content model — MDX collections, product schema with `verifiedDate` / `verifiedBy`
2. Templates — guide, resource, hub, seasonal; on-site search
3. Monetization — `<AffiliateLink />`, merchant resolution, product audit
4. Capture and measurement — analytics events, email capture
5. SEO infrastructure — schema, sitemaps, redirects, OG images
6. Migration tooling — legacy content → MDX drafts
