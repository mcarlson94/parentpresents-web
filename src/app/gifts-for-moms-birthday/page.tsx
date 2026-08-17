import Link from "next/link";
import { Chip } from "@/components/chip";
import { ImagePending } from "@/components/image-pending";
import { pageMetadata } from "@/lib/metadata";

/**
 * EXAMPLE GUIDE — design proof, not publishable content.
 *
 * Everything here is replaced once the product layer exists:
 *
 *   - picks are category-level placeholders, NOT product recommendations. No
 *     real product renders until it has verifiedDate + verifiedBy.
 *   - "Check price" is inert. It becomes <AffiliateLink /> once merchants are
 *     wired; there is deliberately no merchant href anywhere in this codebase.
 *   - the email block is presentation only.
 *
 * noindex until it carries verified products.
 */

export const metadata = pageMetadata({
  title: "Gifts for Mom's Birthday",
  description:
    "Birthday gifts for a mom who says she doesn't want anything — chosen for what she'll actually use, with an honest note on who each one is wrong for.",
  path: "/gifts-for-moms-birthday",
  noindex: true,
});

const picks = [
  {
    n: "01",
    name: "The daily thing, in its good version",
    band: "$50–100",
    take: "Find the object she touches every single morning — the mug, the kettle, the reading light, the peeler — and replace it with the version she'd never justify buying. The gift lands twice: once when she opens it, and again every day after, which is more than most presents manage.",
    fits: "A mom who quietly uses things until they fall apart.",
    skip: "Anyone particular about their kitchen. Replacing a favourite object with a better one is still replacing a favourite object.",
  },
  {
    n: "02",
    name: "A photo she's never seen printed",
    band: "Under $25",
    take: "Not the posed one from the wedding. The blurry one from a Tuesday. Almost every photo of your family now lives on a phone and will never be looked at again; putting one in a frame is the cheapest high-return gift on this list and the one most likely to end up on a shelf.",
    fits: "Basically every mom, which is rare enough to say out loud.",
    skip: "Someone who has genuinely run out of wall and shelf space — in which case a small album beats another frame.",
  },
  {
    n: "03",
    name: "A standing date, already booked",
    band: "$50–100",
    take: "The gift is the calendar entry, not the activity. Book the thing, put it in both your calendars, and hand her the confirmation. What she actually wants from you is time, and vague promises to visit more are worth roughly nothing by February.",
    fits: "A mom who says she doesn't want anything and means it.",
    skip: "If you live far enough away that you'd be committing to something you can't do. A cancelled plan is worse than no plan.",
  },
  {
    n: "04",
    name: "The household annoyance, removed",
    band: "$100–250",
    take: "Every house has one job she's been putting off for two years — the gutters, the deep clean, the thing on the stairs. Pay someone to do it and it stops being her problem. Unromantic, and reliably the gift people bring up years later.",
    fits: "A parent whose to-do list has started to outrun her weekends.",
    skip: "A mom who takes real pride in doing her own upkeep. For plenty of people the work is the point, and outsourcing it reads as a comment on her age.",
  },
  {
    n: "05",
    name: "Something good that gets used up",
    band: "$25–50",
    take: "Proper olive oil, the tea she rations, actually nice hand cream. Consumables dodge the two failure modes of parent gifts at once: they don't need storage space, and she can't feel guilty about not displaying them. Buy one excellent thing rather than a basket of six adequate ones.",
    fits: "Small flats, minimalists, and anyone who has said the words 'I don't need more stuff.'",
    skip: "If you want her to have something to keep. This is a gift that's gone by March, on purpose.",
  },
  {
    n: "06",
    name: "The letter, written properly",
    band: "Free",
    take: "Sit down and write what she actually did for you — specifically, with examples, not 'thanks for everything.' It costs nothing, it's the hardest thing on this list, and it is the one she'll still have in a drawer in fifteen years. Pair it with anything above so there's also a thing to unwrap.",
    fits: "Anyone who has been meaning to say something and keeps not saying it.",
    skip: "Nobody, honestly. But send it alongside a real gift if your family treats birthdays as a present-opening occasion.",
  },
];

