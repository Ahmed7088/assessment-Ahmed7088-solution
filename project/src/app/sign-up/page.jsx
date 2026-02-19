import Image from "next/image";
import Link from "next/link";
import { SignUpForm } from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r border-border bg-bg-elevated lg:block">
        <div className="absolute inset-0 hero-glow opacity-80" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="font-[family-name:Archivo] text-2xl font-extrabold">
            NuvyraHub
          </Link>
          <div className="max-w-md">
            <p className="font-[family-name:JetBrains_Mono] text-[12px] tracking-[0.16em] text-accent-soft">
              CRYPTO-COMPUTE BLOCKCHAIN
            </p>
            <h1 className="mt-4 font-[family-name:Archivo] text-4xl font-extrabold leading-tight">
              A secure gateway for artificial intelligence ownership
            </h1>
            <p className="mt-4 text-text-muted">
              Establish ownership contracts. Publish verified weights as immutable
              assets. Acquire secure token runs across distributed,
              state-of-the-art node networks.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-lg border border-border bg-bg/70 px-4 py-3 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_#10b981]" />
              <div>
                <p className="font-[family-name:JetBrains_Mono] text-[11px] text-success">
                  LIVE NODE
                </p>
                <p className="font-[family-name:JetBrains_Mono] text-xs text-text-muted">
                  METAMASK // METRIC_OK
                </p>
              </div>
            </div>
          </div>
          <div className="relative h-48 w-full overflow-hidden rounded-xl">
            <Image
              src="/assets/hud-ring.svg"
              alt=""
              fill
              className="object-cover opacity-80"
              sizes="50vw"
            />
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-block font-[family-name:Archivo] text-xl font-extrabold lg:hidden"
          >
            NuvyraHub
          </Link>
          <SignUpForm />
        </div>
      </main>
    </div>
  );
}
