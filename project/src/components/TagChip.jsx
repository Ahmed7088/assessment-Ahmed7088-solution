import Link from "next/link";
import { marketplaceHref } from "@/lib/data";

export function TagChip({ tag, active, href }) {
  const to = href ?? marketplaceHref({ category: tag.slug });

  return (
    <Link
      href={to}
      className={`rounded-md px-3 py-2 text-[13px] transition ${
        active
          ? "bg-accent/20 text-accent-soft ring-1 ring-accent/40"
          : "bg-bg-panel text-text-muted ring-1 ring-border hover:border-accent/40 hover:text-text"
      }`}
    >
      {tag.label}
    </Link>
  );
}

export function MetaTag({ tag }) {
  return (
    <Link
      href={marketplaceHref({ tag })}
      className="rounded-md bg-accent/15 px-3 py-1.5 font-[family-name:JetBrains_Mono] text-xs text-accent-soft ring-1 ring-accent/30 transition hover:bg-accent/25 hover:ring-accent/50"
    >
      {tag}
    </Link>
  );
}
