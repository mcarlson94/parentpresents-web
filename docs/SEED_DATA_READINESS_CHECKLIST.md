# ParentPresents Seed Data Readiness Checklist

Everything that must be true before the ParentPresents seed data can be imported
into the rebuilt architecture.

Derived strictly from `/docs/REBUILD_SPEC.md` and the repository as it stands.
Where the spec does not specify an implementation choice, this document says so
rather than choosing one.

This is a checklist, not an approval. Items marked **HUMAN** must not be executed
autonomously — see `/docs/AGENT_RULES.md`.

## 0. Blocking status

**Not ready.** All four seed files required by `/docs/REBUILD_SPEC.md` are absent
from this repository. Every item in sections 2 and 3 is unrunnable until the data
exists somewhere the import can read it.

Verified against the working tree: there is no `seed/` directory, no `src/data/`,
and no JSON data file anywhere under `src/` or `public/`. The only files under
`public/` are `_headers`, `_redirects`, three favicons and one font.

## 1. Required seed files

Row counts are the spec's, from the seed-data table in
`/docs/REBUILD_SPEC.md`.

| File | Expected rows | What it is | Present in repo |
| --- | ---: | --- | --- |
| `seed/products.json` | 3,304 | Every product used on a live post | **No** |
| `seed/posts.json` | 166 | Every published post, intro text, section headings, traffic | **No** |
| `seed/placements.json` | 3,429 | Product-on-post, with the exact blurb for that post | **No** |
| `seed/redirects.json` | 175 | Old path → new path, ordered by search value | **No** |

- [ ] **HUMAN** Locate the four files, or confirm they can be regenerated from
      the WordPress export and the Lasso plugin data
- [ ] **HUMAN** Decide where seed data lives — committed to this repository, or
      supplied out of band at import time. The spec names the path `seed/` but
      does not say whether it is tracked
- [ ] **HUMAN** Confirm the files contain no credentials, no Amazon Product
      Advertising API keys, and no affiliate account secrets before anything is
      committed

## 2. Automated pre-import validation

Checks that can run against the JSON files alone, before any database exists, and
that therefore do not depend on an engine, ORM, or migration tool. None of these
are implemented — the repository has no test suite, and `npm run build` is
currently the only automated gate.

### 2.1 File-level

- [ ] All four files present and parse as JSON
- [ ] Row count of each file matches section 1 exactly; any mismatch is reported,
      not silently accepted
- [ ] UTF-8 throughout; no mojibake in `intro`, `blurb`, `name`, or `title` —
      WordPress exports frequently damage curly quotes, em dashes and emoji

### 2.2 `products.json`

Fields per the `products` table in the spec.

- [ ] `id` present, unique, and matching the spec's documented shape (`p_14166`)
- [ ] `name` non-null and non-empty
- [ ] `affiliate_url` non-null and non-empty — the spec marks it `not null`
- [ ] `affiliate_url` parses as an absolute URL
- [ ] `network` is `amazon` or `other` where present
- [ ] `stock_status` is one of `in_stock`, `oos`, `dead`, `unverified`, or absent
      so the column default applies
- [ ] `asin` well-formed where `network` is `amazon`
- [ ] `commission_rate` numeric where present
- [ ] `last_synced` parses as a timestamp where present
- [ ] `price_at_export` is carried through as data only — see section 4

### 2.3 `posts.json`

- [ ] `slug` present, unique, and byte-for-byte identical to the legacy slug.
      Slugs are SEO equity; `/docs/AGENT_RULES.md` forbids changing them
- [ ] `title` non-null and non-empty
- [ ] `published_at` parses as a date where present
- [ ] `legacy_url` parses as a URL where present, and its path segment agrees
      with `slug`
- [ ] Row count reconciles with the spec's "166 published posts"
- [ ] Every slug named in the spec's rebuild order is present:
      `gifts-for-lawn-lovers`, `gifts-for-back-pain`, `gifts-for-farmer-dad`,
      `gamer-dad-gifts`, `gifts-for-puzzle-lovers`, `beach-lover-gifts`,
      `gifts-for-fishing-dads`, `pickleball-gifts-for-dad`,
      `birthday-wishes-for-mom`, `things-to-do-with-mom-on-her-birthday`,
      `funny-birthday-jokes-for-dad`, `funny-birthday-jokes-for-mom`

### 2.4 `placements.json`

This is the table the spec calls the one that matters.

- [ ] `post_slug` resolves to a row in `posts.json` — no orphans
- [ ] `product_id` resolves to a row in `products.json` — no orphans
- [ ] `blurb` non-null and non-empty on every row; the spec marks it `not null`
- [ ] `blurb` is preserved per placement and never deduplicated up into
      `products` — the spec explicitly forbids collapsing it
