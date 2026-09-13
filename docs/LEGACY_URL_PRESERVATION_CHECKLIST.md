# Legacy URL Preservation Checklist

Derived strictly from `/docs/REBUILD_SPEC.md` and the state of this repository
at the time of writing. This document is a checklist, not an implementation. It
introduces no infrastructure the spec does not already specify, and it does not
decide anything the spec leaves open.

`/docs/REBUILD_SPEC.md` is authoritative. Where this checklist and the spec
disagree, the spec wins.

**Why this matters.** The old URLs carry 311,977 lifetime search views. The spec
calls preserving them "the single highest-value constraint on this project."
Lifetime views were 1,485,171, of which Instagram sent 752,886 — that traffic
does not recur. Search traffic does. Everything below protects the part that
recurs.

---

## 1. Old domain → new domain redirect

The requirement, verbatim in intent from the spec:

- `parentpresent.com` (singular, the old domain) must **301** to
  `parentpresents.com` (plural).
- The redirect is **per-URL** and **preserves the path**. Not a blanket redirect
  to the homepage.
- It is handled **in the Next.js app**, not on the old WordPress host.

The spec's sequence:

1. Point `parentpresent.com` DNS at the same Railway service. Add it as a second
   custom domain.
2. In `middleware.ts`, check the hostname. If it is `parentpresent.com` or
   `www.parentpresent.com`, 301 to `https://parentpresents.com` + the same
   pathname.
3. WordPress hosting can then be shut off entirely.

- [ ] **Keep the `parentpresent.com` registration forever.** The spec is
      explicit: it holds every backlink the site has ever earned. Letting it
      lapse discards the asset this entire checklist exists to protect.
- [ ] DNS change and custom-domain addition are **HUMAN** actions.
      `/docs/AGENT_RULES.md` forbids autonomous DNS or domain-configuration
      changes, and forbids shutting down the old WordPress host.

## 2. Preserve legacy paths exactly

- [ ] `/[slug]` must match the legacy slugs **exactly**. Slugs are equity, not
      naming decisions.
- [ ] Never change a legacy URL because another URL looks cleaner
      (`/docs/AGENT_RULES.md`).
- [ ] Never remove a legacy redirect once it exists.
- [ ] Trailing-slash behaviour must resolve legacy paths consistently. The old
      site tracked `/birthday-wishes-for-mom` and `/birthday-wishes-for-mom/`
      as separate pages for years. One canonical form must win, and it must not
      404 the other. See the blocker in §7 — the current mechanism does not
      survive the move off Cloudflare Pages.

## 3. Never serve duplicate content on both domains

- [ ] Never have both domains serving the same content at once. Two owned sites
      with identical posts means Google picks one, and it will usually pick the
      **older** domain — the new site then loses to its own archive.
- [ ] Publish a post on the new domain, then redirect its old URL **in the same
      sitting**. Per-post, not batched at the end.
- [ ] `/docs/AGENT_RULES.md` restates this as a hard rule: the two domains must
      never independently serve duplicate content.

## 4. Sitemap, robots.txt, canonical

The spec requires all three:

- [ ] `sitemap.xml`
- [ ] `robots.txt`
- [ ] A canonical tag on **every** post pointing at the `parentpresents.com` URL

Current state, verified against the working tree:

| Requirement | State |
|---|---|
| `sitemap.xml` | **Absent.** No sitemap file or route anywhere in the repository. |
| `robots.txt` | **Absent.** No robots file or route anywhere in the repository. |
| Canonical tags | **Mechanism exists.** `pageMetadata()` in `src/lib/metadata.ts` emits `alternates.canonical` against `SITE_URL = "https://parentpresents.com"`, and both existing routes use it. It is not yet applied across legacy posts, because they do not exist as routes yet. |

- [ ] Only `status = 'live'` posts belong in `sitemap.xml`. Public pages query
      `where status = 'live'`; a sitemap listing drafts advertises URLs that do
      not publicly exist.
