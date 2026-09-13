# ParentPresents Autonomous Agent Rules

You must follow `/docs/REBUILD_SPEC.md`.

If any instruction, existing code, documentation, or prior assumption conflicts with `/docs/REBUILD_SPEC.md`, the rebuild spec wins.

## Allowed autonomous work

You may autonomously:

- Inspect the codebase
- Diagnose bugs
- Fix low-risk, non-destructive bugs
- Improve SEO
- Improve metadata
- Improve internal linking
- Improve accessibility
- Improve performance
- Improve affiliate click tracking
- Improve analytics instrumentation
- Improve admin tooling
- Verify existing functionality
- Write tests
- Refactor code when behavior remains intact
- Prepare legacy content for review
- Improve developer tooling
- Create or update tasks in the autonomous task queue

## Product-data rules

Never invent a product, ASIN, affiliate URL, stock status, product image, merchant, or product fact.

Existing Amazon product data may be stale.

A product must not be treated as verified or published as available unless its current status has actually been checked through an approved source or by a human.

Do not publish a rebuilt guide containing unverified product links.

Do not display cached Amazon prices.

## Never autonomously

- Change DNS
- Modify domain configuration
- Shut down the old WordPress host
- Change affiliate IDs
- Spend money
- Purchase services
- Send customer or subscriber emails
- Delete production data
- Make destructive database migrations
- Change production secrets
- Modify authentication or security architecture
- Publish unverified Amazon products
- Invent replacement products
- Remove legacy redirects
- Change legacy slugs
- Disable canonical tags
- Publish large quantities of AI-generated content
- Change the fundamental ParentPresents business strategy
- Merge directly to production
- Push unreviewed high-risk changes
- Mark a task successful when verification failed

If one of these actions appears necessary, create a recommendation for human review instead of executing it.

## SEO protection

Preserving historical SEO equity is the highest-priority constraint.

Never change a legacy URL merely because another URL seems cleaner.

Never allow `parentpresent.com` and `parentpresents.com` to independently serve duplicate content.

Redirect behavior must follow `/docs/REBUILD_SPEC.md`.

## Production safety

Before making a change:

1. Understand existing behavior.
2. Determine the expected result.
3. Identify the risk level.
4. Make the smallest reasonable change.
5. Test it.
6. Verify the result.
7. Record what changed.

Never knowingly leave the application in a broken state.

When uncertain, do not guess. Flag the issue for human review.

## Risk levels

LOW:
Changes that are reversible, localized, non-destructive, and do not affect security, production data, payments, DNS, authentication, or core architecture.

MEDIUM:
Changes that affect important application behavior, data flows, routing, SEO infrastructure, affiliate tracking, or multiple areas of the application.

HIGH:
Changes involving production data deletion, destructive migrations, DNS, authentication, secrets, affiliate IDs, domain cutover, infrastructure, payments, or irreversible actions.

LOW-risk tasks may be executed autonomously.

MEDIUM-risk tasks may only be executed when clearly permitted by these rules and should be surfaced for review.

HIGH-risk tasks always require human review.
