# Product Verification Procedure and the `stock_status` Publication Gate

Derived strictly from `/docs/REBUILD_SPEC.md` and `/docs/AGENT_RULES.md`. This
document is a procedure, not an implementation. It introduces no schema the spec
does not already define, and it does not decide anything the spec leaves open —
open questions are collected in §9 for human decision.

`/docs/REBUILD_SPEC.md` is authoritative. Where this procedure and the spec
disagree, the spec wins.

**Why this exists.** The spec records that Amazon product data was last synced in
**December 2023**. On a 50-product guide it says to expect a meaningful share of
dead or out-of-stock ASINs, and states the consequence plainly: *"Publishing 50
links where a dozen are broken is worse than publishing nothing."* The three
highest-search-traffic guides in the rebuild order — `gifts-for-lawn-lovers`,
`gifts-for-back-pain`, `gifts-for-farmer-dad` — carry 50 products each. This
procedure is what stands between those guides and shipping broken links to the
traffic they still earn.

**Current state.** No product data exists in this repository yet. There is no
`seed/` folder and no `src/data/`, so nothing is verifiable today; issue #14
covers supplying the export. This procedure is written ahead of the data
deliberately, so that the gate exists before the first guide is prepared for
review rather than after.

---

## 1. What verification is, and what it is not

Verification answers exactly one question per product: **as of right now, can a
reader follow this link and buy this thing?**

It does **not** re-price the product, re-describe it, change its merchant, or
change its affiliate URL. It sets `stock_status`, refreshes `last_synced`, and
nothing else.

Two rules from `/docs/AGENT_RULES.md` bound the whole procedure:

- *"Never invent a product, ASIN, affiliate URL, stock status, product image,
  merchant, or product fact."*
- *"A product must not be treated as verified or published as available unless
  its current status has actually been checked through an approved source or by
  a human."*

An unchecked product is not `in_stock`. It is `unverified`. The absence of
evidence is never evidence of availability.

---

## 2. The four `stock_status` values

The spec defines `stock_status` on the `products` table with exactly these four
values and a default of `unverified`:

```text
stock_status  text default 'unverified'  -- in_stock | oos | dead | unverified
```

No fifth value may be introduced without amending the spec.

### `unverified` — the default, and the only honest starting state

Every product enters the system as `unverified`. This is the spec's column
default, not a choice made here.

**Evidence required:** none. It is the absence of a check.

**Consequence:** blocks publication (§4). At import, all products are
`unverified`, therefore no post is publishable until verification has run. That
is the intended behaviour, not a problem to work around.

A product also returns to `unverified` when its check goes stale (§6) or when
the check itself was inconclusive — a timeout, a rate-limit, an ambiguous or
unparseable response. **An inconclusive check is recorded as `unverified`, never
as `in_stock`.**

### `in_stock` — buyable right now

**Evidence required:** a successful check from an approved source (§3) that
confirms, at the time of the check, that the item exists and is available for
purchase. Both of:

1. the product resolves — the identifier still corresponds to a live listing; and
2. the listing is purchasable, not merely present.

**Consequence:** the only value that permits publication.

### `oos` — exists, not currently buyable

**Evidence required:** a successful check confirming the listing resolves but
is not currently purchasable — out of stock, unavailable, or with no buyable
offer.

`oos` is distinguished from `dead` by one thing: the listing still exists, so the
condition may reverse without any editorial action. Treat it as temporary but
not self-healing — nothing changes on the site until a later check moves it.

**Consequence:** does not block publication, but the product must not be
presented as buyable (§5).

### `dead` — gone

**Evidence required:** a successful check confirming the identifier no longer
resolves to a listing at all — removed, delisted, or never resolvable from the
stored identifier.

**Consequence:** blocks publication (§4).

### One product, many posts

`stock_status` lives on `products`, not on `placements`. The spec's seed data is
3,304 products across 3,429 placements, so a product can appear on several
guides, and the spec is explicit that this is the point of the `placements`
table.

Two consequences that must not be missed:

- A product is verified **once**, and that single result applies to every post it
  appears on. Verification is keyed on the product, never on the placement.
- A product going `dead` can therefore break **more than one already-live post**
  at the same time. Any status change to `dead` or `oos` must be evaluated
  against every post that has a placement for that product, not just the post
  that prompted the check.

---

## 3. Approved sources for a check

The spec names the sources: *"Verify against the Amazon Product Advertising API,
or check manually."* There are exactly two.

### Amazon Product Advertising API (PA-API)

