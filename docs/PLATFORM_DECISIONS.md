# ParentPresents Platform Decisions

The three implementation choices `/docs/REBUILD_SPEC.md` leaves open: database
engine, data-access layer, and the authentication mechanism for the auth-gated
`/admin` and `/preview/[slug]` routes.

`/docs/ARCHITECTURE_MIGRATION_CHECKLIST.md` section 3 records all three as
undecided. Schema work, seed import, the data layer and every route task sit
behind them.

This document recommends. It does not decide and it does not implement. Each
section ends with a **HUMAN** decision line naming what must be approved before
implementation starts. Nothing here creates, stores or references a secret,
credential, connection string or environment value, and no npm dependency is
installed by the change that adds this file.

## 0. What the spec already fixes

Not open for decision. Any option that cannot satisfy these is disqualified.

| Constraint | Source |
| --- | --- |
| Four tables: `products`, `posts`, `placements`, `clicks` | Data model |
| `placements.blurb` stays on `placements`; never collapsed into `products` | "Do not collapse the blurb into products" |
| `unique (post_slug, product_id)` on `placements` | Data model |
| Public pages query `where status = 'live'`; admin sees everything | Routes |
| `/go/[placementId]` writes a `clicks` row, then **302** — never 301 | `/go/[placementId]` |
| `price_at_export` stored, never rendered | Data model |
| Every post seeds `status: "draft"` | Seed data |
| `/admin` and `/preview/[slug]` are auth-gated | Routes |
| One deployment. No staging site, no second deployment | Routes |

Note on table count: the spec's data-model section opens "Three tables" and then
defines four, including `clicks`. `CLAUDE.md` says four. Four is what the model
actually specifies and four is what the schema task should build; the "three"
is prose that predates `clicks`. Flagged rather than silently reconciled.

## 1. Database engine

### 1.1 What the workload actually is

Sizing derived from `/docs/REBUILD_SPEC.md`, not measured.

**Read volume.** GA4's all-time window is 2021-07-03 to 2026-07-30, a little
over five years, across which the old site took 1,485,171 views — on the order
of 800 views/day averaged, of which search (the traffic that recurs) was
311,977 lifetime, nearer 170/day. Instagram's 752,886 does not return.

**Row volume at import.** 3,304 products + 166 posts + 3,429 placements = 6,899
rows. `redirects.json` adds 175 more if the redirect map becomes a table, which
is issue #12's decision and not this document's. The entire seed is smaller than
many single web pages.

**Write volume.** `clicks` is the only table that grows in production, one row
per affiliate click. At the read volumes above, even an implausibly good
outbound CTR puts this in the tens-to-hundreds of rows per day. `clicks` is
append-only and is read by nobody on the hot path.

The conclusion that matters: this workload does not constrain the choice. A
single small managed instance is comfortably oversized for it at every stage of
the rebuild. Choose for operational simplicity, type fidelity and the fact that
Railway hosts it — not for throughput.

### 1.2 Type fidelity against the spec's columns

The spec writes its DDL in PostgreSQL dialect and that is the strongest signal
in it.

| Spec column type | Where | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- | --- |
| `text primary key` (`"p_14166"`) | `products.id` | Native, unlimited `text` PK | `VARCHAR(n)` with a length to invent; `TEXT` PKs need a prefix length | `TEXT` PK fine |
| `serial` | `placements.id`, `clicks.id` | Native | `AUTO_INCREMENT` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `timestamptz` | `products.last_synced`, `clicks.occurred_at` | Native, offset-aware | No true equivalent; `TIMESTAMP` is UTC-converted, `DATETIME` is tz-naive | No date type at all; text or integer by convention |
| `numeric` | `products.commission_rate` | Native exact decimal | `DECIMAL` | No exact decimal type |
| `date` | `posts.published_at` | Native | Native | None |
| `references` / FK enforcement | `placements`, `clicks` | Enforced | Enforced (InnoDB) | Off unless `PRAGMA foreign_keys=ON` per connection |