- [ ] `position` present and an integer on every row
- [ ] `(post_slug, product_id)` unique across the file, matching the spec's
      unique constraint
- [ ] `position` forms a sane sequence within each `post_slug` — report gaps,
      duplicates and zero/negative values rather than renumbering
- [ ] Report the placements-per-post distribution and the reuse distribution
      (how many posts each product appears on). The spec's stated counts are
      3,429 placements over 3,304 products; confirm that the spread matches what
      the guides actually contain, particularly the 50-product guides

### 2.5 `redirects.json`

- [ ] Every row has both an old path and a new path
- [ ] Old and new values are paths, not absolute URLs onto the old host
- [ ] No duplicate source paths, and no row whose source equals its target
- [ ] No redirect chains and no cycles
- [ ] Every target path either resolves to a slug in `posts.json` or is
      explicitly accounted for in section 3
- [ ] The spec's ordering by search value is preserved — it is the rebuild
      priority signal, not incidental row order

## 3. Open questions for human decision

Raised by reading the spec against itself. Not to be resolved autonomously.

- [ ] **HUMAN** `redirects.json` has no table in the spec's data model. The model
      defines `products`, `posts`, `placements` and `clicks` only. Decide whether
      redirects become a fifth table, a generated config, or middleware data
- [ ] **HUMAN** The 175 redirect rows exceed the 166 posts. The spec's context
      section describes 166 published posts **and** 9 published pages. If the 9
      pages are the difference, they have no rows in `posts.json` and no route in
      the spec, so their redirect targets need a destination decided
- [ ] **HUMAN** `posts.json` is described as carrying "section headings, traffic",
      but the `posts` table has no column for either. Decide whether they are
      dropped, stored, or folded into `intro`
- [ ] **HUMAN** The spec's context section cites roughly 7,100 affiliate links
      managed by Lasso, while `products.json` holds 3,304 products and is
      described as "every product used on a live post". Confirm the difference is
      accounted for before treating 3,304 as complete
- [ ] **HUMAN** Confirm the export's provenance and that it is the final export,
      not a partial one

## 4. Import-time rules the spec fixes

These are not validation checks. They are conditions the import must satisfy, and
they hold regardless of which engine or tooling is chosen.

- [ ] Every post seeds as `status: "draft"`. Any status value present in the seed
      file is overridden. Nothing is public until it is reviewed
- [ ] Every product lands as `stock_status: 'unverified'` unless its current
      status has actually been checked. Amazon data was last synced December
      2023, and `/docs/AGENT_RULES.md` forbids treating a product as verified
      without a real check
- [ ] `price_at_export` is imported and stored, and never rendered. Amazon's
      operating agreement prohibits displaying a cached price
- [ ] `affiliate_url` is imported exactly as exported. `/docs/AGENT_RULES.md`
      places affiliate IDs permanently outside autonomous work — the import must
      not rewrite, normalise or re-tag them
- [ ] No product, ASIN, affiliate URL, stock status, image, merchant or product
      fact is invented to fill a gap. A missing field stays missing and is
      reported
- [ ] The import is re-runnable and reports what it would change before it
      changes it, so a bad export can be discarded rather than half-applied

## 5. Verification after import

- [ ] Row counts in each table match section 1
- [ ] Referential integrity holds: every `placements.post_slug` and
      `placements.product_id` resolves
- [ ] The `(post_slug, product_id)` unique constraint is enforced by the schema,
      not only by the validator
- [ ] No post has `status = 'live'`
- [ ] Spot-check several placements against the original export and confirm the
      blurb is the one belonging to that post, not another post's copy of the
      same product
- [ ] **HUMAN** Review a sample of imported posts and placements before any
      publication decision

## 6. Explicitly not decided here

Unspecified by `/docs/REBUILD_SPEC.md`, and unchanged from
`/docs/ARCHITECTURE_MIGRATION_CHECKLIST.md`:

- Database engine. The spec's `serial` and `timestamptz` imply PostgreSQL but it
  never names one
- ORM or query layer
- Migration and seeding tooling
- Schema-validation library. Section 2 describes checks, not an implementation
- Whether `seed/` is tracked in git

## 7. Dependencies

Seed import is blocked by the static-export constraint recorded in
`/docs/ARCHITECTURE_MIGRATION_CHECKLIST.md` section 2.1. `output: "export"` in
`next.config.ts` leaves no server runtime and no database access, so nothing can
read imported data until it is removed.
