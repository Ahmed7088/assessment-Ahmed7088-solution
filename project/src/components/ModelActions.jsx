"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";
import { acquireLicenseWithWallet, connectBrowserWallet } from "@/lib/contracts";

export function ModelActions({ slug, price }) {
  const [acquireMsg, setAcquireMsg] = useState(null);
  const [inferResult, setInferResult] = useState(null);
  const [prompt, setPrompt] = useState(
    "cyberpunk workstation high-res, neon-violet lighting",
  );
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [listing, setListing] = useState(null);

  useEffect(() => {
    api
      .chainListing(slug)
      .then((res) => setListing(res.listing))
      .catch(() => setListing(null));
  }, [slug]);

  async function acquireOnChainRelay() {
    setLoading("acquire");
    setError(null);
    setAcquireMsg(null);
    try {
      const token = getToken() || undefined;
      const res = await api.acquire(slug, undefined, token);
      const tx = res.acquisition?.txHash;
      const onChainTx = res.onChain?.txHash;
      setAcquireMsg(
        `On-chain acquire complete · tx ${(onChainTx || tx || "").toString().slice(0, 18)}…`,
      );
      const refreshed = await api.chainListing(slug).catch(() => null);
      if (refreshed) setListing(refreshed.listing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acquire failed");
    } finally {
      setLoading(null);
    }
  }

  async function acquireWithMetaMask() {
    setLoading("wallet");
    setError(null);
    setAcquireMsg(null);
    try {
      try {
        await api.chainListing(slug);
      } catch {
        await api.chainList(slug);
      }

      const result = await acquireLicenseWithWallet(slug);
      await api.chainAcquireConfirm(slug, {
        txHash: result.txHash,
        walletAddress: result.buyer,
      });
      setAcquireMsg(
        `Wallet paid ${result.priceEth} ETH · token #${result.tokenId} · ${result.txHash.slice(0, 14)}…`,
      );
      const refreshed = await api.chainListing(slug).catch(() => null);
      if (refreshed) setListing(refreshed.listing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet acquire failed");
    } finally {
      setLoading(null);
    }
  }

  async function connectOnly() {
    setLoading("wallet");
    setError(null);
    try {
      const { address, chainId } = await connectBrowserWallet();
      await api.wallet(address);
      setAcquireMsg(`Wallet connected ${address.slice(0, 8)}… on chain ${chainId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connect failed");
    } finally {
      setLoading(null);
    }
  }

  async function runInfer(e) {
    e.preventDefault();
    setLoading("infer");
    setError(null);
    setInferResult(null);
    try {
      const res = await api.infer(slug, {
        prompt,
        steps: 50,
        guidanceScale: 7.5,
      });
      setInferResult(
        `${res.job.result || "Completed"}\nlatency=${res.job.latencyMs ?? "?"}ms`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inference failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-bg-elevated p-5">
        <p className="font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
          LICENSING PLANS
        </p>
        <p className="mt-2 font-[family-name:Archivo] text-3xl font-extrabold text-accent-soft">
          {price}
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Provides full weights download + immutable ERC-1155 smart ownership
          contract.
        </p>

        {listing ? (
          <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 font-[family-name:JetBrains_Mono] text-[11px] text-accent-soft">
            ON-CHAIN · token #{listing.tokenId} · sold {listing.totalLicensesSold} ·{" "}
            {listing.active ? "ACTIVE" : "PAUSED"}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-border bg-bg px-3 py-2 font-[family-name:JetBrains_Mono] text-[11px] text-text-dim">
            Not listed on-chain yet (acquire will auto-list via backend)
          </div>
        )}

        <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-text-muted">
            <span>API Inference Call</span>
            <span>$0.003 / call</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Gas Surcharge</span>
            <span>~0.0001 ETH</span>
          </div>
        </div>

        <button
          type="button"
          onClick={acquireOnChainRelay}
          disabled={loading === "acquire"}
          className="btn-glow mt-5 w-full rounded-lg bg-accent py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white hover:bg-accent-deep disabled:opacity-60"
        >
          {loading === "acquire" ? "MINTING ON-CHAIN…" : "ACQUIRE CONTRACT (RELAY)"}
        </button>
        <button
          type="button"
          onClick={acquireWithMetaMask}
          disabled={loading === "wallet"}
          className="mt-3 w-full rounded-lg border border-accent/40 py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-accent-soft hover:bg-accent/10 disabled:opacity-60"
        >
          {loading === "wallet" ? "WAITING WALLET…" : "ACQUIRE WITH METAMASK"}
        </button>
        <button
          type="button"
          onClick={connectOnly}
          className="mt-3 w-full rounded-lg border border-border-strong py-3 font-[family-name:JetBrains_Mono] text-[11px] font-bold tracking-wide text-text-muted hover:border-accent/40"
        >
          CONNECT WALLET ONLY
        </button>
        <button
          type="button"
          onClick={() => setShowDemo((v) => !v)}
          className="mt-3 w-full rounded-lg border border-border-strong py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-text hover:border-accent/50"
        >
          TRY INTERACTIVE DEMO
        </button>
        {acquireMsg ? (
          <p className="mt-3 text-xs text-success">{acquireMsg}</p>
        ) : null}
      </div>

      {showDemo ? (
        <form
          onSubmit={runInfer}
          className="rounded-xl border border-border bg-bg-elevated p-5"
        >
          <p className="font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
            LIVE INFERENCE
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="submit"
            disabled={loading === "infer"}
            className="mt-3 w-full rounded-lg bg-accent py-3 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white hover:bg-accent-deep disabled:opacity-60"
          >
            {loading === "infer" ? "RUNNING…" : "EXECUTE INFERENCE"}
          </button>
          {inferResult ? (
            <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-bg-panel p-3 font-[family-name:JetBrains_Mono] text-[11px] leading-relaxed text-accent-soft">
              {inferResult}
            </pre>
          ) : null}
        </form>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