`serial`, `timestamptz` and `numeric` are all PostgreSQL spellings. Picking
anything else means translating the one piece of schema the spec states
literally, and translating it in the two places where correctness is least
forgiving: an offset-aware timestamp on the click log, and an exact decimal on
`commission_rate`.

### 1.3 Options

**PostgreSQL, managed by Railway.** Runs the spec's DDL essentially verbatim.
Railway provisions it as a first-party service in the same project as the app,
so the app reaches it over the project's private network and the connection
string is injected as a service variable rather than hand-copied. Backups,
metrics and restores are the platform's. Every mainstream Node data-access
option in section 2 targets it as its primary dialect.

**MySQL, managed by Railway.** Also first-party. Costs a schema translation for
no gain: `timestamptz` has no faithful equivalent, and the click log is the
table where timezone ambiguity is least acceptable — a `clicks` row whose
`occurred_at` cannot be compared across a DST boundary or against Amazon's
reporting is a row that cannot be reconciled with revenue.

**SQLite on a Railway volume.** Tempting at 6,899 rows, and genuinely cheap. Two
problems. It has no `timestamptz`, no exact `numeric` and no `date`, so all
three become application conventions that every future query has to honour, and
that the spec's DDL no longer documents. And it ties the app to one instance
with an attached volume: redeploys, instance moves and any future second
process all become data-durability questions rather than routing questions. The
saving is small and the failure mode is the click log.

**A third-party hosted Postgres.** Works, and the app would not know the
difference. It adds a second vendor, a second bill and a second place secrets
live, for no capability the rebuild needs. It also usually implies connection
pooling over the public internet; see 1.4. If a specific provider is wanted for
a reason outside this repository, that is a human call — the recommendation
below is about the engine, and it survives the host changing.

### 1.4 Connection handling

Worth settling now, because it is where the `/go/[placementId]` write path can
go wrong.

Railway runs a long-lived Node process, not per-request serverless functions.
That means one ordinary connection pool created once per process is correct, and
the serverless-era machinery — external connection poolers, HTTP-over-fetch
database drivers, a fresh connection per invocation — is not needed and should
not be added reflexively.

Two consequences for `/go/[placementId]`:

- The insert and the 302 are both on the click path. The redirect must not wait
  on anything slow, and it must still redirect if the insert fails. Losing a
  click row is an analytics gap; failing to redirect a buyer is lost revenue.
  Exactly how that is ordered belongs to issue #20, but the engine choice must
  not make it harder, and a local private-network Postgres with a warm pool
  makes it as easy as it gets.
- Route handlers must not be allowed to open their own connections. One shared
  pool module, imported everywhere — see 2.4.

### 1.5 Recommendation

**PostgreSQL, provisioned as a managed Railway service in the same project as
the app.** It is the dialect the spec is written in, it keeps `timestamptz` and
`numeric` as real types on the two columns that need them, it puts the database
on the private network of the deployment that already exists, and it adds no
vendor. The workload is far too small to justify weighing anything else on
performance grounds.

- **HUMAN** Approve PostgreSQL as the engine, approve Railway as its host, and
  provision the instance. Provisioning, plan selection and anything with a cost
  are human actions: `/docs/AGENT_RULES.md` forbids autonomous spending and
  purchasing of services, and issue #15 already carries the Railway foundation
  as `risk:HIGH` with `needs-human`.
- **HUMAN** Create the connection-string variable. An autonomous run must not
  create, store or reference it; code may read it by name only once a human has
  set it.
- **HUMAN** Confirm the backup and point-in-time-restore posture before the
  seed import runs, since the import is the first thing of value in the
  database.

## 2. Data access

### 2.1 The two things that decide this

**The migration story.** The schema is four tables and the spec states them
literally. It is not a moving target, and the volume of migration work over the
life of the rebuild is low. What matters is that migrations are files in this
repository, reviewable in a PR, applied in order, and that the DDL that lands
can be read against the spec's DDL column for column. A tool that generates
migrations by diffing a model against the live database is more machinery than
four fixed tables need, and it puts a generated artifact between the spec and
the schema.

