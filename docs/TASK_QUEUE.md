# ParentPresents Task Queue

GitHub Issues in `mcarlson94/parentpresents-web` are the live persistent task queue for the Phase A autonomous system.

GitHub Issues are authoritative for live task status.
`RUN_LOG.md` is the historical narrative log.
The repository remains authoritative for product, architecture, and operating rules.

## Required task fields

Each task must include:

- id — GitHub issue number
- title
- description
- category
- priority
- status
- risk_level
- source
- related_post_slug
- dependencies
- created_at
- started_at
- completed_at
- result
- requires_human_review

## Labels

Exactly one status label:

- status:BACKLOG
- status:READY
- status:IN_PROGRESS
- status:BLOCKED
- status:HUMAN_REVIEW
- status:COMPLETED
- status:FAILED

Exactly one risk label:

- risk:LOW
- risk:MEDIUM
- risk:HIGH

Exactly one priority label:

- priority:P0
- priority:P1
- priority:P2
- priority:P3

Exactly one category label from the approved `cat:*` labels.

Use `needs-human` when explicit human approval or a human decision is required.

If required labels are missing, duplicated, or contradictory, do not guess. Treat the task as malformed and flag it for human review.

## Issue body

Every task issue must contain this metadata block:

```yaml
source:
related_post_slug:
dependencies: []
started_at:
completed_at:
result:
```

The remainder of the issue body contains the task description, expected outcome, constraints, and any relevant context.

## Eligibility

An autonomous run may execute a task only when:

- status is READY
- risk is LOW, or MEDIUM when explicitly permitted by AGENT_RULES.md
- it does not have the `needs-human` label
- all dependencies are COMPLETED
- the task does not violate AGENT_RULES.md

HIGH-risk tasks are never autonomous.

If a dependency is FAILED, the dependent task must become BLOCKED.

If a dependency is incomplete, skip the task.

Dependency cycles must be treated as BLOCKED and surfaced for human attention.

## Selection order

From all eligible READY tasks:

1. priority:P0 before P1 before P2 before P3
2. use AUTOPILOT.md's business-priority order as the tie-breaker
3. if still tied, select the oldest GitHub issue

Execute exactly one primary task per autonomous run.

## Empty queue protocol

When there are zero open issues labeled `status:READY`:

- the run is considered successful
- no task is claimed
- no issue is changed
- no branch is created
- no repository change is made
- no pull request is opened
- `/docs/RUN_LOG.md` is not changed
- the agent must not create its own replacement task

## Claim protocol

Before doing any work:

1. Re-read the selected issue.
2. Confirm it is still status:READY.
3. Replace status:READY with status:IN_PROGRESS.
4. Set `started_at` to the current timestamp.
5. Add a comment stating that the autonomous run has claimed the task.
6. Re-read the issue immediately after the claim.
7. If the issue is no longer clearly owned by this run or conflicting activity is detected, abort and do not execute the task.

The claim must happen before code or content work begins.

## Working branch

For tasks requiring repository changes:

- update local knowledge of `origin/main`
- branch from the current `origin/main`
- use branch naming:

`autopilot/<issue-number>-<short-slug>`

Never push autonomous work directly to `main`.

Never bypass branch protection.

## Execution

Follow:

1. `/docs/REBUILD_SPEC.md`
2. `/docs/BUSINESS_GOALS.md`
3. `/docs/AGENT_RULES.md`
4. `/docs/AUTOPILOT.md`
5. `/docs/TASK_QUEUE.md`
6. `CLAUDE.md`

Do only the selected task.

Do not expand scope unnecessarily.

## Verification

Run all relevant verification required by AUTOPILOT.md and AGENT_RULES.md.

Never claim success if verification failed.

## Pull requests

If repository changes were made and verification succeeded:

- commit the work to the task branch
- push the task branch
- open a pull request against `main`
- reference the issue using `Refs #<issue-number>`
- do NOT use `Closes`, `Fixes`, or anything that automatically closes the issue
- summarize what changed
- include verification performed
- include anything requiring human attention

Autonomous runs must never merge their own pull requests.

## Task outcomes

If code or content work is complete and awaiting human review or merge:

- status → HUMAN_REVIEW
- add `needs-human`
- add a result comment including the PR link

If the task required no repository changes and is fully verified:

- status → COMPLETED
- set `completed_at`
- record result

If verification failed and the work was reverted:

- status → FAILED
- set `completed_at`
- record exactly what failed

If required information is missing or a dependency prevents execution:

- status → BLOCKED
- explain the blocker in a comment

## Human completion

For tasks ending in HUMAN_REVIEW, a human decides whether the work is accepted.

After the related PR is merged and the result is accepted:

- status → COMPLETED
- remove `needs-human`
- set `completed_at`
- record the final result

If rejected, the human may return the issue to READY, BLOCKED, or FAILED as appropriate.

## Run log

Every autonomous run must append an entry to `/docs/RUN_LOG.md` when repository changes are made.

Include:

- timestamp
- GitHub issue number
- selected task
- reason selected
- risk level
- branch
- PR link if created
- files changed
- verification performed
- final issue status
- human attention required
- recommended next task

GitHub Issues are the live queue state. RUN_LOG.md must never be used instead of checking the current GitHub Issue.

## Phase A / Phase B

This GitHub Issues queue is the Phase A task system.

Once the Railway/database architecture described in REBUILD_SPEC.md exists, the queue may later migrate into the database and `/admin`.

That migration must be explicitly approved and must not happen automatically.
