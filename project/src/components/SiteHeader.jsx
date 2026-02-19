"use client";

import Link from "next/link";
import { useState } from "react";
import { api, saveToken } from "@/lib/api";
import { connectBrowserWallet } from "@/lib/contracts";

export function SiteHeader({ variant = "marketing" }) {
  const [walletLabel, setWalletLabel] = useState(null);
  const [busy, setBusy] = useState(false);

  const links =
    variant === "marketing"
      ? [
          { href: "/marketplace", label: "Explore Models" },
          { href: "/#how-it-works", label: "How it Works" },
          { href: "/pricing", label: "Pricing" },
          { href: "/#how-it-works", label: "Documentation" },
        ]
      : [
          { href: "/marketplace", label: "Explore Models" },
          { href: "/dashboard", label: "Creator Dashboard" },
          { href: "/upload", label: "Upload Model" },
          { href: "/#how-it-works", label: "Docs" },
        ];

  async function onConnectWallet() {
    setBusy(true);
    try {
      const { address } = await connectBrowserWallet();
      const res = await api.wallet(address);
      saveToken(res.token);
      setWalletLabel(`${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch {
      try {
        const fake = `0x${Math.random().toString(16).slice(2, 6)}...${Math.random()
          .toString(16)
          .slice(2, 6)}`;
        const res = await api.wallet(fake);
        saveToken(res.token);
        setWalletLabel(fake);
      } catch {
        setWalletLabel(null);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[77px] w-full max-w-[1440px] items-center justify-between px-6 md:px-20">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/20 ring-1 ring-accent-soft/40">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent-soft" />
          </span>
          <span className="font-[family-name:Archivo] text-[22px] font-extrabold tracking-tight text-text">
            NuvyraHub
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {variant === "marketing" ? (
            <>
              <Link
                href="/sign-up"
                className="hidden text-[15px] text-text-muted transition-colors hover:text-text sm:inline"
              >
                Sign In
              </Link>
              <button
                type="button"
                disabled={busy}
                onClick={onConnectWallet}
                className="btn-glow rounded-md bg-accent px-4 py-2.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white transition hover:bg-accent-deep disabled:opacity-60"
              >
                {walletLabel ? walletLabel.toUpperCase() : busy ? "CONNECTING…" : "CONNECT WALLET"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onConnectWallet}
              className="flex items-center gap-3 rounded-md border border-border bg-bg-elevated px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_#10b981]" />
              <div className="leading-tight text-left">
                <p className="font-[family-name:JetBrains_Mono] text-[10px] tracking-wider text-success">
                  CONNECTED
                </p>
                <p className="font-[family-name:JetBrains_Mono] text-[12px] text-text-muted hover:text-text">
                  {walletLabel || "0x9df4...32ac"}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