- [ ] `/go/[placementId]` must not be crawlable as content. The spec marks
      outbound links `rel="nofollow sponsored"` and `target="_blank"`, and the
      route is a 302 by design so click recording keeps working.

## 5. Highest-priority legacy URLs

From the spec's rebuild order, ranked by **search** traffic, not total views.

### First three — search traffic and fully monetised

| Slug | Google views | % search | Products |
|---|---:|---:|---:|
| `gifts-for-lawn-lovers` | 11,288 | 89.7% | 50 |
| `gifts-for-back-pain` | 7,391 | 71.5% | 50 |
| `gifts-for-farmer-dad` | 5,565 | 87.0% | 50 |

### Then

- `gamer-dad-gifts`
- `gifts-for-puzzle-lovers`
- `beach-lover-gifts`
- `gifts-for-fishing-dads`
- `pickleball-gifts-for-dad`

### High-traffic posts with no products

| Slug | Google views |
|---|---:|
| `birthday-wishes-for-mom` | 33,706 |
| `things-to-do-with-mom-on-her-birthday` | 33,390 |
| `funny-birthday-jokes-for-dad` | 26,608 |
| `funny-birthday-jokes-for-mom` | 8,022 |

These four account for **101,726 search views** with near-zero monetisation.
The spec is explicit that they do **not** need to become gift guides — each
needs one internal link to the matching gift guide. Four edits.

### Do not prioritise

- [ ] The under-$25 / under-$50 guides. They rank high on **total** views but
      draw only 8–11% of that traffic from search; the rest came from Instagram
      and is spent.

## 6. Automated checks vs. human review

### Can be automated

- [ ] Every slug in the redirect map resolves to a live route on
      `parentpresents.com`, or to a deliberate destination — no 404s.
- [ ] Old-domain requests return **301**, not 302, and land on the same
      pathname on the new domain.
- [ ] `/go/[placementId]` returns **302**, not 301. A 301 gets cached by the
      browser and click recording silently stops.
- [ ] Every live post emits exactly one canonical tag, absolute, on
      `https://parentpresents.com`.
- [ ] No live page is `noindex`.
- [ ] `sitemap.xml` parses, contains only `status = 'live'` URLs, and every
      entry returns 200.
- [ ] `robots.txt` exists and does not disallow the post routes.
- [ ] No redirect chains or loops — old URL reaches its destination in one hop.
- [ ] Trailing-slash variants resolve consistently rather than 404ing.
- [ ] No raw `<a>` to a merchant anywhere; affiliate links route through
      `/go/[placementId]`.
- [ ] No cached price is rendered anywhere.

### Requires a human — do not do autonomously

Each of these is forbidden to autonomous runs by `/docs/AGENT_RULES.md`.

- [ ] **HUMAN** — DNS changes and adding `parentpresent.com` as a second custom
      domain on Railway.
- [ ] **HUMAN** — Shutting down the old WordPress host. Order matters: the new
      domain must be serving and the old URLs redirecting first.
- [ ] **HUMAN** — Confirming the old domain registration is renewed and will not
      lapse.
- [ ] **HUMAN** — Approving the cutover moment itself, given the duplicate-content
      rule in §3.
- [ ] **HUMAN** — Verifying `stock_status` before any post goes live. Amazon data
      was last synced December 2023; on a 50-product guide expect a meaningful
      share of dead or out-of-stock ASINs. Publishing 50 links where a dozen are
      broken is worse than publishing nothing.
- [ ] **HUMAN** — Deciding the destination for any legacy URL that has no
      equivalent on the new site.
- [ ] **HUMAN** — Search Console: verifying the new domain, submitting the
      sitemap, and monitoring the post-cutover index. The spec does not specify
      tooling here; this item is listed because the work is real, not because
      the spec mandates a particular product.

## 7. What is currently missing and blocks cutover

Verified against the working tree, not assumed.

1. **`middleware.ts` does not exist.** No file matching `middleware.*` exists
   anywhere in the repository. The spec's load-bearing redirect is entirely
   unimplemented.

