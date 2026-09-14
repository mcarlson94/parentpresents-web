# ParentPresents Autonomous Run Log

This file records autonomous ParentPresents work.

Do not delete previous entries.

Newest entries should be added at the top.

---

## 2026-09-14T22:18:47Z — 2026-09-14T22:23:35Z

**Issue:** [#12](https://github.com/mcarlson94/parentpresents-web/issues/12) — Decide how the legacy redirect map is modelled

**Reason selected:** One of four `status:READY` tasks (#12, #13, #24, #27) and one of two at `priority:P0` (#12, #13). Passed every eligibility test in `/docs/TASK_QUEUE.md`: status READY, `risk:LOW`, no `needs-human`, `dependencies: []`, and exactly one status/risk/priority/category label, with `cat:seo` confirmed against the repository's approved `cat:*` label set. No conflict with `/docs/AGENT_RULES.md` — documentation only. The P0 tie against #13 was broken by `/docs/TASK_QUEUE.md`'s stated tie-breaker, `/docs/AUTOPILOT.md`'s business-priority order: this task sits at position 2 (SEO, redirect, or canonical problems) against #13's platform/architecture decisions, which fall no higher than position 8. It was also the standing recommended next task in `/docs/RUN_LOG.md` for the previous two runs.

**Risk level:** LOW

**Branch:** `autopilot/12-redirect-model-decision`, branched from `origin/main` at `5ac237e`

**Pull request:** [#28](https://github.com/mcarlson94/parentpresents-web/pull/28) — not merged

**Files changed:**

- `docs/REDIRECT_MODEL_DECISION.md` (new)
- `docs/RUN_LOG.md` (this entry)

**What was accomplished:** Produced the decision record. Separated the host-level redirect (old domain → new domain, path preserved — a rule with zero rows, which the spec's `middleware.ts` snippet already covers) from the path-level map (`redirects.json`, 175 rows, which the spec's four-table data model has no home for), and showed that the two must resolve into a single hop or they produce the redirect chain that `/docs/LEGACY_URL_PRESERVATION_CHECKLIST.md` §6 already lists as a failed check. Assessed the three required options — a fifth `redirects` table, build-time `redirects` in `next.config.ts`, and a static data module consulted by `middleware.ts` — against Railway server runtime, deploy survival, later `/admin` editability, per-request cost, testability, and one-hop resolution. Recommended the static module with the lookup isolated behind a single resolver function, on the grounds that it is the only unblocked option, that middleware is mandated by the spec regardless, that the legacy URL set is closed so the editability advantage applies to future editorial redirects rather than the legacy map, and that it is unit-testable today with no database. Recorded that the recommendation does not foreclose the table. Also noted two details worth not rediscovering: `permanent: true` in `next.config.ts` emits 308 rather than the spec's 301, and redirects are append-only under `/docs/AGENT_RULES.md`.

**Verification performed:**

- `npm run build` — exit 0; compiled, TypeScript passed, 4 static pages generated. Run again after the Option A correction below; still exit 0
- `npm run check` (`tsc --noEmit`) — exit 0, before and after the correction
- `npm run lint` (eslint) — exit 0, before and after the correction
- `git status --short` showed only the new untracked document; `git diff --stat origin/main` empty — no application code, dependency, configuration or governance-document changes
- Verified absence directly rather than assuming: no file matching `middleware.*`, no `seed/`, no `src/data/`, no `redirects.json`, no `sitemap*` and no `robots*` anywhere outside `node_modules`
- Re-read `next.config.ts`, `public/_redirects` and `src/lib/metadata.ts` in full before describing them
- Every figure cross-checked against `/docs/REBUILD_SPEC.md`: 175 redirect rows, 166 posts, 9 pages, the four table names, the route list, 301 for the host redirect, 302 for `/go/[placementId]`
- Every cross-reference to `/docs/LEGACY_URL_PRESERVATION_CHECKLIST.md` checked against that file's actual section numbering
- Issue numbers and labels cited in the document (#15, #17, #27) checked against the live GitHub queue
- Confirmed no assertion was made about the contents of `seed/redirects.json`, per the issue's explicit constraint

**Correction made during the run:** The first draft asserted that Next.js middleware cannot reach Postgres because it runs in the Edge Runtime. `package.json` pins `next: ^16.2.12`, where a Node.js middleware runtime is available, so that is a version-dependent configuration decision and not the hard blocker the draft claimed. The Option A assessment, the comparison table and the "not recommended" note were corrected before commit, and the per-request cost and the dependency on #15/#17 were left as the actual objections. The recommendation did not change. Recorded because the claim was checkable and was initially wrong.

**Verification result:** Passed.

**Final issue status:** `status:HUMAN_REVIEW` with `needs-human`, awaiting review and merge of PR #28.

**Human attention required:**

- **The recommendation itself needs sign-off.** This run produced a recommendation, not a decision. Nothing should be implemented against it until a human approves Option C.
- What `seed/redirects.json` actually contains is still unknown, because the file is absent. The document notes that 166 posts + 9 pages = 175, exactly the spec's row count, and deliberately marks it a lead rather than a finding. It must be confirmed against the real file.
- Where the 9 legacy WordPress pages point could **not** be settled from the spec and is marked **HUMAN**. The spec has no `pages` table and no page route. Three destinations are laid out with what each costs; deciding between them needs the 9 slugs and their per-page search traffic, none of which is in the repository. This does not block implementing the recommended model, which is indifferent to the answer.
- `output: "export"` in `next.config.ts` still blocks the entire mechanism — a static export has no server runtime, so middleware never executes. Tracked as issue #15, `risk:HIGH` with `needs-human`, and not actionable autonomously.
- Whether `/gifts-for-moms-birthday` is a legacy slug remains undetermined, as in the previous run.
- Trailing-slash behaviour on Railway is still undecided and interacts with the redirect resolver: whichever form wins, the other must not 404.
- PR #28 requires one approving review; branch protection has `enforce_admins` enabled. PRs #3 and #6 from earlier runs may still be open.

**Recommended next task:** #13, "Record platform decisions: database engine, data access, and auth for `/admin`" — the other `priority:P0` `status:READY` task, now the highest-value remaining item that can be settled from documents already in the repository. It is the last decision record standing between the backlog and the implementation tasks (#16, #17, #18), all of which are blocked on choices the spec leaves open. Note that the two P0 documentation decisions together still sit behind #15, the HIGH-risk server-runtime task that only a human can authorise.

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
