import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ModelCard } from "@/components/ModelCard";
import { TagChip } from "@/components/TagChip";
import { api } from "@/lib/api";
import { heroTags, models } from "@/lib/data";

const steps = [
  {
    n: "01",
    title: "Select Model",
    body: "Choose from thousands of decentralized open-source weights verified on-chain.",
  },
  {
    n: "02",
    title: "Acquire License",
    body: "Mint fractional or complete model ownership as standard ERC-1155 smart contracts.",
  },
  {
    n: "03",
    title: "Deploy Instant API",
    body: "Host on localized zero-knowledge server networks with secure high-throughput endpoints.",
  },
];

const plans = [
  {
    name: "DEVELOPER LITE",
    price: "Free",
    desc: "Explore thousands of open models on public shared compute node tiers.",
    cta: "START ACCESSING",
    features: [
      "Standard shared endpoint compute",
      "10k monthly tokens included",
      "Basic decentralized verification",
    ],
  },
  {
    name: "CREATIVE OPERATOR",
    price: "$79/mo",
    desc: "Dedicated private node executors with high-availability parameters.",
    cta: "UPGRADE TO PRO",
    featured: true,
    features: [
      "Priority zero-knowledge proof runners",
      "Fractional contract ownership trading",
      "500M monthly execution tokens",
    ],
  },
  {
    name: "ENTERPRISE NODE",
    price: "Custom",
    desc: "Enterprise private local execution blocks with customized validation keys.",
    cta: "CONTACT ARCHITECTS",
    features: [
      "Custom on-prem nodes & HSM keys",
      "Unlimited private endpoint tokens",
      "Real-time SLA compute contracts",
    ],
  },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  let trending = models.slice(0, 6);
  try {
    const res = await api.models({ page: 1, pageSize: 6 });
    if (res.items.length > 0) trending = res.items;
  } catch {
    // Seed data if the API is offline
  }

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="hero-glow relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative mx-auto grid min-h-[min(900px,100svh)] w-full max-w-[1440px] items-center gap-10 px-6 py-16 md:px-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="fade-up z-10 max-w-2xl">
              <p className="mb-5 font-[family-name:JetBrains_Mono] text-[12px] font-medium tracking-[0.14em] text-accent-soft">
                AI MODEL MARKETPLACE · SECURED ON-CHAIN
              </p>
              <h1 className="font-[family-name:Archivo] text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-text">
                Own, deploy, and monetize the world&apos;s finest AI models
              </h1>
              <p className="fade-up-delay mt-6 max-w-xl text-base leading-relaxed text-text-muted md:text-lg">
                De-centralized compute meets cryptographic security. Trade
                fractional ownership of weights and execute verified inference
                with secure zero-knowledge environments.
              </p>

              <form
                action="/marketplace"
                className="fade-up-delay-2 mt-10 flex w-full max-w-[800px] flex-col gap-3 sm:flex-row sm:items-center"
              >
                <label className="flex flex-1 items-center rounded-lg border border-border-strong bg-bg-elevated/90 px-4 py-3 ring-accent/0 transition focus-within:ring-2 focus-within:ring-accent/40">
                  <input
                    name="q"
                    placeholder="Search models by tags, parameters, or mint hashes..."
                    className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-dim"
                  />
                </label>
                <button
                  type="submit"
                  className="btn-glow rounded-lg bg-accent px-5 py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white transition hover:bg-accent-deep"
                >
                  EXECUTE QUERY
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-2">
                {heroTags.map((tag, i) => (
                  <TagChip key={tag.slug} tag={tag} active={i === 0} />
                ))}
              </div>
            </div>

            <div className="fade-up-delay relative mx-auto aspect-square w-full max-w-[560px]">
              <div className="absolute inset-8 rounded-full bg-accent/20 blur-3xl" />
              <Image
                src="/assets/network-sphere.svg"
                alt="Decentralized Nuvyra network visualization"
                fill
                priority
                className="object-contain drop-shadow-[0_0_40px_rgba(139,92,246,0.35)]"
                sizes="(max-width:1024px) 90vw, 560px"
              />
            </div>
          </div>
        </section>

        {/* Backed by */}
        <section className="border-y border-border bg-bg-elevated/50">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-20">
            <p className="mb-6 text-center font-[family-name:JetBrains_Mono] text-[11px] tracking-[0.18em] text-text-dim">
              BACKED BY LEADING BLOCKCHAIN & AI RESEARCH PROTOCOLS
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 font-[family-name:JetBrains_Mono] text-sm font-bold tracking-wider text-text-muted">
              {["ZK_SYNAPSE", "ETHER_CORE", "DECENTRAL_LABS", "MIND_GRID"].map(
                (brand) => (
                  <span key={brand} className="opacity-70 transition hover:opacity-100">
                    {brand}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* Trending */}
        <section className="mx-auto w-full max-w-[1440px] px-6 py-24 md:px-20">
          <p className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.16em] text-accent-soft">
            DECISION ENGINES
          </p>
          <h2 className="mt-3 max-w-3xl font-[family-name:Archivo] text-3xl font-bold tracking-tight md:text-4xl">
            Trending Models on On-Chain Markets
          </h2>
          <p className="mt-3 max-w-2xl text-text-muted">
            Live transaction analytics showing active smart-contract model
            instances.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((model) => (
              <ModelCard key={model.slug} model={model} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-border bg-bg-elevated/40">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-24 md:px-20">
            <p className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.16em] text-accent-soft">
              DECENTRALIZED ARCHITECTURE
            </p>
            <h2 className="mt-3 max-w-3xl font-[family-name:Archivo] text-3xl font-bold md:text-4xl">
              How NuvyraHub Orchestrates Ownership
            </h2>
            <p className="mt-3 max-w-2xl text-text-muted">
              A zero-friction pipeline combining mathematical validation with
              decentralised node executions.
            </p>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.n}
                  className="rounded-xl border border-border bg-bg p-6 transition hover:border-accent/40"
                >
                  <p className="font-[family-name:JetBrains_Mono] text-3xl font-extrabold text-accent-soft/80">
                    {step.n}
                  </p>
                  <h3 className="mt-4 font-[family-name:Archivo] text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creator spotlight */}
        <section className="mx-auto grid w-full max-w-[1440px] items-center gap-12 px-6 py-24 md:grid-cols-2 md:px-20">
          <div>
            <p className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.16em] text-accent-soft">
              CREATOR SPOTLIGHT
            </p>
            <h2 className="mt-3 font-[family-name:Archivo] text-3xl font-bold md:text-4xl">
              Mint weights. Generate yield.
            </h2>
            <p className="mt-4 max-w-lg text-text-muted">
              Developers receive immediate royalties when their model license
              contracts are purchased, split, or processed inside decentralised
              execution blocks.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-text-muted">
              {[
                "Verified secure ERC-1155 license distributions",
                "Immutable developer attribution mapping",
                "Zero-knowledge computation network proofs",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/upload"
              className="btn-glow mt-8 inline-flex rounded-lg bg-accent px-5 py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white hover:bg-accent-deep"
            >
              PUBLISH MODEL NOW
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-bg-panel">
            <div className="relative aspect-[4/3]">
              <Image
                src="/assets/creator-portrait.svg"
                alt="Creator spotlight"
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border p-5">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-text-dim">
                  Total Licensing Volume
                </p>
                <p className="mt-1 font-[family-name:JetBrains_Mono] text-xl font-bold text-accent-soft">
                  142.6 ETH
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-text-dim">
                  Active API Instances
                </p>
                <p className="mt-1 font-[family-name:JetBrains_Mono] text-xl font-bold">
                  24 Active
                </p>
              </div>
              <div className="col-span-2 flex items-center justify-between rounded-lg bg-bg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">VinciLabs Protocol</p>
                  <p className="font-[family-name:JetBrains_Mono] text-xs text-text-dim">
                    0x9df4...32ac
                  </p>
                </div>
                <span className="rounded bg-success/15 px-2 py-1 font-[family-name:JetBrains_Mono] text-[10px] text-success">
                  LIVE NODE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section id="pricing" className="border-t border-border bg-bg-elevated/30">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-24 md:px-20">
            <p className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.16em] text-accent-soft">
              PRICING MATRIX
            </p>
            <h2 className="mt-3 font-[family-name:Archivo] text-3xl font-bold md:text-4xl">
              Flexible Plans for Decentralized Access
            </h2>
            <p className="mt-3 max-w-2xl text-text-muted">
              Deploy models or own absolute execution keys according to
              processing requirements.
            </p>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col rounded-xl border p-6 ${plan.featured
                    ? "border-accent bg-accent/10 shadow-[0_0_40px_-12px_rgba(139,92,246,0.5)]"
                    : "border-border bg-bg"
                    }`}
                >
                  <p className="font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-muted">
                    {plan.name}
                  </p>
                  <p className="mt-3 font-[family-name:Archivo] text-4xl font-extrabold">
                    {plan.price}
                  </p>
                  <p className="mt-3 text-sm text-text-muted">{plan.desc}</p>
                  <ul className="mt-6 flex-1 space-y-2 text-sm text-text-muted">
                    {plan.features.map((f) => (
                      <li key={f}>· {f}</li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    className={`mt-8 rounded-lg px-4 py-3 text-center font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide transition ${plan.featured
                      ? "bg-accent text-white hover:bg-accent-deep"
                      : "border border-border-strong text-text hover:border-accent/50"
                      }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto w-full max-w-[1440px] px-6 py-24 md:px-20">
          <p className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.16em] text-accent-soft">
            TESTIMONIALS
          </p>
          <h2 className="mt-3 font-[family-name:Archivo] text-3xl font-bold md:text-4xl">
            Operator Consensus
          </h2>
          <p className="mt-3 max-w-2xl text-text-muted">
            Verifiable reviews from technical innovators running on-chain
            execution blocks.
          </p>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              {
                quote:
                  "By porting our models to NuvyraHub, we received automatic micro-royalties direct to our multisig. On-chain weights are a game changer.",
                name: "Sarah Thorne",
                role: "CTO, CortexLabs",
              },
              {
                quote:
                  "Deploying high-throughput models is now cheaper and faster than AWS, plus our compute is verified through solid zero-knowledge blocks.",
                name: "David Park",
                role: "Co-Founder, Synthetica",
              },
            ].map((t) => (
              <blockquote
                key={t.name}
                className="rounded-xl border border-border bg-bg-elevated p-6 md:p-8"
              >
                <p className="text-lg leading-relaxed text-text">{`"${t.quote}"`}</p>
                <footer className="mt-6">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-text-muted">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="mt-16 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/20 via-bg-panel to-bg-elevated p-8 md:p-12">
            <h2 className="font-[family-name:Archivo] text-3xl font-bold md:text-4xl">
              Unleash Cryptographic AI Weights
            </h2>
            <p className="mt-3 max-w-xl text-text-muted">
              Connect your Web3 credentials, browse trending computational
              designs, and register your ownership keys.
            </p>
            <Link
              href="/sign-up"
              className="btn-glow mt-8 inline-flex rounded-lg bg-accent px-5 py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white hover:bg-accent-deep"
            >
              MINT AN INSTANT LICENSE
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
