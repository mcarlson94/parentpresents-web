/**
 * Minimal class-name joiner. Deliberately not clsx/tailwind-merge — nothing in
 * this codebase composes conflicting utilities, so a dependency would be
 * carrying weight it never uses.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
