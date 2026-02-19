import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModelActions } from "@/components/ModelActions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MetaTag } from "@/components/TagChip";
import { api } from "@/lib/api";
import { getModel, marketplaceHref, models } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ModelDetailPage({ params }) {
  const { slug } = await params;

  let model = getModel(slug);
  let related = models
    .filter((m) => m.slug !== slug)
    .sort(
      (a, b) =>
        Number(b.categorySlug === model?.categorySlug) -
        Number(a.categorySlug === model?.categorySlug),
    )
    .slice(0, 2);

  try {
    const res = await api.model(slug);
    model = {
      slug: res.model.slug,
      name: res.model.name,
      creator: res.model.creator,
      address: res.model.address,
      category: res.model.category,
      categorySlug: res.model.categorySlug,
      tags: res.model.tags,
      rating: res.model.rating,
      downloads: res.model.downloads,
      price: res.model.price,
      image: res.model.image,
      description: res.model.description,
    };
    related = res.related.slice(0, 2).map((r) => ({
      slug: r.slug,
      name: r.name,
      creator: r.creator,
      address: r.address,
      category: r.category,
      categorySlug: r.categorySlug,
      tags: r.tags,
      rating: r.rating,
      downloads: r.downloads,
      price: r.price,
      image: r.image,
      description: r.description,
    }));
  } catch {
    // local fallback
  }

  if (!model) notFound();

  return (
    <>
      <SiteHeader variant="app" />
      <main className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <Link
              href={marketplaceHref({ category: model.categorySlug })}
              className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.14em] text-accent-soft transition hover:text-accent"
            >
              {model.category.toUpperCase()}
            </Link>
            <h1 className="mt-3 font-[family-name:Archivo] text-4xl font-extrabold tracking-tight md:text-5xl">
              {model.name}
            </h1>
            <p className="mt-4 max-w-2xl text-text-muted">
              {model.description ||
                "State-of-the-art model fine-tuned for high-fidelity output. Decentralized hosting verified by zero-knowledge computation proofs."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {model.tags.map((tag) => (
                <MetaTag key={tag} tag={tag} />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <span>by {model.creator}</span>
              <span>•</span>
              <span className="font-[family-name:JetBrains_Mono]">
                ID: {model.address}
              </span>
              <span>•</span>
              <span>Released: Oct 2026</span>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border border-border bg-bg-elevated p-5">
              {[
                { label: "DOWNLOADS", value: model.downloads },
                { label: "RATING", value: String(model.rating) },
                { label: "VERSION", value: "v3.2" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-[family-name:JetBrains_Mono] text-[10px] tracking-wider text-text-dim">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-[family-name:Archivo] text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="font-[family-name:Archivo] text-xl font-semibold">
                On-Chain Compute API
              </h3>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-bg-panel p-5 font-[family-name:JetBrains_Mono] text-xs leading-relaxed text-accent-soft">
{`import NuvyraHub

model = NuvyraHub.load_contract("${model.address}")
prediction = model.generate(
    prompt="cyberpunk workstation high-res, neon-violet lighting",
    steps=50,
    guidance_scale=7.5
)`}
              </pre>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
              <Image
                src={model.image}
                alt={model.name}
                fill
                className="object-cover"
                sizes="400px"
                priority
              />
            </div>

            <ModelActions slug={model.slug} price={model.price} />

            <div className="rounded-xl border border-border bg-bg-elevated p-5">
              <p className="mb-4 font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
                RELATED COMPUTATIONAL MODELS
              </p>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/models/${r.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-bg px-3 py-3 text-sm hover:border-accent/40"
                  >
                    <span className="truncate font-medium">{r.name}</span>
                    <span className="font-[family-name:JetBrains_Mono] text-accent-soft">
                      {r.price}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
