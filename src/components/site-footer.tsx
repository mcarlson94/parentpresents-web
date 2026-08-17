import Link from "next/link";

/**
 * The footer carries the full taxonomy on purpose: it is the site's internal
 * linking backbone and the crawl path to every hub.
 */
const columns = [
  {
    heading: "Who it's for",
    links: [
      { label: "Mom", href: "/mom" },
      { label: "Dad", href: "/dad" },
      { label: "Grandma", href: "/grandma" },
      { label: "Grandpa", href: "/grandpa" },
      { label: "In-laws", href: "/in-laws" },
    ],
  },
  {
    heading: "By interest",
    links: [
      { label: "Gardening", href: "/gifts-for-lawn-lovers" },
      { label: "Golf", href: "/golf-dad-gifts" },
      { label: "Fishing", href: "/gifts-for-fishing-dads" },
      { label: "Puzzles", href: "/gifts-for-puzzle-lovers" },
      { label: "Cooking", href: "/cooking-gifts-for-mom" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Birthday wishes for Mom", href: "/birthday-wishes-for-mom" },
      {
        label: "Things to do with Mom",
        href: "/things-to-do-with-mom-on-her-birthday",
      },
      { label: "Funny jokes for Dad", href: "/funny-birthday-jokes-for-dad" },
      { label: "Gift vs. present", href: "/gift-vs-present" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About us", href: "/about-us" },
      { label: "Gifting 101", href: "/gifting-101" },
      { label: "How we pick", href: "/how-we-pick" },
      { label: "Disclosure", href: "/disclosure" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-rule bg-sunk">
      <div className="mx-auto max-w-6xl px-gutter py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="font-display-sm text-sm text-ink">
                {column.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted transition-colors hover:text-rose-deep"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-rule pt-6">
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            ParentPresents earns a commission on some links, at no cost to you.
            We pick what to recommend before we check what it pays, and we say
            when we haven&rsquo;t tried something ourselves.
          </p>
          <p className="mt-4 text-xs text-muted">
            © {year} ParentPresents ·{" "}
            <Link href="/disclosure" className="underline hover:text-rose-deep">
              Affiliate disclosure
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="underline hover:text-rose-deep">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
