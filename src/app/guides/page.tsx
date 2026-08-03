import type { Metadata } from "next";
import { GuideCard } from "@/components/guide-card";
import { guides } from "@/content/guides";

export const metadata: Metadata = {
  title: "Gift guides",
  description:
    "Short, opinionated gift guides for parents — sorted by what they say, not by price.",
};

export default function GuidesIndex() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
          Gift guides
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Short and opinionated. Each guide is a handful of ideas we&rsquo;d
          defend in person, with an honest note about who each one is wrong
          for.
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {guides.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} />
        ))}
      </div>

      <p className="mt-12 text-sm text-muted">
        More guides are in progress — Father&rsquo;s Day, retirement, and the
        first Christmas after a move.
      </p>
    </div>
  );
}
