"use client";

import { useCallback, useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";
import {
  connectBrowserWallet,
  formatWalletError,
  getExpectedChainId,
  getExpectedChainName,
  getLicenseBalance,
  readListingForSlug,
  submitLicensePurchase,
} from "@/lib/contracts";

function shortenAddress(address) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
}

function chainIdFromHex(value) {
  return value ? Number.parseInt(value, 16) : null;
}

export function ModelActions({ slug }) {
  const [acquireMsg, setAcquireMsg] = useState(null);
  const [inferResult, setInferResult] = useState(null);
  const [prompt, setPrompt] = useState(
    "cyberpunk workstation high-res, neon-violet lighting",
  );
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [listing, setListing] = useState(null);
  const [listingState, setListingState] = useState("loading");
  const [listingError, setListingError] = useState(null);
  const [walletAvailable, setWalletAvailable] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletChainId, setWalletChainId] = useState(null);
  const [licenseBalance, setLicenseBalance] = useState(null);

  const loadListing = useCallback(async () => {
    setListingState("loading");
    setListingError(null);

    try {
      const nextListing = await readListingForSlug(slug);
      setListing(nextListing);
      setListingState("ready");
    } catch (err) {
      setListing(null);
      setListingState("error");
      setListingError(
        formatWalletError(err, "Unable to read the listing from the blockchain."),
      );
    }
  }, [slug]);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      await loadListing();
    };
    void load();
  }, [loadListing]);

  useEffect(() => {
    if (!window.ethereum) {
      Promise.resolve().then(() => setWalletAvailable(false));
      return undefined;
    }

    Promise.resolve().then(() => setWalletAvailable(true));

    const refreshWalletState = async () => {
      try {
        const [accounts, chainId] = await Promise.all([
          window.ethereum.request({ method: "eth_accounts" }),
          window.ethereum.request({ method: "eth_chainId" }),
        ]);
        setWalletAddress(accounts[0] || null);
        setWalletChainId(chainIdFromHex(chainId));
      } catch {
        // Wallet state is optional until the user connects.
      }
    };

    const handleAccountsChanged = (accounts) => {
      setWalletAddress(accounts[0] || null);
      setLicenseBalance(null);
      void loadListing();
    };

    const handleChainChanged = (chainId) => {
      setWalletChainId(chainIdFromHex(chainId));
      setLicenseBalance(null);
      void loadListing();
    };

    void refreshWalletState();
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [loadListing]);

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
      await loadListing();
    } catch (err) {
      setError(formatWalletError(err, "Acquire failed."));
    } finally {
      setLoading(null);
    }
  }

  async function acquireWithMetaMask() {
    setLoading("wallet");
    setError(null);
    setAcquireMsg(null);
    setLicenseBalance(null);

    try {
      const connected = await connectBrowserWallet({ autoSwitch: false });
      setWalletAddress(connected.address);
      setWalletChainId(connected.chainId);

      if (connected.chainId !== getExpectedChainId()) {
        throw new Error(
          `Wrong network. Switch MetaMask to ${getExpectedChainName()} before buying.`,
        );
      }

      let liveListing;
      try {
        liveListing = await readListingForSlug(slug, connected.provider);
      } catch {
        // Existing demo models can be listed lazily by the backend.
        await api.chainList(slug);
        liveListing = await readListingForSlug(slug, connected.provider);
      }

      setListing(liveListing);
      setListingState("ready");
      const { tx, ...purchase } = await submitLicensePurchase(
        slug,
        connected.signer,
      );

      setLoading("pending");
      setAcquireMsg(`Transaction submitted · ${tx.hash.slice(0, 14)}…`);
      const receipt = await tx.wait();
      const txHash = receipt?.hash || tx.hash;

      try {
        await api.chainAcquireConfirm(slug, {
          txHash,
          walletAddress: connected.address,
        });
      } catch {
        // Backend recording is secondary to the confirmed wallet transaction.
      }

      setAcquireMsg(
        `License purchased for ${purchase.priceEth} ETH · tx ${txHash.slice(0, 14)}…`,
      );

      try {
        const balance = await getLicenseBalance(
          connected.address,
          purchase.tokenId,
          connected.provider,
        );
        setLicenseBalance(balance > 0n);
      } catch {
        setLicenseBalance(null);
      }
    } catch (err) {
      setError(formatWalletError(err, "Wallet purchase failed."));
    } finally {
      setLoading(null);
    }
  }

  async function connectOnly() {
    setLoading("connect");
    setError(null);
    setAcquireMsg(null);
    try {
      const { address, chainId } = await connectBrowserWallet({
        autoSwitch: false,
      });
      setWalletAddress(address);
      setWalletChainId(chainId);
      await api.wallet(address).catch(() => null);

      if (chainId !== getExpectedChainId()) {
        setError(
          `Wrong network. Switch MetaMask to ${getExpectedChainName()} before buying.`,
        );
      } else {
        setAcquireMsg(`Wallet connected: ${shortenAddress(address)}`);
      }
    } catch (err) {
      setError(formatWalletError(err, "Wallet connect failed."));
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
      setError(formatWalletError(err, "Inference failed."));
    } finally {
      setLoading(null);
    }
  }

  const wrongNetwork =
    walletAddress && walletChainId !== null && walletChainId !== getExpectedChainId();
  const canBuy =
    walletAddress &&
    !wrongNetwork &&
    listingState !== "loading" &&
    !loading;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-bg-elevated p-5">
        <p className="font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
          LICENSING PLANS
        </p>
        <p className="mt-2 font-[family-name:Archivo] text-3xl font-extrabold text-accent-soft">
          {listingState === "loading"
            ? "Loading on-chain price…"
            : listing
              ? `${listing.priceEth} ETH`
              : "Price unavailable"}
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Live price read from the marketplace contract. The wallet pays this
          exact on-chain value plus gas.
        </p>

        {listing ? (
          <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 font-[family-name:JetBrains_Mono] text-[11px] text-accent-soft">
            ON-CHAIN · token #{listing.tokenId} · sold {listing.totalLicensesSold} ·{" "}
            {listing.active ? "ACTIVE" : "PAUSED"}
          </div>
        ) : listingError ? (
          <div className="mt-4 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-danger">
            {listingError}
          </div>
        ) : null}

        {walletAvailable === false ? (
          <div className="mt-4 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-danger">
            No injected wallet detected. Install MetaMask to buy directly, or
            use the relay option below.
          </div>
        ) : null}

        {walletAddress ? (
          <div className="mt-4 rounded-lg border border-border bg-bg px-3 py-2 font-[family-name:JetBrains_Mono] text-[11px] text-text-muted">
            WALLET · {shortenAddress(walletAddress)} · chain {walletChainId}
          </div>
        ) : null}

        {wrongNetwork ? (
          <div className="mt-3 text-xs text-danger">
            Switch MetaMask to {getExpectedChainName()} (chain ID {getExpectedChainId()}) to enable purchase.
          </div>
        ) : null}

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
          disabled={Boolean(loading)}
          className="btn-glow mt-5 w-full rounded-lg bg-accent py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white hover:bg-accent-deep disabled:opacity-60"
        >
          {loading === "acquire" ? "MINTING ON-CHAIN…" : "ACQUIRE CONTRACT (RELAY)"}
        </button>
        <button
          type="button"
          onClick={acquireWithMetaMask}
          disabled={!canBuy}
          className="mt-3 w-full rounded-lg border border-accent/40 py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-accent-soft hover:bg-accent/10 disabled:opacity-60"
        >
          {loading === "wallet"
            ? "CONFIRM IN WALLET…"
            : loading === "pending"
              ? "TRANSACTION PENDING…"
              : !walletAddress
                ? "CONNECT WALLET TO BUY"
                : wrongNetwork
                  ? "SWITCH NETWORK TO BUY"
                  : listing
                    ? "BUY LICENSE"
                    : "LIST AND BUY LICENSE"}
        </button>
        <button
          type="button"
          onClick={connectOnly}
          disabled={Boolean(loading)}
          className="mt-3 w-full rounded-lg border border-border-strong py-3 font-[family-name:JetBrains_Mono] text-[11px] font-bold tracking-wide text-text-muted hover:border-accent/40 disabled:opacity-60"
        >
          {loading === "connect" ? "CONNECTING…" : "CONNECT WALLET"}
        </button>
        <button
          type="button"
          onClick={() => setShowDemo((v) => !v)}
          disabled={Boolean(loading)}
          className="mt-3 w-full rounded-lg border border-border-strong py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-text hover:border-accent/50 disabled:opacity-60"
        >
          TRY INTERACTIVE DEMO
        </button>
        {acquireMsg ? (
          <p className="mt-3 text-xs text-success">{acquireMsg}</p>
        ) : null}
        {licenseBalance !== null ? (
          <p className="mt-2 text-xs text-success">
            License balance: {licenseBalance ? "owned" : "not found"}
          </p>
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
