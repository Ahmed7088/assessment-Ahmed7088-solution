import Image from "next/image";
import Link from "next/link";
import { marketplaceHref } from "@/lib/data";

export function ModelCard({ model }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_20px_40px_-20px_rgba(139,92,246,0.35)]">
      <Link
        href={`/models/${model.slug}`}
        className="relative aspect-[16/10] overflow-hidden bg-bg-panel"
      >
        <Image
          src={model.image}
          alt={model.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
      </Link>

      <div className="relative -mt-8 mb-0 px-3">
        <Link
          href={marketplaceHref({ category: model.categorySlug })}
          className="inline-flex rounded bg-bg/90 px-2 py-1 font-[family-name:JetBrains_Mono] text-[11px] text-accent-soft ring-1 ring-accent/30 backdrop-blur transition hover:bg-accent/20 hover:ring-accent/50"
        >
          {model.category}
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-[family-name:JetBrains_Mono] text-[11px] text-text-dim">
            {model.address}
          </span>
          <span className="text-[13px] text-text-muted">{model.creator}</span>
        </div>
        <Link href={`/models/${model.slug}`}>
          <h3 className="font-[family-name:Archivo] text-lg font-semibold leading-snug text-text transition group-hover:text-accent-soft">
            {model.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span>★ {model.rating}</span>
            <span>{model.downloads}</span>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-text-dim">
              Ownership Price
            </p>
            <p className="font-[family-name:JetBrains_Mono] text-sm font-bold text-accent-soft">
              {model.price}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
