import Image from "next/image";
import Link from "next/link";
import logoMark from "@/assets/logo-mark.png";

/**
 * Server component. The mobile disclosure is a <details> element rather than a
 * script, so the header contributes no client JS of its own.
 *
 * The lockup is split deliberately: the mark renders as an image, the wordmark
 * as live text. The supplied lockup sets "ParentPresents" in a bold grotesque
 * that Inter matches closely, so typesetting it keeps the wordmark selectable,
 * translatable and crisp at any size, and saves shipping a wider bitmap.
 */
const nav = [
  { label: "Mom", href: "/mom" },
  { label: "Dad", href: "/dad" },
  { label: "Occasions", href: "/occasions" },
  { label: "Resources", href: "/resources" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-page">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-gutter py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="ParentPresents — home"
        >
          <Image src={logoMark} alt="" width={32} height={34} priority />
          <span className="text-[1.35rem] leading-none font-bold tracking-[-0.03em] text-ink">
            ParentPresents
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-7 text-sm font-medium">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink transition-colors hover:text-rose-deep"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <details className="relative sm:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-control border border-rule px-3 py-1.5 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <nav
            aria-label="Primary"
            className="absolute right-0 z-20 mt-2 w-44 rounded-card border border-rule bg-surface p-2 shadow-lg"
          >
            <ul className="flex flex-col text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-control px-3 py-2 text-ink hover:bg-sunk hover:text-rose-deep"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
