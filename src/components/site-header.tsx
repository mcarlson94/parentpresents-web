import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-ink transition-colors hover:text-clay"
        >
          Parent<span className="text-clay">Presents</span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-6 text-sm text-muted">
            <li>
              <Link
                href="/guides"
                className="transition-colors hover:text-ink"
              >
                Gift guides
              </Link>
            </li>
            <li>
              <Link
                href="/#why"
                className="transition-colors hover:text-ink"
              >
                Why we exist
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