The preferred source for `network = 'amazon'` products: it is the only one that
can check 50 products without 50 acts of human attention.

- **HUMAN** — obtaining PA-API credentials is a human action. It requires
  Associates credentials and an account in good standing, and Amazon's current
  eligibility terms must be read by a human at the time of application rather
  than assumed from this document. `/docs/AGENT_RULES.md` forbids autonomous
  runs from changing production secrets or purchasing services, so an autonomous
  run may neither obtain nor install these credentials.
- **HUMAN** — confirming that the intended use complies with Amazon's operating
  agreement, including its caching and display terms.
- Until credentials exist, every Amazon product must be checked manually or
  remain `unverified`. There is no third option, and no autonomous substitute.

### A human checking manually

Always available, always sufficient, and the only route for
`network = 'other'` products — the spec's `network` column is
`amazon | other`, and PA-API cannot check a non-Amazon merchant. Non-Amazon
products have no automated path at all and must be checked by a human or left
`unverified`.

A manual check records the same two facts as an automated one: does the listing
resolve, and is it purchasable.

### Not approved

Scraping a merchant page, inferring availability from an HTTP status code,
inferring it from the age of `last_synced`, or carrying a status forward because
the product "was fine last time". None of these is a check. Each would set
`stock_status` from something other than the product's current state, which is
the definition of inventing a stock status.

---

## 4. The publication gate

Stated plainly, and this is the operative rule of the document:

> **A post may not move to `status: 'live'` while any of its placements points at
> a product whose `stock_status` is `unverified` or `dead`.**

The spec's `posts.status` is `draft | in_review | live`, and public pages query
`where status = 'live'`. The gate is evaluated at the `in_review` → `live`
transition, and re-evaluated whenever a placement is added to a live post or a
product on a live post changes status.

| `stock_status` | Blocks `live`? | Rationale |
|---|---|---|
| `in_stock` | No | Checked and buyable |
| `oos` | No — but see §5 | Checked; exists; must not be presented as buyable |
| `dead` | **Yes** | A link to nothing |
| `unverified` | **Yes** | No one has checked; `/docs/AGENT_RULES.md` forbids publishing unverified Amazon products |

The gate is a property of the **post**, not of the individual product: one
`unverified` product among fifty blocks the whole post. This follows directly
from the spec — publishing a guide where a share of the links are broken is worse
than publishing nothing — and from `/docs/AGENT_RULES.md`: *"Do not publish a
rebuilt guide containing unverified product links."*

The gate is not satisfied by a majority. There is no threshold, no percentage,
and no "good enough". Every placement on the post is `in_stock` or `oos`, or the
post stays out of `live`.

If a live post later fails the gate — a product on it goes `dead`, or its check
goes stale — that is a production defect, not a content task. Handle it under §5
and §6 at the priority `/docs/AUTOPILOT.md` gives broken affiliate
monetization, and record it. Do not leave a live post serving a dead link while
waiting for a rebuild task to be scheduled.

---

## 5. What happens to an `oos` or `dead` product on an otherwise good guide

### Never delete the placement row

This is the constraint that decides the rest of this section, and it comes from
the spec's own schema. `clicks.placement_id` references `placements(id)`.
Deleting a placement therefore destroys or orphans the click history attributed
to it — the per-post attribution data that the spec says is the entire reason
`/go/[placementId]` exists, because *"Amazon's own reporting will not tell you."*
`/docs/AGENT_RULES.md` separately forbids deleting production data.

So: **a product failing verification is removed from the rendered page, not from
the database.** The placement row, its `position`, and its `blurb` all survive.
"Removed from the placement list" means removed from what the reader sees.

### `dead` → suppress from render

Render nothing for it. No card, no blurb, no buy control, no image. A `dead`
product is a recommendation the reader cannot act on in any form, and leaving it
visible-but-unlinked advertises a gift that no longer exists.

Renumber nothing. `position` is a stored ordering, not a rendered count; the
remaining placements render in `position` order with the suppressed one absent.
Guide copy must not depend on a product count — a heading that says "50 picks"
becomes a lie the moment one is suppressed. Prefer headings that do not count.

### `oos` → suppress from render by default; unlinked is an editorial override

Default to suppressing, for the same reader-facing reason as `dead`: a card with
no working buy control is a dead end.

Because `oos` may reverse, the placement is retained (as above) and the product
stays in the verification rotation, so it can return to the page on a later
check with no editorial work.

