const { randomUUID } = require("crypto");

function eth(price) {
  return `${price.toFixed(2)} ETH`;
}

const seedModels = [
  {
    id: randomUUID(),
    slug: "aura-llama-70b-decentral",
    name: "Aura-Llama-70B-Decentral",
    creator: "@SpectralAI",
    address: "0x8f0f...3e41",
    category: "LLM",
    categorySlug: "llm",
    tags: ["llm", "70b", "language"],
    rating: 4.9,
    downloads: "12.4k",
    downloadsCount: 12400,
    priceEth: 0.48,
    price: eth(0.48),
    image: "/assets/asset-a.svg",
    description:
      "High-throughput decentralized LLM weights with on-chain ownership and verified inference.",
    version: "v3.1",
    status: "Active",
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
  },
  {
    id: randomUUID(),
    slug: "synthdiffusion-v4-highres",
    name: "SynthDiffusion-v4-HighRes",
    creator: "@VinciLabs",
    address: "0x1a2d...e982",
    category: "Image Gen",
    categorySlug: "image-gen",
    tags: ["image-gen", "diffusion", "photorealism", "vinci-labs"],
    rating: 4.8,
    downloads: "8.9k",
    downloadsCount: 8900,
    priceEth: 0.32,
    price: eth(0.32),
    image: "/assets/asset-b.svg",
    description:
      "High-resolution diffusion model optimized for cinematic and product renders.",
    version: "v4.0",
    status: "Active",
    createdAt: "2026-04-02T10:00:00.000Z",
    updatedAt: "2026-07-18T10:00:00.000Z",
  },
  {
    id: randomUUID(),
    slug: "deepvoice-wave-custom",
    name: "DeepVoice-Wave-Custom",
    creator: "@KortexGroup",
    address: "0xbc33...511a",
    category: "Audio Synthesizer",
    categorySlug: "audio",
    tags: ["audio", "synthesis", "voice"],
    rating: 4.7,
    downloads: "3.2k",
    downloadsCount: 3200,
    priceEth: 0.15,
    price: eth(0.15),
    image: "/assets/asset-c.svg",
    description: "Customizable Nuvyra voice synthesis with low-latency streaming.",
    version: "v2.4",
    status: "Compiling",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-07-22T10:00:00.000Z",
  },
  {
    id: randomUUID(),
    slug: "predictnet-financial-v2",
    name: "PredictNet-Financial-v2",
    creator: "@EulerMetrics",
    address: "0xef12...90ab",
    category: "Predictive Analytics",
    categorySlug: "predictive",
    tags: ["predictive", "finance"],
    rating: 4.9,
    downloads: "14.1k",
    downloadsCount: 14100,
    priceEth: 0.82,
    price: eth(0.82),
    image: "/assets/asset-d.svg",
    description: "Market forecasting model with on-chain verification proofs.",
    version: "v2.0",
    status: "Active",
    createdAt: "2026-03-11T10:00:00.000Z",
    updatedAt: "2026-07-15T10:00:00.000Z",
  },
  {
    id: randomUUID(),
    slug: "neuratranslator-global-pro",
    name: "NeuraTranslator-Global-Pro",
    creator: "@PangeaSys",
    address: "0xdd43...1122",
    category: "Translation",
    categorySlug: "nlp",
    tags: ["nlp", "translation", "language"],
    rating: 4.6,
    downloads: "2.1k",
    downloadsCount: 2100,
    priceEth: 0.1,
    price: eth(0.1),
    image: "/assets/asset-e.svg",
    description: "Multilingual translation with cryptographic attestation.",
    version: "v1.8",
    status: "Active",
    createdAt: "2026-02-20T10:00:00.000Z",
    updatedAt: "2026-07-10T10:00:00.000Z",
  },
  {
    id: randomUUID(),
    slug: "cyberguard-anomalies-7b",
    name: "CyberGuard-Anomalies-7B",
    creator: "@AegisSec",
    address: "0x889a...ff34",
    category: "Security",
    categorySlug: "llm",
    tags: ["llm", "security", "7b"],
    rating: 4.8,
    downloads: "6.4k",
    downloadsCount: 6400,
    priceEth: 0.55,
    price: eth(0.55),
    image: "/assets/asset-f.svg",
    description: "Security anomaly detection LLM for on-chain telemetry.",
    version: "v1.3",
    status: "Active",
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-07-19T10:00:00.000Z",
  },
  {
    id: randomUUID(),
    slug: "visionforge-pro",
    name: "VisionForge Pro",
    creator: "@VinciLabs",
    address: "0x8f4b...v320",
    category: "Image Generation · Diffusion",
    categorySlug: "image-gen",
    tags: ["image-gen", "diffusion", "photorealism", "text-to-image", "vinci-labs"],
    rating: 4.8,
    downloads: "12.4K",
    downloadsCount: 12400,
    priceEth: 0.48,
    price: eth(0.48),
    image: "/assets/hero-portrait.svg",
    description:
      "State-of-the-art latent diffusion model fine-tuned for photorealistic assets, spatial precision, and high-fidelity textures. Decentralized hosting verified by zero-knowledge computation proofs.",
    version: "v3.2",
    status: "Active",
    createdAt: "2026-01-08T10:00:00.000Z",
    updatedAt: "2026-07-25T10:00:00.000Z",
  },
];

