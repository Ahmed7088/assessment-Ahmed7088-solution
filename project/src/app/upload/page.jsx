import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { UploadForm } from "@/components/UploadForm";

const steps = [
  { n: "01", label: "Model Info", active: true },
  { n: "02", label: "Upload Files" },
  { n: "03", label: "Documentation" },
  { n: "04", label: "Pricing" },
  { n: "05", label: "Review" },
];

export default function UploadPage() {
  return (
    <>
      <SiteHeader variant="app" />
      <main className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-20">
        <div className="mb-10">
          <p className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.14em] text-accent-soft">
            PUBLISH PROTOCOL WEIGHTS
          </p>
          <h1 className="mt-2 font-[family-name:Archivo] text-3xl font-extrabold md:text-4xl">
            List Model on Decentralized Market
          </h1>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                s.active
                  ? "border-accent bg-accent/15 text-accent-soft"
                  : "border-border text-text-dim"
              }`}
            >
              <span className="font-[family-name:JetBrains_Mono] text-xs font-bold">
                {s.n}
              </span>
              <span className="text-sm">{s.label}</span>
            </div>
          ))}
        </div>

        <UploadForm />
      </main>
      <SiteFooter />
    </>
  );
}
