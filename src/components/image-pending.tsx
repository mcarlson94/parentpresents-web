import { cn } from "@/lib/cn";

/**
 * Deliberate stand-in for a product photo that does not exist yet.
 *
 * Reads as "nothing here on purpose" rather than as a broken <img>. Product
 * imagery arrives with the product data layer; until a product has verifiedDate
 * + verifiedBy it has no image either, and this renders in its place.
 *
 * The aspect ratio is fixed so swapping in a real <Image /> later causes no
 * layout shift.
 */
interface ImagePendingProps {
  /** Tailwind aspect utility — must match the real image's ratio. */
  ratio?: string;
  className?: string;
}

export function ImagePending({
  ratio = "aspect-[4/5]",
  className,
}: ImagePendingProps) {
  return (
    <div
      className={cn(
        ratio,
        "flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-rule bg-sunk px-3 text-center",
        className,
      )}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-rose"
        aria-hidden="true"
      >
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M3 12h18M12 8v13" />
        <path d="M12 8S9.5 3.5 7 4.5 8 8 12 8s6.5-.5 5-3.5S12 8 12 8Z" />
      </svg>
      <span className="text-2xs leading-tight font-medium text-muted">
        Photo added at verification
      </span>
    </div>
  );
}
