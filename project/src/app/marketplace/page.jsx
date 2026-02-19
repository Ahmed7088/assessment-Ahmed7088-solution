import Link from "next/link";
import { ModelCard } from "@/components/ModelCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TagChip } from "@/components/TagChip";
import { api } from "@/lib/api";
import {
  categories as fallbackCategories,
  categoryLabel,
  filterModels,
  heroTags,
  marketplaceHref,
  models as fallbackModels,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({ searchParams }) {
  const params = await searchParams;
  const category = params.category || (params.tag ? undefined : "all");
  const q = params.q || "";
  const tag = params.tag || "";
  const page = Math.max(1, Number(params.page || "1") || 1);
  const pageSize = 6;

  let items = filterModels({ category, q, tag });
  let total = items.length;
  let totalPages = Math.max(1, Math.ceil(total / pageSize));
  let currentPage = Math.min(page, totalPages);
  let pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  let categories = fallbackCategories;
  let apiOnline = false;

  try {
    const [modelsRes, catsRes] = await Promise.all([
      api.models({ category, q, tag, page, pageSize }),
      api.categories(),
    ]);
    pageItems = modelsRes.items;
    total = modelsRes.pagination.total;
    totalPages = modelsRes.pagination.totalPages;
    currentPage = modelsRes.pagination.page;
    categories = catsRes.items;
    apiOnline = true;
  } catch {
    // Fallback to local seed data if backend is offline
  }

  const activeCategory = tag || category || "all";
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-20">
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-[family-name:Archivo] text-4xl font-extrabold tracking-tight">
              Explore AI Computes
            </h1>
            <span
              className={`rounded px-2 py-1 font-[family-name:JetBrains_Mono] text-[10px] ${
                apiOnline
                  ? "bg-success/15 text-success"
                  : "bg-warning/15 text-warning"
              }`}
            >
              API {apiOnline ? "LIVE" : "OFFLINE"}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-text-muted">
            Discover secure, decentralised models optimized on EVM networks.
          </p>

          <form
            action="/marketplace"
            className="mt-6 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
          >
            {category && category !== "all" ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            {tag ? <input type="hidden" name="tag" value={tag} /> : null}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search models by tags, parameters, or mint hashes..."
              className="flex-1 rounded-lg border border-border-strong bg-bg-elevated px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              type="submit"
              className="rounded-lg bg-accent px-5 py-3 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white hover:bg-accent-deep"
            >
              EXECUTE QUERY
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {heroTags.map((t) => (
              <TagChip
                key={t.slug}
                tag={t}
                active={
                  !tag &&
                  (t.slug === "all"
                    ? !category || category === "all"
                    : activeCategory === t.slug)
                }
              />
            ))}
          </div>

          {(q || (category && category !== "all") || tag) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <span>
                Filtered
                {q ? (
                  <>
                    {" "}
                    by “<span className="text-text">{q}</span>”
                  </>
                ) : null}
                {category && category !== "all" ? (
                  <>
                    {" "}
                    in <span className="text-accent-soft">{categoryLabel(category)}</span>
                  </>
                ) : null}
                {tag ? (
                  <>
                    {" "}
                    tagged <span className="text-accent-soft">#{tag}</span>
                  </>
                ) : null}
              </span>
              <Link
                href="/marketplace"
                className="text-accent-soft underline-offset-2 hover:underline"
              >
                Clear filters
              </Link>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit space-y-8 rounded-xl border border-border bg-bg-elevated p-5">
            <div>
              <p className="mb-3 font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
                CATEGORIES
              </p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={marketplaceHref({ q: q || undefined })}
                    className={`flex items-center justify-between rounded-md px-2 py-2 text-sm transition ${
                      (!category || category === "all") && !tag
                        ? "bg-accent/15 text-accent-soft"
                        : "text-text-muted hover:bg-bg hover:text-text"
                    }`}
                  >
                    <span>All Models</span>
                    <span className="font-[family-name:JetBrains_Mono] text-xs text-text-dim">
                      {apiOnline ? total : fallbackModels.length}
                    </span>
                  </Link>
                </li>
                {categories.map((c) => {
                  const active = activeCategory === c.slug;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={marketplaceHref({
                          category: c.slug,
                          q: q || undefined,
                        })}
                        className={`flex items-center justify-between rounded-md px-2 py-2 text-sm transition ${
                          active
                            ? "bg-accent/15 text-accent-soft"
                            : "text-text-muted hover:bg-bg hover:text-text"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="font-[family-name:JetBrains_Mono] text-xs text-text-dim">
                          {c.count}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-text-muted">
                {total} model{total === 1 ? "" : "s"} matched
              </p>
              <p className="font-[family-name:JetBrains_Mono] text-xs text-text-dim">
                Sort: Volume Traded (Desc)
              </p>
            </div>

            {pageItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-bg-elevated p-10 text-center">
                <p className="font-[family-name:Archivo] text-xl font-semibold">
                  No models found
                </p>
                <Link
                  href="/marketplace"
                  className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep"
                >
                  Reset marketplace
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((model) => (
                  <ModelCard key={model.slug} model={model} />
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <p className="text-sm text-text-muted">
                Showing {start}-{end} of {total} computed models
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={marketplaceHref({
                    category,
                    q: q || undefined,
                    tag: tag || undefined,
                    page: Math.max(1, currentPage - 1),
                  })}
                  className={`rounded-md border border-border px-3 py-2 text-xs ${
                    currentPage <= 1
                      ? "pointer-events-none text-text-dim opacity-40"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  PREV
                </Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Link
                    key={n}
                    href={marketplaceHref({
                      category,
                      q: q || undefined,
                      tag: tag || undefined,
                      page: n,
                    })}
                    className={`flex h-9 w-9 items-center justify-center rounded-md text-xs ${
                      n === currentPage
                        ? "bg-accent text-white"
                        : "border border-border text-text-muted hover:text-text"
                    }`}
                  >
                    {n}
                  </Link>
                ))}
                <Link
                  href={marketplaceHref({
                    category,
                    q: q || undefined,
                    tag: tag || undefined,
                    page: Math.min(totalPages, currentPage + 1),
                  })}
                  className={`rounded-md border border-border px-3 py-2 text-xs ${
                    currentPage >= totalPages
                      ? "pointer-events-none text-text-dim opacity-40"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  NEXT
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