**The `status = 'live'` asymmetry.** This is the real risk in the data layer.
Public pages must filter `status = 'live'`; `/admin` must not. The failure is
silent and asymmetric: an admin query that accidentally filters shows an
operator an incomplete list, which is annoying; a public query that forgets the
filter publishes a draft, which is the one thing the spec's "everything seeds as
draft" rule exists to prevent. A forgotten `.where()` is indistinguishable from
a correct query on inspection, which is exactly the kind of mistake that must
not be left to reviewer attention.

The mitigation is structural, not stylistic, and it is independent of which
option below is chosen — see 2.4.

### 2.2 Options

**Raw SQL over `pg`.** Minimum dependency footprint, no abstraction between the
code and the spec's DDL, and full access to the dialect. Costs: result types are
`any` unless hand-declared and then hand-maintained, so the compiler stops
helping at the one boundary where the shape of the data matters; migrations are
hand-written and need a small runner; and every query is a string, which makes
the missing-`where` failure in 2.1 fully invisible to tooling. `pg` also returns
`numeric` as a string and parses `timestamptz` into a `Date` in the process
timezone — both are correct-by-default choices for precision, but they are
choices the application then has to know about.

**A typed query builder (Kysely).** Queries are composed in TypeScript against a
declared database interface, so column names, joins and result shapes are
checked by the compiler, while the SQL stays visible and predictable — a
`where` clause is a method call, not a hidden default. Migrations are plain
up/down TypeScript files applied by a runner, so the DDL that lands is written
by hand and reads directly against the spec. Costs: the database interface is
maintained by hand or generated from the live schema, and generation is another
step to keep honest.

**A schema-first ORM (Drizzle).** Tables are declared once in TypeScript,
result types are inferred from those declarations, and `drizzle-kit` generates
SQL migration files that are committed and reviewable. Close to the query
builder in feel, with the table declarations doubling as the type source, which
removes the hand-maintained interface. Costs: the declarations become a second
description of the schema alongside the spec's DDL and can drift from it; and
generated migrations need reading before they are applied, not trusting.

**A full ORM (Prisma).** Strongest ergonomics and the most mature migration
tooling, and client extensions could express the public/admin split centrally.
Costs are the worst fit here: a separate schema DSL that is now the third
description of four tables, a generated client in the build, a heavier runtime,
`numeric` arriving as a `Decimal` object that needs its own handling, and
`serial`/`timestamptz` expressed through the DSL's own vocabulary rather than
the spec's. It is a large amount of apparatus for 6,899 rows and one growing
append-only table.

### 2.3 Recommendation

**A typed query builder — Kysely — with hand-written, committed migrations.**

It is the option that keeps the SQL legible against the spec's DDL while still
giving the compiler the result shapes, and it keeps migrations as reviewable
files rather than generated diffs. Drizzle is a defensible second choice and the
gap is not large; if the single-source-of-truth table declarations are worth
more to the operator than hand-written DDL, take Drizzle instead. Raw `pg`
should be rejected for losing typing at the `placements` join, which is the
query the whole data model exists to serve. Prisma should be rejected as
disproportionate.

Whichever is chosen: exactly one new runtime dependency plus its migration
tooling. Nothing else in section 2 is a dependency.

### 2.4 Required regardless of the choice

These hold under any of the four options and should be treated as part of the
data layer's definition, not as style preferences.

- **Split the read surface by audience, not by parameter.** Two modules — public
  and admin — with no shared "get posts" function taking an
  `includeDrafts` flag. A flag defaults to something, and the default is the
  bug. A public module that has no way to express "unfiltered" cannot leak a
  draft.
- **Put `status = 'live'` in one place per entity.** Public post and placement
  reads compose from a single filtered base query. One place to audit, one place
  to get right.
- **Never query the database from a page or route component directly.** Routes
  call the data layer. This is what makes the previous two points enforceable
  rather than advisory.
