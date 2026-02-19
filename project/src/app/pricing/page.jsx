import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

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

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-20">
        <p className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.16em] text-accent-soft">
          PRICING MATRIX
        </p>
        <h1 className="mt-3 font-[family-name:Archivo] text-4xl font-extrabold md:text-5xl">
          Flexible Plans for Decentralized Access
        </h1>
        <p className="mt-4 max-w-2xl text-text-muted">
          Deploy models or own absolute execution keys according to processing
          requirements.
        </p>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border p-6 ${
                plan.featured
                  ? "border-accent bg-accent/10 shadow-[0_0_40px_-12px_rgba(139,92,246,0.5)]"
                  : "border-border bg-bg-elevated"
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
                href="/sign-up"
                className={`mt-8 rounded-lg px-4 py-3 text-center font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide transition ${
                  plan.featured
                    ? "bg-accent text-white hover:bg-accent-deep"
                    : "border border-border-strong text-text hover:border-accent/50"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
