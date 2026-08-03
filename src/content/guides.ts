/**
 * Guide content lives here as typed data, not as JSX.
 *
 * Every guide page renders from one of these objects, so adding a guide means
 * adding an entry — never a new bespoke layout. This is also the seam where a
 * CMS or MDX pipeline would slot in later.
 *
 * PLACEHOLDER CONTENT: the single guide below is illustrative sample copy for
 * the initial scaffold. The ideas are deliberately category-level rather than
 * specific branded products — we don't publish a product recommendation until
 * a real human has actually evaluated it.
 */

export type GiftIdea = {
  /** Stable anchor id, used for in-page links. */
  slug: string;
  /** The idea, phrased as the thing itself rather than a product category. */
  name: string;
  /** Indicative range, not a live price. Never presented as a current quote. */
  priceRange: string;
  /** Effort required, so someone can filter by what they can realistically do. */
  effort: "An afternoon" | "A week or two" | "A month of lead time";
  /** The emotional case — why this lands, in plain language. */
  whyItLands: string;
  /** Honest counterweight. Every idea has someone it's wrong for. */
  notFor: string;
};

export type Guide = {
  slug: string;
  title: string;
  /** Short label for cards and breadcrumbs. */
  shortTitle: string;
  recipient: string;
  occasion: string;
  /** Meta description and card summary. */
  summary: string;
  /** Opening framing shown above the ideas. */
  intro: string[];
  /** ISO date. Rendered as "Reviewed <month year>". */
  reviewed: string;
  ideas: GiftIdea[];
};

export const guides: Guide[] = [
  {
    slug: "moms-birthday",
    title: "Gifts for Mom's Birthday",
    shortTitle: "Mom's Birthday",
    recipient: "Mom",
    occasion: "Birthday",
    summary:
      "Six ideas that work because they show attention, not spend. Most cost under $100; two cost nothing but time.",
    intro: [
      "Most birthday gift guides assume the hard part is finding an object. It isn't. The hard part is that a gift is a message, and the message most of us are trying to send — I noticed you, I was paying attention, you are not just background in my life — is difficult to say out loud.",
      "So these are sorted by what they say, not by price. A few are free. One takes a month of lead time, which is the honest cost of the best thing on this list.",
    ],
    reviewed: "2026-08-01",
    ideas: [
      {
        slug: "her-story-recorded",
        name: "An hour of her story, recorded",
        priceRange: "Free – $100",
        effort: "An afternoon",
        whyItLands:
          "Ask her about a specific year — not 'tell me about your life,' but 'what was 1987 like for you?' — and record it. Most people have never once been formally asked to narrate their own history. The recording becomes the gift twice: once when you make it together, and again in twenty years.",
        notFor:
          "A parent who finds direct attention uncomfortable, or a relationship where an hour of open-ended talk would surface things neither of you wants to open on a birthday.",
      },
      {
        slug: "her-handwriting",
        name: "Her handwriting, made permanent",
        priceRange: "$40 – $150",
        effort: "A week or two",
        whyItLands:
          "Find a note she wrote you — a lunchbox scrap, a card, a shopping list — and have the actual handwriting engraved onto something she'll carry. It proves you kept it, which is the real message. The object is just the delivery mechanism.",
        notFor:
          "Someone who doesn't wear jewelry or carry a wallet. The engraving needs a surface she'll actually see on an ordinary Tuesday.",
      },
      {
        slug: "photos-off-the-phone",
        name: "The photos trapped on her phone, printed",
        priceRange: "$30 – $80",
        effort: "An afternoon",
        whyItLands:
          "She has four thousand photos she'll never look at again. Pick forty, put them in a real book, and write one line under each. The writing is the part that matters — a caption in your voice turns an album into a letter.",
        notFor:
          "A parent who's already deep into scrapbooking. You'd be doing worse a thing she does better.",
      },
      {
        slug: "a-standing-date",
        name: "A standing date, not a one-off",
        priceRange: "Free – $200",
        effort: "An afternoon",
        whyItLands:
          "One dinner is an event; the second Sunday of every month is a relationship. Put twelve recurring entries in both your calendars and give her the printed list. The gift is the commitment, and it's the only thing on this page that compounds.",
        notFor:
          "Anyone who can't confidently keep it. A broken standing date is worse than no standing date — this one carries real downside if you overpromise.",
      },
      {
        slug: "the-upgrade",
        name: "The upgrade she'd never buy herself",
        priceRange: "$50 – $200",
        effort: "A week or two",
        whyItLands:
          "Find the thing she touches every single day and has used a worn-out version of for a decade — the kitchen knife, the reading light, the pillow, the robe. Parents are relentless about not spending money on themselves. Doing it for her is a way of saying her ordinary comfort is worth money.",
        notFor:
          "Replacing something with sentimental history. Check that the worn-out version is merely old, not meaningful.",
      },
      {
        slug: "recipes-in-a-real-book",
        name: "Her recipes, in a real book",
        priceRange: "$25 – $120",
        effort: "A month of lead time",
        whyItLands:
          "Collect the dishes she makes without measuring, get her to talk you through each one, and have it printed and bound. This is the highest-effort idea here and the one people cry over. It also quietly solves a problem nobody wants to name out loud: those recipes currently exist in exactly one place.",
        notFor:
          "A last-minute gift. Done properly this takes weeks, and rushing it produces something visibly rushed.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}

export function formatReviewed(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
