import type { GiftIdea } from "@/content/guides";

export function GiftIdeaCard({
  idea,
  index,
}: {
  idea: GiftIdea;
  index: number;
}) {
  return (
    <article
      id={idea.slug}
      className="scroll-mt-24 rounded-2xl border border-line bg-ivory p-7 sm:p-9"
    >
      <div className="flex items-baseline gap-4">
        <span
          aria-hidden="true"
          className="font-serif text-2xl text-clay/40 tabular-nums"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-serif text-2xl leading-snug text-ink">
          {idea.name}
        </h3>
      </div>

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted">Typically</dt>
          <dd className="font-medium text-ink">{idea.priceRange}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted">Effort</dt>
          <dd className="font-medium text-ink">{idea.effort}</dd>
        </div>
      </dl>

      <p className="mt-5 leading-relaxed text-ink/85">{idea.whyItLands}</p>

      <p className="mt-5 border-l-2 border-sage/40 pl-4 text-[15px] leading-relaxed text-muted">
        <span className="font-medium text-sage">Skip it if — </span>
        {idea.notFor}
      </p>
    </article>
  );
}
