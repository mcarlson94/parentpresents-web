# ParentPresents Autonomous Run Log

This file records autonomous ParentPresents work.

Do not delete previous entries.

Newest entries should be added at the top.

---

## 2026-09-15T10:01:14Z — 2026-09-15T10:07:13Z

**Issue:** [#13](https://github.com/mcarlson94/parentpresents-web/issues/13) — Record platform decisions: database engine, data access, and auth for /admin

**Reason selected:** The only `priority:P0` task at `status:READY`. Three issues were READY — #13 (P0), #24 (P1), #27 (P2) — so `/docs/TASK_QUEUE.md`'s first selection rule settled it outright and no tie-breaker was needed. Passed every eligibility test: status READY, `risk:LOW`, no `needs-human`, `dependencies: []`, and exactly one status/risk/priority/category label, with `cat:technical` confirmed against the repository's approved `cat:*` set via `gh label list`. No conflict with `/docs/AGENT_RULES.md` — documentation only, and the authentication section recommends without implementing, which is what the rules require. It also sits under `/docs/AUTOPILOT.md` position 11 (admin and automation improvements) on the business-priority order, but priority ordering governs, and the task unblocks issues #17, #18 and every route task behind them.

**Risk level:** LOW

**Branch:** `autopilot/13-platform-decisions`, branched from `origin/main` at `5ac237e`

**Pull request:** [#29](https://github.com/mcarlson94/parentpresents-web/pull/29) — not merged

**Files changed:**

- `docs/PLATFORM_DECISIONS.md` (new)
- `docs/RUN_LOG.md` (this entry)

**What was accomplished:** Produced a single decision record for the three implementation choices `/docs/REBUILD_SPEC.md` leaves open and `/docs/ARCHITECTURE_MIGRATION_CHECKLIST.md` section 3 records as undecided.

*Database:* sized the workload from the spec's own figures before assessing anything — 6,899 rows at import (3,304 + 166 + 3,429), with `clicks` the only growing table, append-only, at tens-to-hundreds of rows per day given roughly 800 views/day averaged over GA4's 1,853-day window — and concluded the workload does not constrain the choice, so the decision rests on type fidelity. Recommended managed PostgreSQL on Railway: `serial`, `timestamptz` and `numeric` are PostgreSQL spellings, and the columns that need them are `clicks.occurred_at` and `products.commission_rate`, where a timestamp that cannot be reconciled against Amazon's reporting is a click that cannot be tied to revenue. MySQL, SQLite-on-a-volume and third-party hosted Postgres each assessed and rejected with reasons. Also settled connection handling, since that is where the `/go/[placementId]` write path can go wrong: Railway runs a long-lived process, so one ordinary pool per process is correct and serverless-era pooling machinery should not be added reflexively.

*Data access:* recommended a typed query builder (Kysely) with hand-written, committed migrations, on the grounds that four fixed tables do not need generated migration diffs and the DDL that lands should read against the spec's DDL column for column. Named Drizzle as a defensible second choice, rejected raw `pg` for losing typing at the `placements` join, and rejected Prisma as disproportionate. Section 2.4 records what holds regardless of the choice, the load-bearing item being the `status = 'live'` asymmetry: separate public and admin read modules with no shared `includeDrafts` flag, because a flag defaults to something and the default is the bug; and `price_at_export` never selected by public reads at all, which is stronger than remembering not to render it. PostgreSQL row-level security was considered for the same split and rejected, because two roles means a second credential and therefore a security-architecture change.

*Authentication:* recommended a library-backed session with a one-account OAuth allowlist gating both routes through a single middleware matcher, so ParentPresents stores no password and hand-rolls no session cryptography. Single signed session cookie named as the fallback; Basic auth acceptable only as an explicitly temporary gate; hosted identity providers and IP allowlisting rejected as the primary mechanism. Recorded that Next.js Draft Mode is a rendering switch, not authentication, and that `/admin` and `/preview/[slug]` must be `noindex` and excluded from `sitemap.xml` when #21 adds it.

Every section ends with explicit **HUMAN** decision lines. No decision was taken, nothing was implemented, no dependency was installed, and no secret, credential, connection string or environment value appears in the document.

**Verification performed:**

- `npm run build` — exit 0; compiled, TypeScript passed, 4 static pages generated
- `npm run check` (`tsc --noEmit`) — exit 0
- `npm run lint` (eslint) — exit 0
- `git diff --stat origin/main` empty before the commit; `git status --short --untracked-files=all` showed only the new document. `package.json` and `package-lock.json` unchanged
- Every column type, row count and traffic figure cross-checked against `/docs/REBUILD_SPEC.md`; the 6,899-row total recomputed from its three components, and the per-day figures recomputed over the 1,853 days between 2021-07-03 and 2026-07-30
- Grepped the new document for credential-shaped strings — connection-string schemes, `DATABASE_URL`, `*_SECRET`, `API_KEY`, `CLIENT_SECRET`, password and token assignments, key headers. One hit: the prose phrase "bearer token" in the Draft Mode note
- Referenced issue numbers checked against the live queue rather than assumed: #12 (`HUMAN_REVIEW`), #15 (`risk:HIGH`, `needs-human`), #17, #18, #20, #21
- `next.config.ts`, `/docs/AGENT_RULES.md`, `/docs/ARCHITECTURE_MIGRATION_CHECKLIST.md` and `/docs/SEED_DATA_READINESS_CHECKLIST.md` re-read in full before being cited
- Checked PR state before describing it: contrary to the assumption carried from earlier entries, PRs #3, #6 and #9 are all merged. PR #28 (issue #12) is the only other open PR

**Verification result:** Passed.

**Final issue status:** `status:HUMAN_REVIEW` with `needs-human`, awaiting review and merge of PR #29.

**Human attention required:**

- All three decisions need sign-off. The document recommends; it does not decide. Issue #13 anticipated ending at `status:HUMAN_REVIEW` for this reason.
- Authentication cannot be implemented autonomously, now or later. `/docs/AGENT_RULES.md` places authentication and security architecture, and production secrets, permanently outside autonomous work. Every secret the chosen mechanism needs must be created by a human directly in the Railway environment.
- Provisioning costs money. Approving the engine, selecting a plan and provisioning the instance are human actions; `/docs/AGENT_RULES.md` forbids autonomous spending and purchasing of services. Issue #15 already carries the Railway foundation as `risk:HIGH` with `needs-human`.
- Nothing in the document is implementable until #15 lands. `output: "export"` in `next.config.ts` leaves no server runtime, so there is no database access, no middleware and no way to gate a route.
- The middleware matcher needs review before it ships. An over-broad matcher would gate the public content the rebuild exists to recover, and the spec's old-domain redirect middleware runs in the same file.
- Spec inconsistency flagged, not reconciled: `/docs/REBUILD_SPEC.md`'s data-model section opens "Three tables" and then defines four, including `clicks`, while `CLAUDE.md` says four. The document records four as what the schema task should build and flags the discrepancy, per `CLAUDE.md`'s instruction to flag rather than silently reconcile.
- The legacy redirect map's modelling was deliberately left alone as issue #12's question, and is listed in section 5 as not decided here.
- PR #29 requires one approving review; branch protection has `enforce_admins` enabled.

**Recommended next task:** Move issue #16 — "Write a seed-data validator that runs before any import" — from `status:BACKLOG` to `status:READY`. It is `risk:LOW`, `priority:P1`, has no dependency on any decision in this document, and `/docs/SEED_DATA_READINESS_CHECKLIST.md` section 2 already specifies its checks in full, so it is the largest piece of genuinely unblocked engineering work in the queue: a validator that runs against the JSON alone needs no engine, no ORM and no server runtime. Of the tasks already at `status:READY`, #24 (product verification procedure and `stock_status` gate) is the stronger of the two remaining, since it sits at position 5 in `/docs/AUTOPILOT.md`'s order against #27's position 11 and directly guards the spec's rule that publishing 50 links where a dozen are broken is worse than publishing nothing.

---

## 2026-09-13T16:05:12Z — 2026-09-13T16:07:57Z

**Issue:** [#8](https://github.com/mcarlson94/parentpresents-web/issues/8) — Final cloud test: create legacy URL preservation checklist

**Reason selected:** The only task at `status:READY`. Passed every eligibility test in `/docs/TASK_QUEUE.md`: status READY, `risk:LOW`, no `needs-human`, `dependencies: []`, and exactly one status/risk/priority/category label, with `cat:seo` confirmed against the repository's approved `cat:*` label set. No conflict with `/docs/AGENT_RULES.md` — documentation only. It also sits at position 2 in `/docs/AUTOPILOT.md`'s business-priority order (SEO, redirect, or canonical problems), behind only critical production bugs.

**Risk level:** LOW

**Branch:** `autopilot/8-legacy-url-preservation-checklist`, branched from `origin/main` at `6ddb9d2`

**Pull request:** [#9](https://github.com/mcarlson94/parentpresents-web/pull/9) — not merged

**Files changed:**

- `docs/LEGACY_URL_PRESERVATION_CHECKLIST.md` (new)
- `docs/RUN_LOG.md` (this entry)

**What was accomplished:** Documented the per-URL 301 from `parentpresent.com` to `parentpresents.com` and the spec's three-step sequence for it; the requirement to preserve legacy slugs exactly; the sitemap, `robots.txt` and canonical requirements with the current state of each verified against the working tree; the rule against both domains serving duplicate content; the spec's highest-priority legacy URLs with their search-traffic figures; a split between checks that can be automated and items marked **HUMAN**; eight items currently missing from the repository that block cutover; and a gated cutover order. No application code, configuration, dependency or governance-document changes.

**Verification performed:**

- `npm run build` — exit 0; compiled, TypeScript passed, 4 static pages generated
- `npm run check` (`tsc --noEmit`) — exit 0
- `npm run lint` (eslint) — exit 0
- `git diff --stat origin/main` empty; `git status --short` showed only the new untracked document
- Verified absence directly rather than assuming: no file matching `middleware.*`, no `sitemap*` or `robots*`, no `seed/`, no `src/data/`, no `redirects.json` anywhere outside `node_modules`
- Confirmed the canonical mechanism exists and is used: `pageMetadata()` in `src/lib/metadata.ts` emits `alternates.canonical` against `SITE_URL`, and both existing routes (`/`, `/gifts-for-moms-birthday`) call it
- Re-read `public/_redirects`, `public/_headers` and `next.config.ts` in full before describing them
- Every traffic figure, slug, percentage and row count cross-checked against `/docs/REBUILD_SPEC.md`; the 101,726 total for the four no-product posts recomputed from its four components

**Verification result:** Passed.

**Final issue status:** `status:HUMAN_REVIEW` with `needs-human`, awaiting review and merge of PR #9.

**Human attention required:**

- The structural blocker is `output: "export"` in `next.config.ts`. A static export has no server runtime, so the spec's `middleware.ts` redirect cannot run at all — and neither can `/go/[placementId]` click logging, the auth-gated routes, or any database access. Every other cutover item sits beneath this one.
- `middleware.ts` does not exist. The spec's load-bearing redirect is entirely unimplemented.
- `seed/redirects.json` — the 175-row legacy URL map — is still absent, so there is nothing to verify redirects against. The other three seed files are absent too, as recorded in `/docs/SEED_DATA_READINESS_CHECKLIST.md`.
- No `sitemap.xml` and no `robots.txt` exist in any form; both are required by the spec.
- `public/_redirects` actively contradicts the spec: it defers the old-domain redirect to a Cloudflare zone-level rule rather than the Next.js app, and references `src/data/redirects.json`, which does not exist.
- Trailing-slash handling depends on Cloudflare Pages behaviour and does not carry over to Railway. It needs an explicit decision.
- `/gifts-for-moms-birthday` appears nowhere in the spec's rebuild order. Whether it is a real legacy slug or a new example route cannot be determined from the repository; it must be checked against `redirects.json` when the seed data lands.
- DNS, the second custom domain, shutting off the WordPress host, and keeping the old registration are all **HUMAN** actions forbidden to autonomous runs by `/docs/AGENT_RULES.md`.
- PR #9 requires one approving review; branch protection has `enforce_admins` enabled.

**Recommended next task:** Decide the `redirects.json` modelling question — whether legacy redirects become a fifth table, generated config, or middleware data — and where the 9 legacy pages point. This was the previous run's recommendation and remains unresolved; it is now the narrowest unblocked decision standing between the repository and a working redirect layer, and it can be settled from documents already present. The removal of `output: "export"` is the larger blocker but is a MEDIUM-to-HIGH-risk architecture change that should be scoped and approved by a human first.

---

## 2026-09-13T15:44:23Z — 2026-09-13T15:52:10Z

**Issue:** [#5](https://github.com/mcarlson94/parentpresents-web/issues/5) — Pilot cloud run: create seed data readiness checklist

**Reason selected:** The only task at `status:READY`. Passed every eligibility test in `/docs/TASK_QUEUE.md`: status READY, `risk:LOW`, no `needs-human`, `dependencies: []`, exactly one status/risk/priority/category label, and no conflict with `/docs/AGENT_RULES.md` (documentation only). Also the standing recommended next task from the previous run — the missing `seed/` folder blocks every database-dependent step in `/docs/ARCHITECTURE_MIGRATION_CHECKLIST.md`.

**Risk level:** LOW

**Branch:** `autopilot/5-seed-data-readiness-checklist`, branched from `origin/main` at `5c455cd`

**Pull request:** [#6](https://github.com/mcarlson94/parentpresents-web/pull/6) — not merged

**Files changed:**

- `docs/SEED_DATA_READINESS_CHECKLIST.md` (new)
- `docs/RUN_LOG.md` (this entry)

**What was accomplished:** Documented the four seed files and their expected row counts from `/docs/REBUILD_SPEC.md`, confirmed against the working tree that all four are absent from the repository, specified the pre-import validation that can run against the JSON alone without choosing an engine or ORM, separated automated checks from **HUMAN** items, and recorded the import-time rules the spec fixes (draft status, `unverified` stock status, price stored but never rendered, affiliate URLs never rewritten). Five open questions were surfaced for human decision rather than resolved.

**Verification performed:**

- `npm run build` — exit 0; compiled, TypeScript passed, 4 static pages generated
- `npm run check` (`tsc --noEmit`) — exit 0
- `npm run lint` (eslint) — exit 0
- `git diff --stat origin/main` empty apart from the new document; no application code, dependency, configuration, or governance-document changes
- Verified the absence of seed data directly: no `seed/`, no `src/data/`, and no JSON data file under `src/` or `public/`
- Every row count and file description in the checklist cross-checked against the seed-data table in `/docs/REBUILD_SPEC.md`

**Verification result:** Passed.

**Note on `npm run check`:** On a clean checkout it fails with `TS2307: Cannot find module '@/assets/logo-mark.png'` until `npm run build` has generated `next-env.d.ts`, which is gitignored. Pre-existing and unrelated to this change; `check` passes once `build` has run. Recorded because the ordering is not obvious and a future run may otherwise read it as a regression.

**Final issue status:** `status:HUMAN_REVIEW` with `needs-human`, awaiting review and merge of PR #6.

**Human attention required:**

- The `seed/` folder is still missing. All four files — `products.json`, `posts.json`, `placements.json`, `redirects.json` — are absent, and it must be decided whether they are committed to this repository or supplied out of band at import time.
- `redirects.json` has no table in the spec's data model, which defines only `products`, `posts`, `placements` and `clicks`.
- The 175 redirect rows exceed the 166 posts. The spec's context section describes 166 published posts and 9 published pages; if the pages are the difference, they have no rows in `posts.json` and no route in the spec.
- `posts.json` is described as carrying section headings and traffic, neither of which has a column in the `posts` table.
- The spec cites roughly 7,100 Lasso-managed affiliate links against 3,304 products described as "every product used on a live post".
- PR #6 requires one approving review; branch protection has `enforce_admins` enabled.
- PR #3 from the previous run is still open and unmerged.

**Recommended next task:** Resolve the `redirects.json` modelling question — whether redirects become a fifth table, generated config, or middleware data — and where the 9 legacy pages point. It is the one open question that blocks the spec's load-bearing redirect requirement, and unlike locating the seed export it can be decided from documents already in the repository.

---

## 2026-09-13T14:17:42Z — 2026-09-13T14:22:33Z

**Issue:** [#2](https://github.com/mcarlson94/parentpresents-web/issues/2) — Pilot: create rebuild architecture migration checklist

**Reason selected:** Only task at `status:READY`. Passed every eligibility test in `/docs/TASK_QUEUE.md`: status READY, `risk:LOW`, no `needs-human`, `dependencies: []`, and no conflict with `/docs/AGENT_RULES.md` (documentation only).

**Risk level:** LOW

**Branch:** `autopilot/2-architecture-migration-checklist`, branched from `origin/main` at `f544528`

**Pull request:** [#3](https://github.com/mcarlson94/parentpresents-web/pull/3) — not merged

**Files changed:**

- `docs/ARCHITECTURE_MIGRATION_CHECKLIST.md` (new, 145 lines)
- `docs/RUN_LOG.md` (this entry)

**What was accomplished:** Documented the current legacy static-export architecture as verified against the repository, the migration steps required by `/docs/REBUILD_SPEC.md`, which steps require human approval, and which implementation decisions the spec does not make and were therefore left undecided.

**Verification performed:**

- `npm run check` (`tsc --noEmit`) — exit 0
- `npm run lint` (eslint) — exit 0
- `npm run build` — exit 0; compiled, TypeScript passed, 4 static pages generated
- Diff against `origin/main` confirmed no application code, dependency, or configuration changes
- Confirmed `REBUILD_SPEC.md`, `AGENT_RULES.md`, and `TASK_QUEUE.md` unchanged

**Verification result:** Passed.

**Final issue status:** `status:HUMAN_REVIEW` with `needs-human`, awaiting review and merge of PR #3.

**Human attention required:**

- The `seed/` folder (`products.json`, `posts.json`, `placements.json`, `redirects.json`) referenced throughout `/docs/REBUILD_SPEC.md` is not present in this repository. Database seeding cannot proceed without it.
- Database engine, ORM, and authentication mechanism are unspecified by the spec and remain undecided.
- `origin/staging` exists as a branch, while the spec states there is no staging site and no second deployment.
- PR #3 requires one approving review; branch protection has `enforce_admins` enabled.

**Recommended next task:** Obtain or locate the `seed/` folder and commit it, or record a decision on where the seed data lives. It blocks every database-dependent step in the migration checklist.
