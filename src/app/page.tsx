import Link from "next/link";
import { GuideCard } from "@/components/guide-card";
import { guides } from "@/content/guides";

const principles = [
  {
    title: "Six ideas, not sixty",
    body: "A list of sixty products is a list nobody finishes. We publish short guides and cut anything we wouldn't defend in person.",
  },
  {
    title: "We say who it's wrong for",
    body: "Every idea includes the case against it. A recommendation that fits everyone fits nobody, and pretending otherwise is how gift guides lose trust.",
  },
  {
    title: "Effort is a listed cost",
    body: "The best gifts here cost time, not money. We label that honestly up front so you can pick something you'll actually finish.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line/70 bg-ivory">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.16em] text-clay uppercase">
              For anyone who keeps meaning to
            </p>

            <h1 className="mt-6 font-serif text-4xl leading-[1.12] tracking-tight text-balance text-ink sm:text-6xl">
              Show your parents they matter — while you still can tell them in
              person.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
              You have a finite number of birthdays left with them, and it&rsquo;s
              a smaller number than it feels like. We help you spend those
              occasions on something that actually says what you mean.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/guides/moms-birthday"
                className="inline-flex items-center justify-center rounded-full bg-clay px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-clay-deep"
              >
                Start with Mom&rsquo;s birthday
              </Link>
              <Link
                href="#why"
                className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/30 hover:bg-cream"
              >
                Why we built this
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="why" className="scroll-mt-20">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid gap-12 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink">
              Why we exist
            </h2>

            <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-ink/85">
              <p>
                Somewhere in your twenties the relationship quietly inverts.
                Your parents stop being the people managing your life and become
                people you have to choose to make time for. Most of us are bad
                at the transition, not because we don&rsquo;t care, but because
                nothing forces the issue until something does.
              </p>
              <p>
                Birthdays and holidays are the few moments the calendar hands
                you an excuse to say something. Which is why it&rsquo;s a shame
                that the internet&rsquo;s answer to &ldquo;what should I get my
                mom&rdquo; is forty affiliate links to a candle.
              </p>
              <p className="border-l-2 border-clay pl-6 font-serif text-xl leading-relaxed text-ink italic">
                We&rsquo;re not trying to sell you a gift. We&rsquo;re trying to
                make it easy to tell your parents they mattered, on a day when
                saying it outright would feel like too much.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How we pick */}
      <section id="how" className="scroll-mt-20 border-y border-line/70 bg-ivory">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink">
            How we pick
          </h2>

          <ul className="mt-12 grid gap-10 sm:grid-cols-3">
            {principles.map((principle) => (
              <li key={principle.title}>
                <h3 className="font-serif text-xl leading-snug text-ink">
                  {principle.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">
                  {principle.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Guides */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink">
              Start here
            </h2>
            <Link
              href="/guides"
              className="text-sm font-medium text-clay transition-colors hover:text-clay-deep"
            >
              All guides
              <span aria-hidden="true" className="ml-1">
                →
              </span>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {guides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
