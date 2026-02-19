const { randomUUID } = require("crypto");
const { Router } = require("express");
const { z } = require("zod");
const {
  createModel,
  filterModels,
  findModel,
  getCategories,
  store,
} = require("../data/store");
const { optionalAuth, requireAuth } = require("../middleware/auth");

const modelsRouter = Router();

modelsRouter.get("/", (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;
  const page = Math.max(1, Number(req.query.page || 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 6) || 6));

  const filtered = filterModels({ category, q, tag });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  res.json({
    items,
    pagination: {
      page: currentPage,
      pageSize,
      total,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
    filters: { category: category || "all", q: q || "", tag: tag || "" },
  });
});

modelsRouter.get("/:slug", (req, res) => {
  const model = findModel(req.params.slug);
  if (!model) {
    res.status(404).json({ error: "NotFound", message: "Model not found" });
    return;
  }

  const related = store.models
    .filter((m) => m.slug !== model.slug)
    .sort(
      (a, b) =>
        Number(b.categorySlug === model.categorySlug) -
        Number(a.categorySlug === model.categorySlug),
    )
    .slice(0, 4);

  res.json({ model, related });
});

const createSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(80),
  categorySlug: z.string().min(2).max(40),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  priceEth: z.number().min(0).max(100).default(0.1),
  image: z.string().optional(),
  framework: z.enum(["PyTorch", "TensorFlow", "ONNX"]).optional(),
  creator: z.string().optional(),
  // Opt-in only. Default off so a creator wallet can list the server-generated
  // slug without hitting SlugTaken from the deployer already claiming it.
  listOnChain: z.boolean().optional().default(false),
});

modelsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "ValidationError", details: parsed.error.flatten() });
    return;
  }

  const { listOnChain: shouldListOnChain, ...data } = parsed.data;
  const model = createModel({
    ...data,
    creator: data.creator || req.user?.email || "@anonymous",
  });

  let onChain = null;
  if (shouldListOnChain) {
    try {
      const { listModelOnChain } = require("../chain/marketplace");
      onChain = await listModelOnChain({
        slug: model.slug,
        metadataURI: `https://NuvyraHub.local/metadata/${model.slug}.json`,
        priceEth: model.priceEth,
        royaltyBps: 500,
      });
    } catch (error) {
      onChain = {
        error: error instanceof Error ? error.message : "chain list skipped",
      };
    }
  }

  res.status(201).json({
    model,
    onChain,
    message: shouldListOnChain
      ? "Model listed on decentralized market"
      : "Model published. List on-chain with a wallet or POST /api/chain/list/:slug",
  });
});

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().min(10).max(2000).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  priceEth: z.number().min(0).max(100).optional(),
  status: z.enum(["Active", "Compiling", "Paused"]).optional(),
});

modelsRouter.patch("/:slug", requireAuth, (req, res) => {
  const model = findModel(req.params.slug);
  if (!model) {
    res.status(404).json({ error: "NotFound", message: "Model not found" });
    return;
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "ValidationError", details: parsed.error.flatten() });
    return;
  }

  Object.assign(model, parsed.data);
  if (typeof parsed.data.priceEth === "number") {
    model.price = `${parsed.data.priceEth.toFixed(2)} ETH`;
  }
  model.updatedAt = new Date().toISOString();

  res.json({ model });
});

modelsRouter.delete("/:slug", requireAuth, (req, res) => {
  const idx = store.models.findIndex((m) => m.slug === req.params.slug);
  if (idx < 0) {
    res.status(404).json({ error: "NotFound", message: "Model not found" });
    return;
  }
  const [removed] = store.models.splice(idx, 1);
  res.json({ deleted: true, model: removed });
});

const acquireSchema = z.object({
  walletAddress: z.string().min(6).max(80).optional(),
});