2. **`output: "export"` in `next.config.ts` makes the redirect impossible as
   specified.** A static export has no server runtime, so middleware never runs.
   This is the structural blocker beneath every other item here: the redirect,
   `/go/[placementId]` click logging, the auth-gated `/admin` and
   `/preview/[slug]` routes, and any database access all require a runtime the
   current build target does not have. `CLAUDE.md` already flags this as legacy.

3. **The `seed/` folder is absent**, and with it `redirects.json` — the spec's
   175-row old-path → new-path map, ordered by search value. That file *is* the
   legacy URL map. Without it there is nothing to verify redirects against.
   `products.json`, `posts.json` and `placements.json` are absent too. Already
   recorded in `/docs/SEED_DATA_READINESS_CHECKLIST.md`.

4. **No `sitemap.xml` and no `robots.txt`** — both required by the spec, neither
   present in any form.

5. **Only two routes exist:** `/` and `/gifts-for-moms-birthday`. None of the
   166 legacy post slugs are implemented. The one guide route is a `noindex`
   placeholder with inert buy controls and is not publishable content.

6. **`public/_redirects` does not satisfy the requirement and conflicts with
   it.** It contains one rule — `www.parentpresents.com` → apex. For the old
   domain it says the singular `parentpresent.com` "should be pointed here too,
   via a Cloudflare redirect rule at the zone level rather than this file,"
   which contradicts the spec's requirement that the redirect live in the
   Next.js app. It also refers to generating the legacy URL map from
   `src/data/redirects.json`, a path that does not exist. As Cloudflare Pages
   edge config it does not carry over to Railway at all.

7. **Trailing-slash handling does not survive the move.** It currently depends
   on `output: "export"` emitting `/foo.html` and Cloudflare Pages 301ing
   `/foo/` → `/foo` natively at the edge. Both halves are Cloudflare-specific.
   On Railway this needs an explicit decision. `next.config.ts` documents the
   dependency in its own comments.

8. **`public/_headers` encodes a staging deployment the spec says does not
   exist.** It host-scopes a `noindex` header to `*.pages.dev`. The spec states
   there is no staging site and no second deployment. Superseded, but noted
   because deleting it carelessly during migration is exactly the kind of change
   that deindexes something real.

### Smaller items, flagged rather than changed

- `src/lib/metadata.ts:5` describes the singular `parentpresent.com` as "wrong."
  Under the spec it is not wrong — it is the old domain, and it is load-bearing.
  `CLAUDE.md` already lists this among the legacy conflicts. Code change, so out
  of scope here.
- `/gifts-for-moms-birthday` does not appear anywhere in the spec's rebuild
  order. Whether it is a real legacy slug or a new example route is undetermined
  from the repository. If it **is** a legacy slug it currently occupies that path
  as a `noindex` placeholder; if it is **not**, it is a new URL outside the
  legacy set. **HUMAN** decision — check it against `redirects.json` when the
  seed data lands.
- The spec's illustrative middleware snippet matches with
  `url.hostname.endsWith('parentpresent.com')`. That correctly excludes
  `parentpresents.com`, but it would also match any other hostname ending in
  that string. Worth an explicit check at implementation time; the spec presents
  the snippet as illustration, so this is a verification note, not a correction.

---

## Cutover order

Assembled from the spec's own sequencing. Every step is gated on the one above.

1. Seed data present and imported; `redirects.json` available as the URL map.
2. Server runtime in place — `output: "export"` removed — so middleware can run.
3. Legacy post routes exist at exact legacy slugs, with canonicals.
4. `stock_status` verified for the post being published. **HUMAN.**
5. Post goes `live` on `parentpresents.com`.
6. Its old URL redirects, **in the same sitting** — never both serving at once.
7. `sitemap.xml` and `robots.txt` in place and correct.
8. DNS cutover for `parentpresent.com`. **HUMAN.**
9. WordPress host shut off. **HUMAN**, and only after 1–8 hold.
10. Old domain registration kept, indefinitely. **HUMAN.**
