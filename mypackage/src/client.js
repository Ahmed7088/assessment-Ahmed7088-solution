const {
  Contract,
  JsonRpcProvider,
  Wallet,
  parseEther,
  formatEther,
} = require("ethers");
const { marketplaceAbi } = require("./abi");

const DEFAULT_RPC = "http://127.0.0.1:8545";
const DEFAULT_MARKETPLACE = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DEFAULT_CHAIN_ID = 31337;
/** Hardhat account #0 — local relay only */
const DEFAULT_DEPLOYER_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
/** Hardhat account #1 — local relay only */
const DEFAULT_BUYER_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

function normalizeKey(raw, fallback) {
  const cleaned = (raw || "").trim().replace(/^"|"$/g, "");
  if (!cleaned || cleaned.length < 64) return fallback;
  return cleaned.startsWith("0x") ? cleaned : `0x${cleaned}`;
}

class MarketplaceClient {
  constructor(config = {}) {
    this.rpcUrl = config.rpcUrl || process.env.RPC_URL || DEFAULT_RPC;
    this.marketplaceAddress =
      config.marketplaceAddress ||
      process.env.MARKETPLACE_ADDRESS ||
      DEFAULT_MARKETPLACE;
    this.chainId = config.chainId ?? DEFAULT_CHAIN_ID;
    this.abi = config.abi ?? marketplaceAbi;

    this.deployerPrivateKey = normalizeKey(
      config.deployerPrivateKey || process.env.DEPLOYER_PRIVATE_KEY,
      DEFAULT_DEPLOYER_KEY,
    );
    this.buyerPrivateKey = normalizeKey(
      config.buyerPrivateKey || process.env.BUYER_PRIVATE_KEY,
      DEFAULT_BUYER_KEY,
    );
  }

  getProvider() {
    return new JsonRpcProvider(this.rpcUrl);
  }

  getDeployerWallet() {
    return new Wallet(this.deployerPrivateKey, this.getProvider());
  }

  getBuyerWallet() {
    return new Wallet(this.buyerPrivateKey, this.getProvider());
  }

  getContract(signerOrProvider) {
    return new Contract(
      this.marketplaceAddress,
      this.abi,
      signerOrProvider || this.getProvider(),
    );
  }

  get config() {
    return {
      rpcUrl: this.rpcUrl,
      marketplace: this.marketplaceAddress,
      chainId: this.chainId,
      abi: this.abi,
    };
  }

  async getStatus() {
    try {
      const provider = this.getProvider();
      const network = await provider.getNetwork();
      const block = await provider.getBlockNumber();
      const code = await provider.getCode(this.marketplaceAddress);
      const wallet = this.getDeployerWallet();
      const balance = await provider.getBalance(wallet.address);
      return {
        ok: code !== "0x",
        rpcUrl: this.rpcUrl,
        chainId: Number(network.chainId),
        marketplace: this.marketplaceAddress,
        blockNumber: block,
        deployer: wallet.address,
        deployerBalanceEth: formatEther(balance),
        connected: true,
      };
    } catch (error) {
      return {
        ok: false,
        rpcUrl: this.rpcUrl,
        marketplace: this.marketplaceAddress,
        connected: false,
        error: error instanceof Error ? error.message : "RPC unavailable",
      };
    }
  }

  async getListing(slug) {
    const market = this.getContract();
    const tokenId = await market.getTokenIdBySlug(slug);
    if (tokenId === 0n) return null;

    const listing = await market.getListing(tokenId);
    return {
      tokenId: Number(tokenId),
      creator: listing.creator,
      priceWei: listing.priceWei.toString(),
      priceEth: formatEther(listing.priceWei),
      royaltyBps: Number(listing.royaltyBps),
      slug: listing.slug,
      metadataURI: listing.metadataURI,
      active: Boolean(listing.active),
      totalLicensesSold: Number(listing.totalLicensesSold),
    };
  }

  async listModel(input) {
    const wallet = this.getDeployerWallet();
    const market = this.getContract(wallet);
    const existing = await market.getTokenIdBySlug(input.slug);

    if (existing !== 0n) {
      const listing = await this.getListing(input.slug);
      return { alreadyListed: true, listing, txHash: null };
    }

    const tx = await market.listModel(
      input.slug,
      input.metadataURI,
      parseEther(String(input.priceEth)),
      input.royaltyBps ?? 500,
    );
    const receipt = await tx.wait();
    const listing = await this.getListing(input.slug);
    return {
      alreadyListed: false,
      listing,
      txHash: receipt?.hash || tx.hash,
    };
  }

  async acquireLicense(slug, options) {
    const listing = await this.getListing(slug);
    if (!listing) {
      throw new Error(`No on-chain listing for slug=${slug}`);
    }

    const wallet = options?.buyerPrivateKey
      ? new Wallet(options.buyerPrivateKey, this.getProvider())
      : this.getBuyerWallet();

    const market = this.getContract(wallet);
    const owned = await market.hasLicense(listing.tokenId, wallet.address);
    if (owned) {
      return {
        alreadyOwned: true,
        listing,
        buyer: wallet.address,
        txHash: null,
      };
    }

    const tx = await market.acquireLicense(listing.tokenId, {
      value: BigInt(listing.priceWei),
    });
    const receipt = await tx.wait();
    return {
      alreadyOwned: false,
      listing,
      buyer: wallet.address,
      txHash: receipt?.hash || tx.hash,
    };
  }

  buildAcquireTx(listing) {
    const iface = new Contract(this.marketplaceAddress, this.abi).interface;
    const data = iface.encodeFunctionData("acquireLicense", [listing.tokenId]);
    return {
      to: this.marketplaceAddress,
      data,
      value: listing.priceWei,
      chainId: this.chainId,
    };
  }

  buildListTx(input) {
    const iface = new Contract(this.marketplaceAddress, this.abi).interface;
    const data = iface.encodeFunctionData("listModel", [
      input.slug,
      input.metadataURI,
      parseEther(String(input.priceEth)),
      input.royaltyBps ?? 500,
    ]);
    return {
      to: this.marketplaceAddress,
      data,
      value: "0",
      chainId: this.chainId,
    };
  }
}

/** Create a configured marketplace client */
function createMarketplaceClient(config) {
  return new MarketplaceClient(config);
}

module.exports = {
  MarketplaceClient,
  createMarketplaceClient,
};
