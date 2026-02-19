const { Router } = require("express");
const { store } = require("../data/store");
const { optionalAuth } = require("../middleware/auth");

const dashboardRouter = Router();

dashboardRouter.get("/", optionalAuth, (req, res) => {
  const owned = store.models.filter((m) =>
    m.creator.toLowerCase().includes("vinci") ||
    store.acquisitions.some(
      (a) => a.modelSlug === m.slug && a.userId === (req.user?.id || ""),
    ),
  );

  const creatorModels =
    owned.length > 0
      ? owned
      : store.models.filter((m) =>
          ["visionforge-pro", "synthdiffusion-v4-highres", "deepvoice-wave-custom"].includes(
            m.slug,
          ),
        );

  const revenue = store.acquisitions.reduce((sum, a) => sum + a.priceEth, 0);
  const calls = 1_200_000 + store.inferences.length * 17;

  res.json({
    headline: "VinciLabs Protocol Metrics",
    network: "DASHBOARD PLATFORM // MAIN_NET",
    wallet: req.user?.walletAddress || "0x9df4...32ac",
    stats: [
      {
        label: "TOTAL PROTOCOL REVENUE",
        value: `$${(24850 + revenue * 3200).toLocaleString("en-US", {
          maximumFractionDigits: 0,
        })}`,
        meta: "+12.3% vs prev",
      },
      {
        label: "API COMPUTATIONAL RUNS",
        value: `${(calls / 1_000_000).toFixed(1)}M Calls`,
        meta: "+8.4%",
      },
      {
        label: "ACTIVE VERIFIED MODELS",
        value: `${creatorModels.length} Models`,
        meta: "All Live",
      },
      {
        label: "CUMULATIVE MODEL RATING",
        value: "4.7 Stars",
        meta: "42 reviews",
      },
    ],
    revenueSeries: [35, 48, 42, 62, 58, 78, 70, 88, 82, 95],
    months: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    models: creatorModels.map((m) => ({
      slug: m.slug,
      name: m.name,
      status: m.status,
      price: m.price,
      rating: m.rating,
      downloads: m.downloads,
    })),
    recentAcquisitions: store.acquisitions.slice(-10).reverse(),
    recentInferences: store.inferences.slice(0, 10),
  });
});

module.exports = { dashboardRouter };
