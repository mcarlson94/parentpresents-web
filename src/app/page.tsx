import Link from "next/link";
import { Chip } from "@/components/chip";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "ParentPresents — Gifts your parents will actually use",
  description:
    "Gift ideas for the people who raised you. Short, opinionated guides that say who each idea is wrong for, and never take payment for placement.",
  path: "/",
});

const recipients = [
  "Mom",
  "Dad",
  "Grandma",
  "Grandpa",
  "Both parents",
  "In-laws",
];

const interests = [
  "Gardening",
  "Golf",
  "Fishing",
  "Cooking",
  "Reading",
  "Puzzles",
  "Travel",
  "Coffee",
  "Wine",
  "Woodworking",
  "Birdwatching",
  "Pickleball",
];

/**
 * How-we-pick pillars. These are the trust claims the whole brand rests on, so
 * they sit above the fold-ish rather than buried on an /about-us page: the
 * reader has been burned by affiliate listicles and needs a reason to believe
 * this one is different.
 */
const pillars = [
  {
    title: "We say who it's wrong for",
    body: "Every idea on this site names the parent who shouldn't get it. A recommendation that fits everyone fits nobody, and you already know which one your mom is.",
  },
  {
    title: "Nobody pays to be here",
    body: "We choose what goes on a list before we look at what it pays. Some links earn us a commission; none of them bought their place.",
  },
  {
    title: "Short lists, not fifty options",
    body: "You are not browsing for fun. Six real ideas with a reason attached beats a scroll of forty products nobody has touched.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — the mission, stated once, without being morbid about it. */}
      <section className="border-b border-rule bg-surface">
        <div className="mx-auto max-w-6xl px-gutter py-16 sm:py-24">
          <div className="max-w-2xl">
            <Chip variant="verified" size="sm">
              Gifts for the people who raised you
            </Chip>

            <h1 className="font-display mt-5 text-4xl sm:text-[3.375rem]">
              Show them they{" "}
              <span className="text-rose-deep">actually matter</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted">
              You get a finite number of birthdays with your parents, and
              you&rsquo;ve probably spent a few of them on a candle from the
              chemist. We&rsquo;re not going to be weird about the mortality
              thing — we&rsquo;re just going to help you find something that
              proves you were paying attention.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/gifts-for-moms-birthday"
                className="inline-flex items-center rounded-control bg-rose-deep px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Start with Mom&rsquo;s birthday
              </Link>
              <Link
                href="/how-we-pick"
                className="inline-flex items-center rounded-control border border-rule px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-rose hover:bg-rose-soft/40 hover:text-rose-deep"
              >
                How we pick
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, plainly. */}
      <section className="border-b border-rule bg-page">
        <div className="mx-auto max-w-6xl px-gutter py-14">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl">Why this exists</h2>
            <p className="mt-4 text-lg leading-relaxed">
              Most gift sites are built to rank. This one is built for the
              specific, slightly guilty feeling of being twenty-six, loving your
              parents, and having no idea what to buy them — because they buy
              their own stuff now and they say they don&rsquo;t want anything.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              The point was never the object. It&rsquo;s the evidence that you
              thought about them for longer than four minutes. We&rsquo;re here
              to make that easy while it&rsquo;s still easy.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <li
                key={pillar.title}
                className="rounded-card border border-rule bg-surface p-6"
              >
                <h3 className="font-display-sm text-lg">{pillar.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {pillar.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Routing. Identity and interest, never price — price is a filter, not a
          taxonomy, and the price-tier pages historically drew a fraction of the
          traffic these do. */}
      <section className="mx-auto max-w-6xl px-gutter py-14">
        <h2 className="font-display text-2xl">Who are you shopping for?</h2>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {recipients.map((recipient) => (
            <li key={recipient}>
              <Chip variant="label" href="/mom">
                {recipient}
              </Chip>
            </li>
          ))}
        </ul>

        <h2 className="font-display mt-12 text-2xl">
          Or start with what they&rsquo;re into
        </h2>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {interests.map((interest) => (
            <li key={interest}>
              <Chip variant="label" href="/gifts-for-lawn-lovers">
                {interest}
              </Chip>
            </li>
          ))}
        </ul>

        <p className="mt-12 max-w-2xl rounded-card border border-rule bg-sunk px-5 py-4 text-sm leading-relaxed">
          <strong className="font-semibold">Early build.</strong> Foundation and
          visual direction only. The chips above are placeholders — the only
          guide wired up so far is{" "}
          <Link
            href="/gifts-for-moms-birthday"
            className="text-blue-deep underline"
          >
            Gifts for Mom&rsquo;s birthday
          </Link>
          .
        </p>
      </section>
    </>
  );
}
