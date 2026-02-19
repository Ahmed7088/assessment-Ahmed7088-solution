const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, feeRecipient] = await ethers.getSigners();
  console.log("Deploying NuvyraHubMarketplace with:", deployer.address);

  const Factory = await ethers.getContractFactory("NuvyraHubMarketplace");
  const marketplace = await Factory.deploy(
    deployer.address,
    feeRecipient?.address || deployer.address,
  );
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("NuvyraHubMarketplace deployed to:", address);

  const seeds = [
    {
      slug: "visionforge-pro",
      uri: "https://NuvyraHub.local/metadata/visionforge-pro.json",
      price: ethers.parseEther("0.48"),
      royaltyBps: 500,
    },
    {
      slug: "aura-llama-70b-decentral",
      uri: "https://NuvyraHub.local/metadata/aura-llama-70b-decentral.json",
      price: ethers.parseEther("0.48"),
      royaltyBps: 500,
    },
    {
      slug: "synthdiffusion-v4-highres",
      uri: "https://NuvyraHub.local/metadata/synthdiffusion-v4-highres.json",
      price: ethers.parseEther("0.32"),
      royaltyBps: 750,
    },
  ];

  for (const seed of seeds) {
    const tx = await marketplace.listModel(
      seed.slug,
      seed.uri,
      seed.price,
      seed.royaltyBps,
    );
    await tx.wait();
    const tokenId = await marketplace.getTokenIdBySlug(seed.slug);
    console.log(`Listed ${seed.slug} as tokenId=${tokenId}`);
  }

  const network = await ethers.provider.getNetwork();
  const out = {
    network: network.name,
    chainId: Number(network.chainId),
    marketplace: address,
    deployer: deployer.address,
    feeRecipient: feeRecipient?.address || deployer.address,
    deployedAt: new Date().toISOString(),
    seeds: seeds.map((s) => s.slug),
  };

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `localhost-${out.chainId}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log("Wrote", file);

  const sharedDir = path.join(__dirname, "..", "..", "shared");
  fs.mkdirSync(sharedDir, { recursive: true });
  fs.writeFileSync(path.join(sharedDir, "contracts.json"), JSON.stringify(out, null, 2));
  console.log("Wrote shared/contracts.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
