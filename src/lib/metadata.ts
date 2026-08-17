import type { Metadata } from "next";

/**
 * Canonical domain is parentpresents.com — plural, apex, no www, no trailing
 * slash. The singular "parentpresent.com" appears in the old WordPress export
 * and is wrong.
 */
export const SITE_URL = "https://parentpresents.com";
export const SITE_NAME = "ParentPresents";

interface PageMetaInput {
  title: string;
  description: string;
  /** Root-relative path, no trailing slash. "/" for the homepage. */
  path: string;
  /** Set on utility pages that should stay out of the index. */
  noindex?: boolean;
}

/**
 * Builds a page's Metadata and enforces the two limits that silently degrade
 * search results when crossed. These throw at build time on purpose — a
 * truncated title is the kind of defect that ships unnoticed for months.
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: PageMetaInput): Metadata {
  if (title.length > 60) {
    throw new Error(
      `Title exceeds 60 characters (${title.length}): "${title}". ` +
        `Titles are truncated in search results past ~60.`,
    );
  }

  if (description.length > 155) {
    throw new Error(
      `Description exceeds 155 characters (${description.length}) on "${title}".`,
    );
  }

  const canonical = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
    },
  };
}