- **One shared connection pool module.** Created once per process, imported
  everywhere, never instantiated in a route.
- **`price_at_export` does not leave the data layer.** Public read functions
  should not select it at all. A column that is never returned cannot be
  rendered by mistake, which is a stronger guarantee than remembering not to
  render it.
- **`placements` is queried as its own table.** Joined to `products` for the
  affiliate URL and image, with `blurb` read from `placements`. The spec's
  central rule is a schema rule; the data layer is where it gets honoured or
  quietly broken.
- **Migrations are files in this repository, applied in order, never edited
  after they have been applied.**
- **The seed import is re-runnable and reports before it writes**, per
  `/docs/SEED_DATA_READINESS_CHECKLIST.md` section 4. It is not part of the
  data-access layer, but it is the layer's first consumer.

PostgreSQL row-level security was considered as a way to make the
`status = 'live'` split structural at the database rather than in application
code. It is rejected for now: it requires two database roles and therefore a
second credential, which makes it a security-architecture change, and
`/docs/AGENT_RULES.md` places those permanently outside autonomous work. The
module split above achieves the same outcome within one role.

- **HUMAN** Approve the query-builder recommendation, or choose Drizzle, and
  approve adding that one runtime dependency plus its migration tooling.
- **HUMAN** Approve the public/admin module split as a hard rule before the data
  layer is written, since retrofitting it later means rewriting every call site.
- **HUMAN** Decide who may run migrations against production and how, which is
  an access question, not a code question.

## 3. Authentication for `/admin` and `/preview/[slug]`

### 3.1 Standing constraint

`/docs/AGENT_RULES.md` lists "Modify authentication or security architecture"
and "Change production secrets" under **Never autonomously**. This section is
therefore a recommendation only, and stays one however obvious the choice looks.
No autonomous run may implement it, and no autonomous run may create, store,
reference or read a credential, session secret, OAuth client secret, password
hash or any other secret value while doing so.

`/docs/ARCHITECTURE_MIGRATION_CHECKLIST.md` section 2.5 already marks the auth
mechanism **HUMAN**. This document does not change that; it narrows the options
so the human decision is a short one.

### 3.2 What has to be true

- Exactly one operator. No user registration, no roles, no password reset flow,
  no account recovery to build.
- Two surfaces: `/admin` (post and product editing, task queue) and
  `/preview/[slug]` (draft preview).
- `/preview/[slug]` reads draft content. The spec's "nothing is public until it
  is reviewed" rule means an unauthenticated request to a draft preview is a
  content leak, so preview is not a lesser gate than `/admin`.
- Public routes stay entirely open. Search crawlers must reach `/` and
  `/[slug]` unimpeded — SEO recovery is the whole project.
- Nothing may be gated by obscurity. An unguessable URL is not a gate; it is a
  URL that will eventually appear in a referrer header or a shared link.
- `/docs/AGENT_RULES.md` forbids spending money, so any option with a cost is a
  human decision on its own terms.
- Requires a server runtime. `output: "export"` in `next.config.ts` cannot gate
  anything, so every option here is blocked on issue #15.

### 3.3 Options

**HTTP Basic authentication in middleware.** Fewest moving parts: one check, one
secret, no session, no database table, no dependency. Costs: credentials are
sent on every request; the browser UI is a native dialog with no sign-out; and
it is awkward to scope — the matcher must cover `/admin` and `/preview/[slug]`
and nothing else, or a misconfigured matcher gates the site's search traffic.
Adequate as a stopgap, poor as the answer for a surface where content is edited.

**A single signed session cookie.** A login route checks one credential, sets an
httpOnly, Secure, SameSite cookie carrying a signed, expiring session, and
middleware verifies the signature. Small, fully understood, no dependency of
consequence, real sign-out, and it scopes cleanly. Costs: the credential is
stored as a hash somewhere and the signing key is a secret to manage, and rolling
your own session handling is exactly the category of code where small mistakes
are expensive. Defensible at this scale; still the thing being hand-rolled is
the security boundary.

