import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats = [
    {
      label: "TOTAL PROTOCOL REVENUE",
      value: "$24,850",
      meta: "+12.3% vs prev",
    },
    {
      label: "API COMPUTATIONAL RUNS",
      value: "1.2M Calls",
      meta: "+8.4%",
    },
    {
      label: "ACTIVE VERIFIED MODELS",
      value: "8 Models",
      meta: "All Live",
    },
    {
      label: "CUMULATIVE MODEL RATING",
      value: "4.7 Stars",
      meta: "42 reviews",
    },
  ];
  let rows = [
    {
      name: "VisionForge Pro",
      slug: "visionforge-pro",
      status: "Active",
      price: "0.48 ETH",
      rating: 4.8,
    },
    {
      name: "SynthDiffusion-v4-HighRes",
      slug: "synthdiffusion-v4-highres",
      status: "Active",
      price: "0.32 ETH",
      rating: 4.8,
    },
    {
      name: "DeepVoice-Wave-Custom",
      slug: "deepvoice-wave-custom",
      status: "Compiling",
      price: "0.15 ETH",
      rating: 4.7,
    },
  ];
  let series = [35, 48, 42, 62, 58, 78, 70, 88, 82, 95];
  let months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  let headline = "VinciLabs Protocol Metrics";
  let wallet = "0x9df4...32ac";
  let apiOnline = false;

  try {
    const data = await api.dashboard();
    stats = data.stats;
    rows = data.models;
    series = data.revenueSeries;
    months = data.months;
    headline = data.headline;
    wallet = data.wallet;
    apiOnline = true;
  } catch {
    // local fallback
  }

  return (
    <>
      <SiteHeader variant="app" />
      <main className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.14em] text-accent-soft">
              DASHBOARD PLATFORM // MAIN_NET
            </p>
            <h1 className="mt-2 font-[family-name:Archivo] text-3xl font-extrabold md:text-4xl">
              {headline}
            </h1>
            <p className="mt-2 font-[family-name:JetBrains_Mono] text-xs text-text-dim">
              {wallet} · API {apiOnline ? "LIVE" : "OFFLINE"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/marketplace"
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-text-muted"
            >
              PAYOUT HISTORY
            </Link>
            <Link
              href="/upload"
              className="rounded-lg bg-accent px-4 py-2.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white hover:bg-accent-deep"
            >
              UPLOAD NEW MODEL
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-bg-elevated p-5"
            >
              <p className="font-[family-name:JetBrains_Mono] text-[10px] tracking-wider text-text-dim">
                {s.label}
              </p>
              <p className="mt-2 font-[family-name:Archivo] text-2xl font-bold">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-success">{s.meta}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-xl border border-border bg-bg-elevated p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-[family-name:Archivo] text-lg font-semibold">
                On-Chain Revenue Yield (6 Months)
              </h2>
            </div>
            <div className="relative h-56">
              <div className="absolute inset-0 flex items-end gap-3 px-2">
                {series.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-accent-deep to-accent-soft/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex justify-between font-[family-name:JetBrains_Mono] text-[10px] text-text-dim">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-bg-elevated p-5">
            <h2 className="font-[family-name:Archivo] text-lg font-semibold">
              Inference Activity Map
            </h2>
            <div className="mt-5 grid grid-cols-12 gap-1">
              {Array.from({ length: 84 }).map((_, i) => {
                const intensity = (i * 17) % 5;
                const colors = [
                  "bg-border",
                  "bg-accent/20",
                  "bg-accent/40",
                  "bg-accent/70",
                  "bg-accent",
                ];
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-[2px] ${colors[intensity]}`}
                  />
                );
              })}
            </div>
          </section>
        </div>

        <section className="mt-8 overflow-x-auto rounded-xl border border-border">
          <div className="border-b border-border bg-bg-elevated px-5 py-4">
            <h2 className="font-[family-name:Archivo] text-lg font-semibold">
              Active Model Ownership Performance
            </h2>
          </div>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-bg text-text-dim">
              <tr>
                {["MODEL INSTANCE", "STATUS", "MINT PRICE", "RATING"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 font-[family-name:JetBrains_Mono] text-[10px] tracking-wider font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.slug} className="border-t border-border">
                  <td className="px-5 py-4 font-medium">
                    <Link
                      href={`/models/${row.slug}`}
                      className="transition hover:text-accent-soft"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        row.status === "Active"
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-[family-name:JetBrains_Mono] text-accent-soft">
                    {row.price}
                  </td>
                  <td className="px-5 py-4">{row.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
