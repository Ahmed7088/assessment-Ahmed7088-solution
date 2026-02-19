"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MetaTag } from "@/components/TagChip";
import { api, getToken, saveToken } from "@/lib/api";
import { listModelWithWallet } from "@/lib/contracts";

export function UploadForm() {
  const router = useRouter();
  const [name, setName] = useState("VisionForge Pro");
  const [description, setDescription] = useState(
    "State-of-the-art latent diffusion model fine-tuned for photorealistic assets, spatial precision, and high-fidelity textures...",
  );
  const [category, setCategory] = useState("Image Generation");
  const [categorySlug, setCategorySlug] = useState("image-gen");
  const [framework, setFramework] = useState("PyTorch");
  const [tags] = useState(["diffusion", "photorealism", "text-to-image", "vinci-labs"]);
  const [priceEth, setPriceEth] = useState(0.48);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function ensureToken() {
    const existing = getToken();
    if (existing) return existing;
    const wallet = await api.wallet(
      `0x${Math.random().toString(16).slice(2, 6)}...${Math.random()
        .toString(16)
        .slice(2, 6)}`,
      "CREATOR",
    );
    saveToken(wallet.token);
    return wallet.token;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const token = await ensureToken();
      const res = await api.createModel(
        {
          name,
          description,
          category,
          categorySlug,
          tags,
          priceEth,
          framework,
          creator: "@VinciLabs",
        },
        token,
      );

      const listInput = {
        slug: res.model.slug,
        metadataURI: `https://NuvyraHub.local/metadata/${res.model.slug}.json`,
        priceEth,
        royaltyBps: 500,
      };

      try {
        const listed = await listModelWithWallet(listInput);
        setMessage(
          listed.alreadyListed
            ? `Published ${res.model.name} (already on-chain)`
            : `Published ${res.model.name} on-chain as token #${listed.tokenId}`,
        );
      } catch {
        try {
          await api.chainList(res.model.slug);
          setMessage(`Published ${res.model.name} (relay listed)`);
        } catch {
          setMessage(
            `Published ${res.model.name} (catalog only — chain unavailable)`,
          );
        }
      }

      router.push(`/models/${res.model.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-bg-elevated p-6 md:p-8">
      <h2 className="font-[family-name:Archivo] text-2xl font-bold">
        Step 1: Core Model Identification
      </h2>
      <p className="mt-2 max-w-2xl text-text-muted">
        Define how your computational weights are presented to potential node
        runners and model owners.
      </p>

      <form className="mt-8 grid gap-6 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="block md:col-span-2">
          <span className="mb-2 block font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
            MODEL NAME
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            required
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
            DESCRIPTION
          </span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
            CATEGORY
          </span>
          <select
            value={categorySlug}
            onChange={(e) => {
              const slug = e.target.value;
              setCategorySlug(slug);
              const labels = {
                "image-gen": "Image Generation",
                llm: "Large Language Models",
                audio: "Audio Synthesis",
                predictive: "Predictive Analytics",
                nlp: "Natural Language",
                video: "Video Diffusion",
              };
              setCategory(labels[slug] || slug);
            }}
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="image-gen">Image Generation</option>
            <option value="llm">Large Language Models</option>
            <option value="audio">Audio Synthesis</option>
            <option value="predictive">Predictive Analytics</option>
            <option value="nlp">Natural Language</option>
            <option value="video">Video Diffusion</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
            PRICE (ETH)
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={priceEth}
            onChange={(e) => setPriceEth(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <div>
          <span className="mb-2 block font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
            MODEL FRAMEWORK
          </span>
          <div className="flex flex-wrap gap-2">
            {["PyTorch", "TensorFlow", "ONNX"].map((fw) => (
              <button
                key={fw}
                type="button"
                onClick={() => setFramework(fw)}
                className={`rounded-md px-3 py-2 text-sm ${
                  framework === fw
                    ? "bg-accent text-white"
                    : "border border-border text-text-muted"
                }`}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <span className="mb-2 block font-[family-name:JetBrains_Mono] text-[11px] tracking-wider text-text-dim">
            METADATA TAGS
          </span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <MetaTag key={tag} tag={tag} />
            ))}
          </div>
        </div>

        <div className="md:col-span-2 mt-4 flex flex-wrap justify-end gap-3 border-t border-border pt-6">
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-5 py-3 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-text-muted"
          >
            CANCEL
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-5 py-3 font-[family-name:JetBrains_Mono] text-[12px] font-bold tracking-wide text-white hover:bg-accent-deep disabled:opacity-60"
          >
            {loading ? "PUBLISHING…" : "PUBLISH MODEL"}
          </button>
        </div>
      </form>

      {message ? <p className="mt-4 text-sm text-success">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </section>
  );
}
