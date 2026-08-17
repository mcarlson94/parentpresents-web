import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Chip — category labels, price bands, and the verified badge.
 *
 * This is the site's ONE signature element. It replaced an earlier punched
 * gift-tag motif, which duplicated an idea the logo already owns (the mark is
 * itself a gift box and ribbon). The signature here is the logo's construction
 * language instead: uniform rounded strokes, fully rounded ends, two-tone
 * rose/cornflower. Nothing decorative is added on top of that — the restraint
 * is the point. Don't add a second signature element.
 */

type Variant = "label" | "price" | "verified" | "flag";
type Size = "sm" | "md";

interface ChipProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
}

/* Brand hues appear as stroke and tint only; all type uses a -deep member. */
const variantClass: Record<Variant, string> = {
  label: "bg-surface text-ink border-rule",
  price: "bg-rose-soft text-rose-deep border-rose/45",
  verified: "bg-blue-soft text-blue-deep border-blue/40",
  flag: "bg-flag-soft text-flag border-flag/30",
};

const sizeClass: Record<Size, string> = {
  sm: "text-2xs px-2.5 py-0.5",
  md: "text-xs px-3.5 py-1",
};

const base =
  "inline-flex items-center gap-1.5 rounded-chip border font-semibold tracking-wide align-middle whitespace-nowrap";

export function Chip({
  variant = "label",
  size = "md",
  href,
  className,
  children,
}: ChipProps) {
  const classes = cn(
    base,
    variantClass[variant],
    sizeClass[size],
    href &&
      "transition-colors hover:border-rose hover:bg-rose-soft hover:text-rose-deep",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
}
