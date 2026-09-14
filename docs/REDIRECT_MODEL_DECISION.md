# Redirect Model Decision

How the legacy redirect map is represented in the rebuilt application, and where
the 9 legacy WordPress pages point.

Derived strictly from `/docs/REBUILD_SPEC.md` and the state of this repository at
the time of writing. This is a decision record and a recommendation. It changes
no application code, and the recommendation requires human sign-off before
implementation.

`/docs/REBUILD_SPEC.md` is authoritative. Where this document and the spec
disagree, the spec wins.

**Nothing here asserts anything about the contents of `seed/redirects.json`.**
That file is not in this repository — verified, not assumed. Every figure below
comes from the spec's own text. Where a conclusion would require reading the
file, it is marked **HUMAN** instead of guessed.

---

## 1. There are two redirects, not one

This is the distinction the rest of the document turns on, and the spec's
example covers only the first of the two.

| | **Host-level** | **Path-level** |
|---|---|---|
| What it does | `parentpresent.com/x` → `parentpresents.com/x` | `parentpresents.com/old` → `parentpresents.com/new` |
| Changes | The hostname. Path is preserved. | The path. |
| Data needed | **None.** It is a rule. | A map. The spec's `redirects.json`, 175 rows. |
| Spec coverage | The `middleware.ts` snippet in "Redirects — the load-bearing requirement" | `redirects.json` is listed as seed data. No mechanism is specified. |
| Rows | 0 | 175 (per the spec's seed-data table) |

The host-level redirect is **not a data-modelling question at all.** It is four
lines of logic with no rows behind it, and the spec already shows the code. It
needs no table, no JSON file, and no decision — only a server runtime to run in.

Everything below is about the **path-level** map. That is the part with no
defined home: the spec's data model defines only `products`, `posts`,
`placements` and `clicks`, and `redirects.json` fits none of them.

### They must compose into one hop

A request for `http://www.parentpresent.com/old-path` may need **both** — a host
change and a path change. Applying them as two sequential redirects produces a
chain:

```text
www.parentpresent.com/old-path
  → 301 parentpresents.com/old-path     (host rule)
  → 301 parentpresents.com/new-path     (path rule)
```

Two hops. `/docs/LEGACY_URL_PRESERVATION_CHECKLIST.md` §6 already lists "no
redirect chains or loops — old URL reaches its destination in one hop" as an
automated check, and this is the exact way that check gets violated.

Whatever model is chosen must resolve host **and** path together and emit a
single `Location`. In practice that means: look the path up in the map first,
then set the hostname on the result, then redirect once.

That requirement is what makes a single mechanism owning both cases preferable
to two mechanisms at different layers.

---

## 2. How many path-level rows are actually needed

The spec states that `/[slug]` "must match the legacy slugs exactly." If a
legacy slug is preserved exactly, then for that post old path and new path are
identical and **no redirect row is needed** — the URL simply resolves.

So the 175 rows cannot all be post slug changes. Consistent with that, the spec
describes `redirects.json` as "Old path → new path, ordered by search value,"
which is a shape that admits identity rows, category and tag archives, paginated
archives, feed URLs, attachment URLs, and the 9 pages — none of which the spec's
routes cover.

**This is not resolvable from the repository.** What the 175 rows contain is a
question about a file that is absent. It is listed as **HUMAN** in §6.

One arithmetic observation, offered as a lead and not as a finding: the spec's
context section gives **166 published posts and 9 published pages**, and
166 + 9 = 175, the exact row count given for `redirects.json`. That is
suggestive, not evidence. It is equally consistent with coincidence. **HUMAN** —
confirm against the actual file before anyone designs around it.

The practical consequence for this decision is small and worth stating plainly:
**the model must work whether the map holds 175 rows or 12.** All three options
below do. Row count is not a discriminator here, which is why it does not appear
in the comparison table.

---

## 3. The options

### Option A — a fifth `redirects` table in the database

A `redirects` table alongside `products`, `posts`, `placements` and `clicks`,
queried at request time.

**A runtime caveat, stated carefully.** Next.js middleware runs in the Edge
Runtime by default, and the Edge Runtime cannot open the raw TCP socket a
Postgres client needs. This repository is on Next 16 (`next: ^16.2.12`,
verified in `package.json`), where a Node.js runtime for middleware is
available, so this is **not** the hard blocker it would have been on older
versions. It is still a configuration decision that has to be made deliberately
and verified against the installed version at implementation time — **HUMAN**,
or at minimum an explicit check rather than an assumption.

The per-request cost is the more durable objection. A database round trip on
every request — including the overwhelming majority that are not legacy URLs —
to consult a table that changes almost never. The obvious fix is to cache the
table in module memory and query only on miss, and note what that reduces to: an
in-memory map consulted per request, which is Option C with a database as the
source of truth instead of a file.

The decisive problem is simply that it is **blocked**. No database exists yet.
Issue #17 (schema and seed import) and #15 (Railway server runtime) are both
`status:BACKLOG`, and #15 is `risk:HIGH` with `needs-human`. Option A cannot be
built until both land.

It has the decisive long-term advantage: it is the only option where `/admin`
can add a redirect without a deploy.

### Option B — build-time generated `redirects` in `next.config.ts`

Generate Next's `async redirects()` config from the seed file at build time and
let the framework's routing layer match.

Fair to it: this handles the host-level case too, via
`has: [{ type: 'host', value: '...' }]`, so it is not limited to paths. Matching
happens in the framework ahead of routing and costs nothing we own. 175 entries
is far below any size where this becomes a concern.

Two real problems.

**First, the status code.** `permanent: true` in `next.config.ts` emits **308**,
not 301. The spec says 301. Search engines treat 308 as equivalent to 301 for
consolidation purposes, so this is very likely harmless in practice — but the
spec's text says 301, and a governance document should not quietly substitute a
different number. `statusCode: 301` can be set explicitly instead of
`permanent`, and should be. Flagged because it is the kind of detail that gets
noticed six months later during a traffic investigation.

**Second, and fatal: changing a redirect requires a rebuild and a redeploy.**
There is no path to `/admin` editability, ever, without abandoning the
mechanism. Redirects are baked into the build artifact.

It also requires the seed file to be present at build time on Railway, which
couples the deploy to seed-data availability — and the seed data is absent
today.

### Option C — a static data module consulted by `middleware.ts`

The map as a committed module, imported into `middleware.ts`, looked up through a
`Map`.

Middleware **is required regardless** — the spec mandates it for the host-level
redirect. Option C therefore introduces no new moving part; it puts the path
lookup in a file that has to exist anyway, which is also the only place where
host and path can be resolved into the single hop §1 requires.

The lookup is an in-memory `Map.get` — O(1), no I/O, nothing to cache or
invalidate. Middleware should still carry a `matcher` so it does not execute on
static assets.

It is the most testable of the three: the resolver is a pure function of
`(hostname, pathname)`, unit-testable with no build, no server and no database.
That matters right now, because issue #27 (test harness) is `status:READY` and
there is currently no test suite at all.

Its weakness is the same as B's — a redirect change requires a commit and a
deploy — but unlike B it does not foreclose anything, because the lookup sits
behind one function.

### Comparison

| | **A: DB table** | **B: `next.config.ts`** | **C: static module + middleware** |
|---|---|---|---|
| Works on Railway with a server runtime | Yes, but needs a deliberate middleware-runtime choice to reach Postgres | Yes | Yes |
| Survives a deploy | Yes — DB is the source of truth | Yes — baked into the build | Yes — committed to the repo |
| Editable from `/admin` later | **Yes, natively** | **No** | Not directly; behind one function, so migratable |
| Cost per request | DB round trip, unless cached in memory | Framework-level match; effectively free | In-memory `Map.get`; effectively free |
| Testability | Needs a DB fixture | Assert the generated config; awkward to unit-test | **Pure function; unit-testable today** |
| Resolves host + path in one hop | Yes | Yes, with care | **Yes, naturally** |
| Buildable now | **No** — blocked on #15, #17 | No — needs the seed file at build | **Yes** — needs only the seed file |

---

## 4. Recommendation

**Adopt Option C: a static data module consulted by `middleware.ts`, with the
lookup isolated behind a single resolver function.**

The rationale, in order of weight:

1. **It is the only option that is not blocked.** A is blocked behind a HIGH-risk
   human-gated runtime task and the schema task. B needs the seed file at build
   time and offers nothing C does not. The spec calls this redirect "the
   load-bearing requirement"; it should not wait on the database.

2. **Middleware is required anyway.** The spec mandates it for the host rule. C
   adds no component — it adds rows to a file that must exist. And it is the only
   option where host and path are resolved in the same place, which is what
   §1 requires to avoid two-hop chains.

3. **The legacy set is closed.** The old WordPress site is frozen at 166 posts
   and 9 pages. Legacy redirect rows will not grow. The "editable without a
   deploy" advantage that distinguishes A applies almost entirely to *future*
   editorial redirects — a post retired, merged, or re-slugged — not to the
   legacy map. That need is real but it is not urgent, and it does not exist at
   all until posts are live and `/admin` exists.

4. **It is testable now**, with no database and no deploy, which is the
   difference between a redirect layer that is verified and one that is asserted.

**Adopting C does not foreclose A.** That is the point of the resolver function:
when `/admin` and the database exist, the resolver's data source changes from a
file to a cached table read, and its callers do not change. Anyone implementing
C should treat that function boundary as load-bearing rather than incidental.

**What this recommendation does *not* cover:** whether the legacy map is
*additionally* imported into a `redirects` table when the database lands, so that
`/admin` can display it. That is a reasonable thing to want and it is compatible
with C. It is a later decision, not this one.

### Not recommended, and why

- **Option A now** — blocked on #15 and #17, and the cached version of it
  collapses into C anyway.
- **Option B** — buys nothing over C, emits 308 rather than the spec's 301 unless
  explicitly overridden, and permanently rules out `/admin` editing.
- **`public/_redirects`** — the existing Cloudflare Pages file. It is superseded.
  It defers the old-domain redirect to "a Cloudflare redirect rule at the zone
  level rather than this file," which directly contradicts the spec's requirement
  that the redirect live in the Next.js app, and it references
  `src/data/redirects.json`, a path that does not exist (verified). It is edge
  config for a platform the project is leaving. See
  `/docs/LEGACY_URL_PRESERVATION_CHECKLIST.md` §7.6.

---

## 5. Where the 9 legacy pages point

**HUMAN. This cannot be settled from the spec.**

The spec's context section records "166 published posts and 9 published pages."
Its data model has a `posts` table and no `pages` table. Its routes are `/`,
`/[slug]`, `/go/[placementId]`, `/admin` and `/preview/[slug]` — there is no page
route. The 9 pages therefore have no row and no route anywhere in the spec, and
the spec never says what becomes of them.

The realistic destinations, with what each costs:

1. **Model them as `posts` rows.** They occupy `/[slug]` like any post, and their
   legacy paths resolve unchanged. Cheapest, and consistent with "match the
   legacy slugs exactly." Wrong if any of the 9 is something like a contact form
   or a privacy policy that does not belong in the post table or the sitemap.
2. **Redirect each to the nearest live equivalent.** Correct for pages whose
   content genuinely moved. Requires a human judgment per page about what the
   nearest equivalent is — `/docs/LEGACY_URL_PRESERVATION_CHECKLIST.md` §6
   already lists "deciding the destination for any legacy URL that has no
   equivalent on the new site" as **HUMAN**.
3. **Let them 404.** Correct only for pages with no inbound links and no search
   traffic — for example a WordPress sample page. Note that
   `/docs/AGENT_RULES.md` forbids removing legacy redirects and changing legacy
   slugs; deliberately 404ing a URL that holds equity is the same loss by a
   different route. This option needs evidence per page, not a default.

What a human needs in order to decide, none of which is in the repository:

- **HUMAN** — the list of the 9 page slugs.
- **HUMAN** — per-page search traffic and inbound links, to separate a legal page
  from a WordPress default from a page with real equity.
- **HUMAN** — whether any of the 9 already appear as rows in
  `seed/redirects.json`, which would settle it directly. This is the same
  unresolved question recorded in `/docs/SEED_DATA_READINESS_CHECKLIST.md`.

The recommended model (Option C) is **indifferent to the answer.** A page that
resolves needs no row; a page that moves gets a row; a page that dies gets no
row. The decision can be made after the redirect layer is built, per page, as
evidence arrives. It does not block implementation.

---

## 6. Open questions marked HUMAN

- **HUMAN** — Approve Option C. The choice itself is a human decision; this
  document is a recommendation.
- **HUMAN** — What `seed/redirects.json` actually contains: whether the 175 rows
  are identity mappings, archive and feed URLs, the 9 pages, or something else.
  The 166 + 9 = 175 arithmetic in §2 is a lead, not a finding.
- **HUMAN** — Where each of the 9 legacy pages points (§5).
- **HUMAN** — Whether the legacy map is *also* imported into a `redirects` table
  when the database lands, for `/admin` visibility.
- **HUMAN** — Whether `/gifts-for-moms-birthday`, the one guide route that exists
  today, is a legacy slug. It appears nowhere in the spec's rebuild order.
  Already flagged in `/docs/LEGACY_URL_PRESERVATION_CHECKLIST.md` §7; it must be
  checked against `redirects.json` when the seed data lands.
- **HUMAN** — If Option A is ever revisited, the middleware runtime choice needed
  to reach Postgres (§3, Option A). Not required under the recommended option.
- **HUMAN** — Trailing-slash behaviour on Railway. Unresolved and adjacent: the
  current handling depends on Cloudflare Pages serving `/foo.html`, which does
  not survive the move. Whichever form wins, the redirect resolver must not 404
  the other. See `/docs/LEGACY_URL_PRESERVATION_CHECKLIST.md` §7.7.

---

## 7. Implementation notes, for whoever builds this

Not part of the decision. Recorded so they are not rediscovered.

- **Emit 301 for the host and path redirects, and 302 for `/go/[placementId]`.**
  Different numbers on purpose — the spec is explicit that a 301 on `/go` gets
  cached by the browser and click recording silently stops.
- **Resolve host and path together, redirect once** (§1).
- **Do not match the old domain with `endsWith('parentpresent.com')` unchecked.**
  The spec presents that snippet as illustration. It correctly excludes
  `parentpresents.com`, but it matches any hostname ending in that string.
  Already flagged in `/docs/LEGACY_URL_PRESERVATION_CHECKLIST.md` §7.
- **Give middleware a `matcher`** so it does not run on static assets and fonts.
- **Redirects are append-only.** `/docs/AGENT_RULES.md` forbids removing a legacy
  redirect. Deleting a row is not a refactor.
- **`output: "export"` must be gone first.** A static export has no server
  runtime, so middleware never executes. Verified present in `next.config.ts`.
  This blocks the entire mechanism and is tracked as issue #15 — `risk:HIGH`,
  `needs-human`.

### Current repository state

Verified against the working tree at `5ac237e`, not assumed:

| | |
|---|---|
| `middleware.ts` | **Absent.** No file matching `middleware.*` anywhere outside `node_modules`. |
| `seed/` and `redirects.json` | **Absent.** No `seed/`, no `src/data/`, no `redirects.json` anywhere outside `node_modules`. |
| `sitemap.xml`, `robots.txt` | **Absent** in every form. |
| `next.config.ts` | `output: "export"`, `trailingSlash: false`. |
| `public/_redirects` | One rule: `www.parentpresents.com` → apex. Defers the old domain to a Cloudflare zone rule; references the non-existent `src/data/redirects.json`. |
| Canonical mechanism | Exists. `pageMetadata()` in `src/lib/metadata.ts` emits `alternates.canonical` against `SITE_URL = "https://parentpresents.com"`. |
| Routes | `/` and `/gifts-for-moms-birthday` only. |