const faqs = [
  {
    q: "She says she doesn't want anything. Now what?",
    a: "Take her literally about objects and ignore her about attention. That points at time and consumables — a booked date, a job taken off her hands, one excellent thing she'll finish — rather than something she has to find a shelf for.",
  },
  {
    q: "How much should I actually spend?",
    a: "Less than you think, and earlier than you think. The gap between a £25 gift that shows you were listening and a £200 one that didn't is enormous, and it runs in the direction you'd hope. Rushing is what costs money.",
  },
  {
    q: "Is a gift card a cop-out?",
    a: "For a birthday, mostly yes — it's the one gift that shows its own price and no thought. The exception is a card to somewhere specific she already loves, paired with something small and physical so there's a thing to open.",
  },
];

const related = [
  { label: "Gifts for lawn lovers", href: "/gifts-for-lawn-lovers" },
  { label: "Cooking gifts for Mom", href: "/cooking-gifts-for-mom" },
  { label: "Birthday wishes for Mom", href: "/birthday-wishes-for-mom" },
  {
    label: "Things to do with Mom on her birthday",
    href: "/things-to-do-with-mom-on-her-birthday",
  },
];

export default function MomsBirthdayGuide() {
  return (
    <article>
      <div className="mx-auto max-w-3xl px-gutter pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-rose-deep">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-rule">
              /
            </li>
            <li>
              <Link href="/mom" className="hover:text-rose-deep">
                Gifts for Mom
              </Link>
            </li>
            <li aria-hidden="true" className="text-rule">
              /
            </li>
            <li className="text-ink">Her birthday</li>
          </ol>
        </nav>

        <header className="mt-7">
          <div className="flex flex-wrap items-center gap-2">
            <Chip variant="label" href="/occasions">
              Birthdays
            </Chip>
            {/* NOT the "verified" variant. These picks are unverified
                placeholders, and a verified badge on them would be exactly the
                false trust signal the verification rule exists to prevent. */}
            <Chip variant="flag">Example content</Chip>
          </div>

          <h1 className="font-display mt-5 text-4xl">
            Gifts for Mom&rsquo;s birthday
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted">
            For the mom who insists she doesn&rsquo;t want anything, buys
            whatever she needs herself, and would still like you to have thought
            about it.
          </p>

          <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <span>
              By{" "}
              <span className="font-medium text-ink">
                the ParentPresents team
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Published <time dateTime="2026-08-16">16 Aug 2026</time>
            </span>
          </p>
        </header>

        {/* Disclosure sits above the first affiliate link, in plain language. */}
        <aside className="mt-8 rounded-card border border-rose/35 bg-rose-soft/60 px-5 py-4 text-sm leading-relaxed text-ink">
          We earn a commission if you buy through some of these links, at no
          extra cost to you. We choose what goes on the list before we look at
          what it pays, and we say so when we haven&rsquo;t handled something
          ourselves.
        </aside>

        <div className="mt-10 space-y-5 text-lg leading-relaxed">
          <p>
            The hard part about your mom&rsquo;s birthday isn&rsquo;t that
            she&rsquo;s fussy. It&rsquo;s that she has reached the age where she
            buys what she needs the week she needs it, so the obvious gaps
            you&rsquo;d normally shop into are already filled.
          </p>
          <p>
            What&rsquo;s left is the stuff she won&rsquo;t buy herself: the
            upgraded version of something ordinary, the job she&rsquo;s
            dreading, and your time. Everything below is one of those three.
          </p>
        </div>

        <nav aria-label="On this page" className="mt-9 border-y border-rule py-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
            <li>
              <a href="#picks" className="text-blue-deep hover:underline">
                The picks
              </a>
            </li>
            <li>
              <a href="#compare" className="text-blue-deep hover:underline">
                Compare
              </a>
            </li>
            <li>
              <a href="#faq" className="text-blue-deep hover:underline">
                Questions
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Picks */}
      <section id="picks" className="mx-auto max-w-3xl scroll-mt-6 px-gutter">
        <h2 className="font-display mt-14 text-2xl">What we&rsquo;d actually buy</h2>

        <div className="mt-8 space-y-6">
          {picks.map((pick) => (
            <article
              key={pick.n}
              className="rounded-card border border-rule bg-surface p-6 sm:p-7"
            >
              <div className="sm:flex sm:gap-7">
                <ImagePending className="mb-5 w-full shrink-0 sm:mb-0 sm:w-40" />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display-sm text-lg text-rose-deep">
                      {pick.n}
                    </span>
                    <Chip variant="price" size="sm">
                      {pick.band}
                    </Chip>
                  </div>

                  <h3 className="font-display-sm mt-2 text-xl">{pick.name}</h3>

                  <p className="mt-3 leading-relaxed">{pick.take}</p>

                  <dl className="mt-4 space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-blue-deep">
                        Why it fits
                      </dt>
                      <dd className="text-muted">{pick.fits}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-blue-deep">
                        Skip it if
                      </dt>
                      <dd className="text-muted">{pick.skip}</dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    {/* Inert — becomes <AffiliateLink /> once merchants are wired. */}
                    <span
                      className="inline-flex cursor-not-allowed items-center rounded-control bg-rose-deep px-5 py-2.5 text-sm font-semibold text-white opacity-55"
                      aria-disabled="true"
                    >
                      Check price
                    </span>
                    <span className="text-xs text-muted">
                      Merchant not wired yet
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="mx-auto max-w-3xl scroll-mt-6 px-gutter">
        <h2 className="font-display mt-14 text-2xl">Side by side</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-rule">
                <th scope="col" className="py-3 pr-4 font-semibold">
                  Gift
                </th>
                <th scope="col" className="py-3 pr-4 font-semibold">
                  Price
                </th>
                <th scope="col" className="py-3 font-semibold">
                  Best for
                </th>
              </tr>
            </thead>
            <tbody>
              {picks.map((pick) => (
                <tr key={pick.n} className="border-b border-rule">
                  <th scope="row" className="py-3 pr-4 font-normal">
                    {pick.name}
                  </th>
                  <td className="py-3 pr-4 whitespace-nowrap text-muted">
                    {pick.band}
                  </td>
                  <td className="py-3 text-muted">{pick.fits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Email capture — presentation only. */}
      <section className="mx-auto mt-14 max-w-3xl px-gutter">
        <div className="rounded-card border border-blue/30 bg-blue-soft/60 p-7 sm:p-9">
          <h2 className="font-display text-2xl">
            Never forget a parent&rsquo;s birthday
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">
            Tell us the date once. Two weeks out we&rsquo;ll email a reminder
            with a short list of ideas — no countdown, no daily nagging.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:max-w-md">
            <div
              className="h-11 rounded-control border border-rule bg-surface"
              aria-hidden="true"
            />
            <span
              className="inline-flex cursor-not-allowed items-center justify-center rounded-control bg-blue-deep px-5 py-2.5 text-sm font-semibold text-white opacity-55"
              aria-disabled="true"
            >
              Save this date
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">Form not wired up yet.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-6 px-gutter">
        <h2 className="font-display mt-14 text-2xl">Questions</h2>
        <dl className="mt-6 divide-y divide-rule border-y border-rule">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-5">
              <dt className="font-display-sm text-lg">{faq.q}</dt>
              <dd className="mt-2 leading-relaxed text-muted">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-3xl px-gutter">
        <h2 className="font-display mt-14 text-2xl">Related</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {related.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-card border border-rule bg-surface px-5 py-4 font-medium text-ink transition-colors hover:border-rose hover:bg-rose-soft/40 hover:text-rose-deep"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