const baseCategories = [
  { name: "Large Language Models", slug: "llm" },
  { name: "Image Generation", slug: "image-gen" },
  { name: "Audio Synthesis", slug: "audio" },
  { name: "Video Diffusion", slug: "video" },
  { name: "Predictive Analytics", slug: "predictive" },
  { name: "Natural Language", slug: "nlp" },
];

function formatDownloads(count) {
  if (count >= 1000) {
    const k = count / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(count);
}

const store = {
  models: [...seedModels],
  users: [],
  sessions: [],
  acquisitions: [],
  inferences: [],
};

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getCategories() {
  return baseCategories.map((c) => ({
    ...c,
    count: store.models.filter((m) => m.categorySlug === c.slug).length,
  }));
}

function filterModels(opts) {
  const category = opts.category?.toLowerCase();
  const tag = opts.tag?.toLowerCase();
  const q = opts.q?.trim().toLowerCase();

  return store.models.filter((model) => {
    if (category && category !== "all") {
      const matches =
        model.categorySlug === category ||
        model.tags.includes(category) ||
        model.category.toLowerCase().includes(category);
      if (!matches) return false;
    }

    if (tag) {
      const matches =
        model.tags.includes(tag) ||
        model.categorySlug === tag ||
        model.name.toLowerCase().includes(tag);
      if (!matches) return false;
    }

    if (q) {
      const haystack = [
        model.name,
        model.creator,
        model.address,
        model.category,
        model.description,
        ...model.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

function findModel(slug) {
  return store.models.find((m) => m.slug === slug);
}

function bumpDownloads(model) {
  model.downloadsCount += 1;
  model.downloads = formatDownloads(model.downloadsCount);
  model.updatedAt = new Date().toISOString();
}

function createModel(input) {
  let slug = slugify(input.name);
  if (findModel(slug)) slug = `${slug}-${Date.now().toString(36)}`;

  const model = {
    id: randomUUID(),
    slug,
    name: input.name,
    creator: input.creator,
    address: `0x${randomUUID().replace(/-/g, "").slice(0, 4)}...${randomUUID()
      .replace(/-/g, "")
      .slice(0, 4)}`,
    category: input.category,
    categorySlug: input.categorySlug,
    tags: input.tags,
    rating: 0,
    downloads: "0",
    downloadsCount: 0,
    priceEth: input.priceEth,
    price: eth(input.priceEth),
    image: input.image || "/assets/network-sphere.svg",
    description: input.description,
    version: "v1.0",
    status: "Compiling",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.models.unshift(model);
  return model;
}

function getSession(token) {
  if (!token) return null;
  const session = store.sessions.find((s) => s.token === token);
  if (!session) return null;
  const user = store.users.find((u) => u.id === session.userId);
  if (!user) return null;
  return { session, user };
}

function createSession(userId) {
  const session = {
    token: randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
  };
  store.sessions.push(session);
  return session;
}

module.exports = {
  store,
  slugify,
  getCategories,
  filterModels,
  findModel,
  bumpDownloads,
  createModel,
  getSession,
  createSession,
};
