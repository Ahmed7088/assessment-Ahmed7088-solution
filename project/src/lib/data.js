/** Hero + marketplace filter chips */
export const heroTags = [
  { label: "All Models", slug: "all" },
  { label: "LLMs", slug: "llm", aliases: ["large-language-models", "llm"] },
  { label: "Image Gen", slug: "image-gen", aliases: ["image-generation"] },
  {
    label: "Audio Synthesizer",
    slug: "audio",
    aliases: ["audio-synthesis", "audio-synthesizer"],
  },
  { label: "Video Diffusion", slug: "video", aliases: ["video-diffusion"] },
  {
    label: "Predictive Analytics",
    slug: "predictive",
    aliases: ["predictive-analytics"],
  },
];

export const categories = [
  {
    name: "Large Language Models",
    slug: "llm",
    count: 142,
  },
  {
    name: "Image Generation",
    slug: "image-gen",
    count: 86,
  },
  {
    name: "Audio Synthesis",
    slug: "audio",
    count: 43,
  },
  {
    name: "Video Diffusion",
    slug: "video",
    count: 29,
  },
  {
    name: "Predictive Analytics",
    slug: "predictive",
    count: 68,
  },
  {
    name: "Natural Language",
    slug: "nlp",
    count: 110,
  },
];

export const models = [
  {
    slug: "aura-llama-70b-decentral",
    name: "Aura-Llama-70B-Decentral",
    creator: "@SpectralAI",
    address: "0x8f0f...3e41",
    category: "LLM",
    categorySlug: "llm",
    tags: ["llm", "70b", "language"],
    rating: 4.9,
    downloads: "12.4k",
    price: "0.48 ETH",
    image: "/assets/asset-a.svg",
    description:
      "High-throughput decentralized LLM weights with on-chain ownership and verified inference.",
  },
  {
    slug: "synthdiffusion-v4-highres",
    name: "SynthDiffusion-v4-HighRes",
    creator: "@VinciLabs",
    address: "0x1a2d...e982",
    category: "Image Gen",
    categorySlug: "image-gen",
    tags: ["image-gen", "diffusion", "photorealism", "vinci-labs"],
    rating: 4.8,
    downloads: "8.9k",
    price: "0.32 ETH",
    image: "/assets/asset-b.svg",
  },
  {
    slug: "deepvoice-wave-custom",
    name: "DeepVoice-Wave-Custom",
    creator: "@KortexGroup",
    address: "0xbc33...511a",
    category: "Audio Synthesizer",
    categorySlug: "audio",
    tags: ["audio", "synthesis", "voice"],
    rating: 4.7,
    downloads: "3.2k",
    price: "0.15 ETH",
    image: "/assets/asset-c.svg",
  },
  {
    slug: "predictnet-financial-v2",
    name: "PredictNet-Financial-v2",
    creator: "@EulerMetrics",
    address: "0xef12...90ab",
    category: "Predictive Analytics",
    categorySlug: "predictive",
    tags: ["predictive", "finance"],
    rating: 4.9,
    downloads: "14.1k",
    price: "0.82 ETH",
    image: "/assets/asset-d.svg",
  },
  {
    slug: "neuratranslator-global-pro",
    name: "NeuraTranslator-Global-Pro",
    creator: "@PangeaSys",
    address: "0xdd43...1122",
    category: "Translation",
    categorySlug: "nlp",
    tags: ["nlp", "translation", "language"],
    rating: 4.6,
    downloads: "2.1k",
    price: "0.10 ETH",
    image: "/assets/asset-e.svg",
  },
  {
    slug: "cyberguard-anomalies-7b",
    name: "CyberGuard-Anomalies-7B",
    creator: "@AegisSec",
    address: "0x889a...ff34",
    category: "Security",
    categorySlug: "llm",
    tags: ["llm", "security", "7b"],
    rating: 4.8,
    downloads: "6.4k",
    price: "0.55 ETH",
    image: "/assets/asset-f.svg",
  },
  {
    slug: "visionforge-pro",
    name: "VisionForge Pro",
    creator: "@VinciLabs",
    address: "0x8f4b...v320",
    category: "Image Generation · Diffusion",
    categorySlug: "image-gen",
    tags: ["image-gen", "diffusion", "photorealism", "text-to-image", "vinci-labs"],
    rating: 4.8,
    downloads: "12.4K",
    price: "0.48 ETH",
    image: "/assets/hero-portrait.svg",
    description:
      "State-of-the-art latent diffusion model fine-tuned for photorealistic assets, spatial precision, and high-fidelity textures. Decentralized hosting verified by zero-knowledge computation proofs.",
  },
];

export function getModel(slug) {
  return models.find((m) => m.slug === slug);
}

export function marketplaceHref(opts) {
  const params = new URLSearchParams();
  if (opts?.category && opts.category !== "all") {
    params.set("category", opts.category);
  }
  if (opts?.tag) params.set("tag", opts.tag);
  if (opts?.q) params.set("q", opts.q);
  if (opts?.page && opts.page > 1) params.set("page", String(opts.page));
  const qs = params.toString();
  return qs ? `/marketplace?${qs}` : "/marketplace";
}

export function filterModels(opts) {
  const category = opts.category?.toLowerCase();
  const tag = opts.tag?.toLowerCase();
  const q = opts.q?.trim().toLowerCase();

  return models.filter((model) => {
    if (category && category !== "all") {
      const matchesCategory =
        model.categorySlug === category ||
        model.tags.includes(category) ||
        model.category.toLowerCase().includes(category);
      if (!matchesCategory) return false;
    }

    if (tag) {
      const matchesTag =
        model.tags.includes(tag) ||
        model.categorySlug === tag ||
        model.name.toLowerCase().includes(tag);
      if (!matchesTag) return false;
    }

    if (q) {
      const haystack = [
        model.name,
        model.creator,
        model.address,
        model.category,
        ...model.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function categoryLabel(slug) {
  if (!slug || slug === "all") return "All Models";
  return (
    heroTags.find((t) => t.slug === slug)?.label ||
    categories.find((c) => c.slug === slug)?.name ||
    slug
  );
}
