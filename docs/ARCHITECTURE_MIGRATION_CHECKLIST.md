# ParentPresents Architecture Migration Checklist

Work required to move ParentPresents from the current legacy static-export
architecture to the Railway/database-backed architecture required by
`/docs/REBUILD_SPEC.md`.

Derived strictly from `/docs/REBUILD_SPEC.md` and the current codebase. Where
the spec does not specify an implementation choice, this document says so rather
than choosing one. See "Decisions the spec does not make".

This is a checklist, not an approval. Items marked **HUMAN** must not be
executed autonomously — see `/docs/AGENT_RULES.md`.

## 1. Current legacy architecture

Verified against the repository as it stands.

| Area | Current state |
| --- | --- |
| Build | `output: "export"` in `next.config.ts` — static HTML to `./out`, no server runtime |
| Routing | `trailingSlash: false`, emitting `/foo.html` for edge redirects |
| Host | Cloudflare Pages, configured by `public/_headers` and `public/_redirects` |
| Data | None. No database, no `src/data/`, no `seed/`, no `.env` |
| Dependencies | `next`, `react`, `react-dom`. Nothing else at runtime |
| Routes | `/` and `/gifts-for-moms-birthday` only |
| Auth | None |
| Middleware | None |
| Images | `images.unoptimized: true` — no request-time optimiser |
| Tests | None. `npm run build` is the gate, via the throw-guards in `src/lib/metadata.ts` |

Static export is the blocking constraint: it supports no database access, no
click logging, no hostname middleware, and no auth-gated routes. Every item in
section 2 depends on removing it.

## 2. Migration steps required by the spec

### 2.1 Leave static export

- [ ] Remove `output: "export"` from `next.config.ts`
- [ ] Re-evaluate `trailingSlash: false` — the current behaviour depends on
      Cloudflare Pages serving flat `.html` files and does not carry to Railway
      as written
- [ ] Re-evaluate `images.unoptimized: true`, which exists only because static
      export has no request-time optimiser
- [ ] Retire `public/_headers` and `public/_redirects`; the spec states there is
      no staging site and no second deployment

### 2.2 Deployment — **HUMAN**

- [ ] **HUMAN** Provision the Railway service and connect the GitHub repository
- [ ] **HUMAN** Configure environment variables and secrets
- [ ] **HUMAN** Point `parentpresents.com` at the Railway service

### 2.3 Database

- [ ] **HUMAN** Provision the database instance
- [ ] Create the four tables exactly as specified: `products`, `posts`,
      `placements`, `clicks`
- [ ] Preserve `placements` as its own table — the spec forbids collapsing
      `blurb` into `products`
- [ ] Seed from `seed/`: `products.json` (3,304), `posts.json` (166),
      `placements.json` (3,429), `redirects.json` (175). **These files are not
      in this repository yet**
- [ ] Seed every post with `status: "draft"`

### 2.4 Routes

- [ ] `/` — home
- [ ] `/[slug]` — post page, matching legacy slugs exactly
- [ ] `/go/[placementId]` — write a `clicks` row, then **302** to
      `affiliate_url`; never 301
- [ ] `/admin` — auth-gated: post and product editing, task queue
- [ ] `/preview/[slug]` — auth-gated preview of a draft
- [ ] Public pages query `where status = 'live'`; admin sees everything
- [ ] Outbound affiliate links carry `rel="nofollow sponsored"` and
      `target="_blank"`
- [ ] Never render `price_at_export`

### 2.5 Authentication — **HUMAN**

- [ ] **HUMAN** Choose and configure the auth mechanism for `/admin` and
      `/preview/[slug]`. The spec requires these routes be auth-gated but
      specifies no mechanism, and `/docs/AGENT_RULES.md` places authentication
      architecture permanently outside autonomous work

### 2.6 Domain redirect — **HUMAN**

The spec calls this the load-bearing requirement.

- [ ] Add `middleware.ts` performing a per-URL 301 from `parentpresent.com` and
      `www.parentpresent.com` to `parentpresents.com`, preserving the path
- [ ] **HUMAN** Point `parentpresent.com` DNS at the same Railway service and
      add it as a second custom domain
- [ ] **HUMAN** Shut down WordPress hosting only after redirects are verified
- [ ] **HUMAN** Keep the `parentpresent.com` registration permanently — it holds
      every backlink the site has earned
- [ ] Never serve both domains the same content simultaneously

### 2.7 SEO infrastructure

- [ ] `sitemap.xml`
- [ ] `robots.txt`
- [ ] A canonical tag on every post pointing at the `parentpresents.com` URL
- [ ] Generate the legacy URL map from `redirects.json`; preserve legacy slugs
      exactly

### 2.8 Content cutover

- [ ] Rebuild in the spec's order: `gifts-for-lawn-lovers`,
      `gifts-for-back-pain`, `gifts-for-farmer-dad`, then the five named next
- [ ] Add one internal link to the matching guide from each of the four
      high-traffic unmonetised posts
- [ ] Do not prioritise the under-$25 / under-$50 guides
- [ ] Verify `stock_status` before any post goes live — Amazon data was last
      synced December 2023
- [ ] Publish a post on the new domain, then redirect its old URL in the same
      sitting

## 3. Decisions the spec does not make

Not decided here, and not to be decided autonomously:

- **Database engine.** The spec's `serial` and `timestamptz` types imply
  PostgreSQL but it never names an engine
- **ORM or query layer.** Not mentioned in the spec
- **Auth provider or mechanism.** Not mentioned in the spec
- **Session and secret storage**
- **Migration tooling**
- **Whether `trailingSlash` behaviour is reproduced on Railway, and how**

## 4. Sequencing note

Sections 2.1 through 2.4 are the prerequisite for everything the rebuild needs
at runtime. Section 2.6 is the highest-value single item — it recovers the
311,977 lifetime search views — but it must not run before content exists on the
new domain, because the spec forbids both domains serving the same content at
once.

## 5. Known gaps

- The `seed/` folder referenced throughout `/docs/REBUILD_SPEC.md` is not
  present in this repository
- No test suite exists; `npm run build` is currently the only automated gate
- `origin/staging` exists as a branch, while the spec states there is no staging
  site and no second deployment
