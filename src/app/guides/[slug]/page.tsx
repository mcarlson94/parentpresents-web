import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GiftIdeaCard } from "@/components/gift-idea-card";
import { formatReviewed, getGuide, guides } from "@/content/guides";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.summary,
    openGraph: {
      title: guide.title,
      description: guide.summary,
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) notFound();

  return (
    <article>
      <header className="border-b border-line/70 bg-ivory">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/guides" className="transition-colors hover:text-ink">
              Gift guides
            </Link>
            <span aria-hidden="true" className="mx-2 text-line">
              /
            </span>
            <span className="text-ink">{guide.shortTitle}</span>
          </nav>

          <h1 className="mt-6 font-serif text-4xl leading-[1.15] tracking-tight text-balance text-ink sm:text-5xl">
            {guide.title}
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted">
            {guide.summary}
          </p>

          <p className="mt-8 text-sm text-muted">
            {guide.ideas.length} ideas · Reviewed{" "}
            <time dateTime={guide.reviewed}>
              {formatReviewed(guide.reviewed)}
            </time>
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-6 text-lg leading-relaxed text-ink/85">
          {guide.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-14 space-y-6">
          {guide.ideas.map((idea, index) => (
            <GiftIdeaCard key={idea.slug} idea={idea} index={index} />
          ))}
        </div>

        <aside className="mt-16 rounded-2xl border border-clay/25 bg-clay-soft/50 p-8">
          <h2 className="font-serif text-2xl leading-snug text-ink">
            If you only do one thing
          </h2>
          <p className="mt-4 leading-relaxed text-ink/85">
            Write the card by hand and say the specific thing — not
            &ldquo;thanks for everything,&rdquo; but the one memory you think
            about. Every idea above works better with it, and it works on its
            own without any of them.
          </p>
        </aside>

        <p className="mt-12 text-sm leading-relaxed text-muted">
          We don&rsquo;t take payment for placement, and price ranges are
          indicative rather than live quotes. If an idea here didn&rsquo;t land,
          we&rsquo;d rather hear about it than not.
        </p>
      </div>
    </article>
  );
}