**A library with a single-account OAuth provider (Auth.js).** Sign in with an
existing identity provider, with an allowlist of exactly one account. No
password is stored by ParentPresents at all, MFA is inherited from the provider,
and session handling is library code rather than bespoke. Costs: one dependency
and its configuration; an OAuth client registered with the provider; two secrets
to set; and the operator's ability to reach `/admin` now depends on a third
party's login being up.

**A hosted identity provider.** Most features, least relevant. Priced per
service, brings a vendor and a dashboard, and solves problems — multi-user,
roles, provisioning, compliance — that a single-operator gift-guide CMS does not
have. Any cost makes it a human decision under `/docs/AGENT_RULES.md`
regardless.

**Network-level restriction.** IP allowlisting or a private-network-only admin
surface. Not authentication, and it breaks the moment the operator's address
changes. Reasonable as defence in depth, unacceptable as the only gate.

### 3.4 Recommendation

**A library-backed session with one OAuth provider and a one-account allowlist,
gating `/admin` and `/preview/[slug]` through a single middleware matcher.** The
deciding argument is that ParentPresents then stores no password and hand-rolls
no session cryptography, which removes the whole class of mistakes that matters
most on the one surface that can edit and publish content.

If a third-party login dependency is unwanted, the single signed session cookie
is the fallback, and it is genuinely acceptable at one operator. Basic
authentication is acceptable only as a temporary gate that is explicitly
scheduled for replacement, and if it is used, its matcher needs the same care
as any other. Hosted identity providers and IP allowlisting should be rejected
as the primary mechanism.

Two details belong to the decision rather than the implementation:

- **Draft preview gating.** Next.js Draft Mode is a rendering switch, not an
  authentication mechanism. If it is used for `/preview/[slug]`, enabling it
  must itself sit behind the gate above; on its own its cookie is a bearer token
  that anyone holding the link can carry.
- **`noindex` on gated routes.** `/admin` and `/preview/[slug]` must never be
  indexable, and must be excluded from `sitemap.xml` when issue #21 adds it.
  Gating and indexability are separate failures and both need to be closed.

- **HUMAN** Choose the mechanism, and if OAuth is chosen, choose the provider
  and register the client. Authentication architecture is permanently outside
  autonomous work.
- **HUMAN** Create every secret the choice requires, directly in the Railway
  environment. No autonomous run may generate, store, echo, log or commit any of
  them, and none may appear in this repository in any form.
- **HUMAN** Approve the middleware matcher covering `/admin` and
  `/preview/[slug]` before it ships. An over-broad matcher would gate the public
  content the rebuild exists to recover; the spec's redirect middleware runs in
  the same file and must keep working alongside it.
- **HUMAN** Decide the session lifetime and the sign-out behaviour.

## 4. Sequencing

1. Issue #15 — retire `output: "export"` and provision the Railway service.
   Nothing in this document can be implemented before it, since a static export
   has no server runtime, no database access and no middleware.
2. Section 1 — provision PostgreSQL once approved.
3. Section 2 — the data layer and migrations (issues #17, #18), which need the
   engine decided but not the auth mechanism.
4. Section 3 — auth, required before `/admin` and `/preview/[slug]` exist, and
   independent of sections 1 and 2.

Sections 2 and 3 can proceed in parallel once section 1 is settled. The redirect
map's modelling (issue #12) is a separate open decision and is unaffected by
anything here.

## 5. Not decided here

- Whether the legacy redirect map becomes a fifth table, generated config or
  middleware data — issue #12, currently at `status:HUMAN_REVIEW`.
- Migration and seeding tooling beyond the query layer's own migration runner.
- Whether `trailingSlash` behaviour is reproduced on Railway, and how — carried
  from `/docs/ARCHITECTURE_MIGRATION_CHECKLIST.md` section 3.
- Where the `seed/` files live and whether they are tracked in git — carried
  from `/docs/SEED_DATA_READINESS_CHECKLIST.md`.
- Hosting plan sizes, costs and backup schedules. All involve spending and are
  human decisions.