modelsRouter.post("/:slug/acquire", optionalAuth, async (req, res) => {
  const model = findModel(req.params.slug);
  if (!model) {
    res.status(404).json({ error: "NotFound", message: "Model not found" });
    return;
  }

  const parsed = acquireSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "ValidationError", details: parsed.error.flatten() });
    return;
  }

  // Prefer real on-chain acquire via backend signer when chain is up
  try {
    const { acquireLicenseOnChain, getOnChainListing, listModelOnChain } =
      require("../chain/marketplace");

    let listing = await getOnChainListing(model.slug);
    if (!listing) {
      await listModelOnChain({
        slug: model.slug,
        metadataURI: `https://NuvyraHub.local/metadata/${model.slug}.json`,
        priceEth: model.priceEth,
      });
      listing = await getOnChainListing(model.slug);
    }

    const result = await acquireLicenseOnChain(model.slug);
    const acquisition = {
      id: randomUUID(),
      modelSlug: model.slug,
      userId: req.user?.id || "anonymous",
      walletAddress: result.buyer,
      priceEth: model.priceEth,
      txHash: result.txHash || `already-owned:${result.buyer}`,
      createdAt: new Date().toISOString(),
      onChain: true,
      tokenId: listing?.tokenId,
    };

    store.acquisitions.push(acquisition);
    if (!result.alreadyOwned) {
      model.downloadsCount += 1;
      model.downloads =
        model.downloadsCount >= 1000
          ? `${(model.downloadsCount / 1000).toFixed(1).replace(/\.0$/, "")}k`
          : String(model.downloadsCount);
      model.updatedAt = new Date().toISOString();
    }

    res.status(201).json({
      acquisition,
      model,
      listing,
      onChain: result,
      message: result.alreadyOwned
        ? "Ownership already on-chain"
        : "Ownership contract acquired on-chain",
    });
    return;
  } catch {
    // Fallback to simulated acquisition if chain is offline
  }

  const wallet =
    parsed.data.walletAddress ||
    req.user?.walletAddress ||
    `0x${Math.random().toString(16).slice(2, 6)}...${Math.random()
      .toString(16)
      .slice(2, 6)}`;

  const acquisition = {
    id: randomUUID(),
    modelSlug: model.slug,
    userId: req.user?.id || "anonymous",
    walletAddress: wallet,
    priceEth: model.priceEth,
    txHash: `0x${randomUUID().replace(/-/g, "")}`,
    createdAt: new Date().toISOString(),
    onChain: false,
  };

  store.acquisitions.push(acquisition);
  model.downloadsCount += 1;
  model.downloads =
    model.downloadsCount >= 1000
      ? `${(model.downloadsCount / 1000).toFixed(1).replace(/\.0$/, "")}k`
      : String(model.downloadsCount);
  model.updatedAt = new Date().toISOString();

  res.status(201).json({
    acquisition,
    model,
    message: "Ownership contract acquired (simulated — chain offline)",
  });
});

const inferSchema = z.object({
  prompt: z.string().min(1).max(2000),
  steps: z.number().int().min(1).max(100).optional(),
  guidanceScale: z.number().min(0).max(30).optional(),
});

modelsRouter.post("/:slug/infer", optionalAuth, async (req, res) => {
  const model = findModel(req.params.slug);
  if (!model) {
    res.status(404).json({ error: "NotFound", message: "Model not found" });
    return;
  }

  const parsed = inferSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "ValidationError", details: parsed.error.flatten() });
    return;
  }

  const job = {
    id: randomUUID(),
    modelSlug: model.slug,
    prompt: parsed.data.prompt,
    status: "queued",
    createdAt: new Date().toISOString(),
  };
  store.inferences.unshift(job);

  const started = Date.now();
  job.status = "running";
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

  job.status = "completed";
  job.latencyMs = Date.now() - started;
  job.completedAt = new Date().toISOString();
  job.result = [
    `NuvyraHub inference via ${model.name}`,
    `prompt=${JSON.stringify(parsed.data.prompt)}`,
    `steps=${parsed.data.steps ?? 50}`,
    `guidance=${parsed.data.guidanceScale ?? 7.5}`,
    `output=zk-verified://result/${job.id.slice(0, 8)}`,
  ].join("\n");

  res.status(201).json({
    job,
    model: { slug: model.slug, name: model.name },
  });
});

modelsRouter.get("/:slug/inferences", (req, res) => {
  const model = findModel(req.params.slug);
  if (!model) {
    res.status(404).json({ error: "NotFound", message: "Model not found" });
    return;
  }
  const jobs = store.inferences.filter((j) => j.modelSlug === model.slug).slice(0, 20);
  res.json({ items: jobs });
});

const metaRouter = Router();

metaRouter.get("/categories", (_req, res) => {
  res.json({ items: getCategories() });
});

metaRouter.get("/tags", (_req, res) => {
  const tags = new Map();
  for (const model of store.models) {
    for (const tag of model.tags) {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    }
  }
  res.json({
    items: [...tags.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
  });
});

metaRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "NuvyraHub-backend",
    models: store.models.length,
    users: store.users.length,
    acquisitions: store.acquisitions.length,
    inferences: store.inferences.length,
    time: new Date().toISOString(),
  });
});

module.exports = { modelsRouter, metaRouter };
