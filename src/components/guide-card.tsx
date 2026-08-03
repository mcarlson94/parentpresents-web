import Link from "next/link";
import type { Guide } from "@/content/guides";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="group relative rounded-2xl border border-line bg-ivory p-7 transition-colors hover:border-clay/40">
      <p className="text-xs tracking-[0.14em] text-muted uppercase">
        {guide.recipient} · {guide.occasion}
      </p>

      <h3 className="mt-3 font-serif text-2xl leading-snug text-ink">
        <Link href={`/guides/${guide.slug}`} className="after:absolute after:inset-0">
          {guide.title}
        </Link>
      </h3>

      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        {guide.summary}
      </p>

      <p className="mt-5 text-sm font-medium text-clay transition-colors group-hover:text-clay-deep">
        Read the guide
        <span aria-hidden="true" className="ml-1 inline-block">
          →
        </span>
      </p>
    </article>
  );
}