An editor may override this and keep an `oos` product rendered **unlinked** —
blurb visible, no buy control, availability stated honestly in the copy — where
the write-up carries editorial value that survives the item being unavailable.
If it is rendered at all:

- no `/go/[placementId]` link and no outbound merchant link of any kind;
- the reader is told it is currently unavailable, in the site's own voice, not
  left to discover it by clicking;
- the card is never presented as a live recommendation.

This override is a human editorial decision. An autonomous run may not take it
(§7).

### Never substitute a replacement product

`/docs/AGENT_RULES.md` forbids inventing replacement products, and lists
"Invent replacement products" among the things never to do autonomously. A
suppressed product is left suppressed. Sourcing a genuine replacement is human
editorial work, subject to this same procedure before it can be published, and
it is a different task from verification.

### Never rewrite `affiliate_url`

Verification reads `affiliate_url`; it never writes it.
`/docs/AGENT_RULES.md` forbids changing affiliate IDs. A product whose stored
URL no longer resolves is `dead` — it is not a URL to be repaired, and a
`dead` result is never to be worked around by constructing a new link.

---

## 6. Shelf life — a verification result expires

A check is a statement about one moment. The spec's own history is the argument:
product data synced in December 2023 was accurate when it was written and is
now, by the spec's own account, expected to contain dead and out-of-stock ASINs
across the catalogue. Every result in this system is on the same trajectory from
the moment it is recorded.

`last_synced timestamptz` on `products` is the timestamp of the most recent
check. It is what shelf life is measured against.

**Proposed cadence — requires human ratification (§9).** The spec sets no
interval, so these are proposals, not spec requirements:

| Product's situation | Refresh `last_synced` at least every | Reasoning |
|---|---|---|
| On a live post, `in_stock` | 30 days | Bounds how long a live guide can carry a silently-broken link |
| On a live post, `oos` | 14 days | The condition can reverse; a shorter loop returns it to the page sooner |
| Not on any live post | On demand, before the post's gate is evaluated | Nothing is exposed to readers, so scheduled checking buys nothing |
| Before any `in_review` → `live` transition | Always, regardless of age | The gate is evaluated on a current result, never a cached one |

