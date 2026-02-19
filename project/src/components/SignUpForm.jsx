"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, saveToken } from "@/lib/api";

export function SignUpForm() {
  const router = useRouter();
  const [role, setRole] = useState("DEVELOPER");
  const [email, setEmail] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.signup({ email, passphrase, role, acceptTerms });
      saveToken(res.token);
      setMessage(`Account created as ${res.user.role}. Redirecting…`);
      router.push("/marketplace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function connectWallet() {
    setLoading(true);
    setError(null);
    try {
      const walletAddress = `0x${Math.random().toString(16).slice(2, 6).toUpperCase()}...${Math.random()
        .toString(16)
        .slice(2, 6)}`;
      const res = await api.wallet(walletAddress, role);
      saveToken(res.token);
      setMessage(`Wallet connected: ${res.user.walletAddress || walletAddress}`);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connect failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="font-[family-name:Archivo] text-3xl font-bold">
        Create Your Account
      </h2>
      <p className="mt-2 text-text-muted">
        Enter your credentials or link a decentralized wallet.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-2 rounded-lg border border-border bg-bg-elevated p-1">
        {["DEVELOPER", "CREATOR"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
              role === r ? "bg-accent text-white" : "text-text-muted hover:text-text"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          disabled={loading}
          onClick={connectWallet}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-bg-panel px-4 py-3 text-sm font-medium transition hover:border-accent/50 disabled:opacity-60"
        >
          Connect MetaMask Wallet
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={connectWallet}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-bg-panel px-4 py-3 text-sm font-medium transition hover:border-accent/50 disabled:opacity-60"
        >
          Connect GitHub Account
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-text-dim">
        <span className="h-px flex-1 bg-border" />
        Or Email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-dim">
            Email Address
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email..."
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-dim">
            Choose Passphrase
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="••••••••••••"
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
        <label className="flex items-start gap-3 text-sm text-text-muted">
          <input
            type="checkbox"
            className="mt-1 accent-[var(--accent)]"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          I agree to the Terms of Service and Privacy Guidelines.
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn-glow flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3.5 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white hover:bg-accent-deep disabled:opacity-60"
        >
          {loading ? "PROCESSING…" : "PROCEED TO VERIFICATION"}
        </button>
      </form>

      {message ? (
        <p className="mt-4 text-sm text-success">{message}</p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
