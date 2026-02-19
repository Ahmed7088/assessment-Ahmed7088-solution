import Link from "next/link";
import { marketplaceHref } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-20">
        <div>
          <Link
            href="/"
            className="font-[family-name:Archivo] text-xl font-extrabold text-text"
          >
            NuvyraHub
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
            Decentralized models, ownership contracts, and local cryptographic
            verification blocks.
          </p>
        </div>
        {[
          {
            title: "Marketplace",
            links: [
              { label: "Explorer", href: "/marketplace" },
              { label: "LLMs", href: marketplaceHref({ category: "llm" }) },
              {
                label: "Image Gen",
                href: marketplaceHref({ category: "image-gen" }),
              },
            ],
          },
          {
            title: "Ecosystem",
            links: [
              { label: "Creator Dashboard", href: "/dashboard" },
              { label: "Upload Model", href: "/upload" },
              { label: "Pricing", href: "/pricing" },
            ],
          },
          {
            title: "Resources",
            links: [
              { label: "How it Works", href: "/#how-it-works" },
              { label: "Sign In", href: "/sign-up" },
              { label: "Documentation", href: "/#how-it-works" },
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-sm font-semibold text-text">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={`${col.title}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-6 py-6 text-sm text-text-dim md:flex-row md:items-center md:justify-between md:px-20">
          <p>© 2026 NuvyraHub Inc. Built for Web3 AI.</p>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-text">
              Terms
            </Link>
            <Link href="/pricing" className="hover:text-text">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