**Expiry behaviour.** When a product's `last_synced` passes its interval, the
result is stale and the product is treated as `unverified` for gate purposes.
Whether staleness *writes* `unverified` into the column or is computed at read
time from `last_synced` is an implementation decision left to whoever builds the
data-access layer (issue #18); both satisfy this procedure, and the visible
behaviour must be identical either way.

A stale `in_stock` is not an `in_stock`. Restating §4's intent: a post may go
`live` only on results that are current under this table.

**Note for whoever implements this.** The spec's `products` table has one
timestamp, `last_synced`, and no column recording *which* source produced a
check or *who* performed it. A manual human check and an automated PA-API check
are therefore indistinguishable in the stored data. This procedure does not add
columns — see §9.

---

## 7. What an autonomous run may and may not do

### May

- Read and report `stock_status` and `last_synced` as they are currently stored.
- Record a status that follows from a check actually performed through an
  approved source (§3), including recording `unverified` for an inconclusive
  check.
- Identify which products on which posts are stale under §6, and which posts
  consequently fail the §4 gate.
- **Block a publication.** Refusing to move a post to `live` is always available
  and never requires approval.
- Flag a live post that has fallen out of compliance, and surface it for human
  attention.
- Suppress a `dead` product from render on an already-live post to stop serving a
  broken link — a reversible, non-destructive change that improves compliance
  with §4.
- Create or update tasks in the task queue, as `/docs/AGENT_RULES.md` permits.

### May not

- **Assert availability it has not checked.** No inferring `in_stock` from
  `last_synced`, from a previous status, from a sibling product, from a
  successful HTTP response, or from the absence of evidence to the contrary.
- **Publish.** Moving a post to `live` is a human decision. Verification clears a
  gate; it does not open it.
- **Substitute a product** for one that failed (§5).
- **Rewrite `affiliate_url`** or change any affiliate ID (§5).
- **Obtain, install, or change PA-API credentials** or any production secret (§3).
- **Spend money or purchase services** to obtain a check.
- **Delete a placement, a product, or a click row** (§5).
- **Take the `oos` unlinked-render override** (§5) — that is editorial judgment.
- **Mark verification successful when it failed.** `/docs/AGENT_RULES.md` lists
  this among the things never to do; a failed or partial verification pass is
  reported as failed.

When the correct action falls on the "may not" side, `/docs/AGENT_RULES.md`
gives the response: create a recommendation for human review instead of
executing it.

---

## 8. Price is never displayed — regardless of verification outcome

`price_at_export` is stored and never rendered. The spec: *"Product price is
stored but must not be rendered. Amazon's operating agreement prohibits
displaying a cached price. Show the button, not the number."*

Verification does not change this in either direction:

- A product verified `in_stock` still does not get its price displayed.
- A successful PA-API check may return a current price. That price is not
  displayed either. Verification consumes availability, not price.
- `price_at_export` is a December-2023 figure. It is historical data for internal
  reference only, and its staleness is not the reason it is withheld — the
  operating agreement is.

`/docs/AGENT_RULES.md` restates it as a standing prohibition: *"Do not display
cached Amazon prices."*

**Flagged for human decision (§9):** the current example route
`/gifts-for-moms-birthday` renders price *bands* ("Under $25", "$50–100") as
chips, and price bands are part of the design system described in `CLAUDE.md`. A
band is coarser than a price but is still derived from stored price data. Whether
a band counts as displaying a cached price under Amazon's operating agreement is
not a question this document can settle, and the answer determines whether price
bands can be driven from `price_at_export` at all. It is raised here rather than
guessed at.

---

## 9. Open questions — human decision required

None of these is settled by `/docs/REBUILD_SPEC.md`, and none is decided here.

1. **Refresh cadence.** The 30-day / 14-day intervals in §6 are proposals. The
   spec names no interval. A human must ratify these or replace them.
2. **Price bands.** Whether rendering a price band derived from
   `price_at_export` is permitted under Amazon's operating agreement (§8). This
   blocks driving the existing band chips from real product data.
3. **No provenance column.** `products` records `last_synced` but not the source
   or the checker (§6). A manual check and a PA-API check are indistinguishable
   once stored. Adding a column would amend the spec's data model, so it is not
   proposed here — but the gap should be an explicit decision rather than an
   oversight.
4. **Stale-as-`unverified`: stored or computed.** Left to issue #18, as noted in
   §6, but it should be decided deliberately rather than by whichever code lands
   first.
5. **PA-API eligibility and cost.** Whether credentials can be obtained under
   Amazon's current terms, and at what rate limit, determines whether the three
   50-product guides can be verified automatically or need roughly 150 manual
   checks. This materially changes the effort estimate on every rebuild task and
   is unknown until a human checks.
6. **Where the verification run lives.** A scheduled job, an `/admin` action, or
   a manual script. The spec puts post and product editing behind `/admin` but
   does not describe a verification runner, and the platform decisions in issue
   #13 are still in review.
7. **Non-Amazon products.** The spec's `network` column allows `other`, but the
   seed data's composition is unknown until the export lands (issue #14). If a
   material share of the 3,304 products are non-Amazon, they have no automated
   verification path at all (§3) and the manual workload is larger than the
   PA-API question alone suggests.

---

## 10. Checklist for preparing one guide

Applies to any post being taken from `draft` to `live`. Nothing here can run
until the seed data exists (issue #14).

- [ ] List every placement on the post, in `position` order.
- [ ] Resolve each placement to its product and read `stock_status` and
      `last_synced`.
- [ ] Check every product whose result is missing or stale under §6, through an
      approved source only (§3).
- [ ] Record each result: `in_stock`, `oos`, `dead`, or `unverified` for an
      inconclusive check. Refresh `last_synced` on every product actually
      checked.
- [ ] Confirm zero products are `unverified` or `dead` (§4). If any are,
      **stop** — the post does not go live.
- [ ] For each `dead` product: suppress from render, keep the placement row
      (§5). Check every *other* post carrying that product and flag any that is
      already live.
- [ ] For each `oos` product: suppress from render by default, or apply the
      human editorial unlinked override (§5).
- [ ] Confirm no replacement product was substituted for a failure (§5).
- [ ] Confirm no `affiliate_url` was modified (§5).
- [ ] Confirm no price and no price-derived value is rendered (§8).
- [ ] Confirm every remaining buy control routes through `/go/[placementId]` and
      carries `rel="nofollow sponsored"` and `target="_blank"`, per the spec.
- [ ] Confirm the post's copy does not state a product count that suppression
      has made false (§5).
- [ ] **HUMAN** — the `in_review` → `live` transition itself (§7).
- [ ] Redirect the post's legacy URL in the same sitting it goes live, per
      `/docs/REBUILD_SPEC.md` and `/docs/LEGACY_URL_PRESERVATION_CHECKLIST.md`.
      Never have both domains serving the same content at once.
