const fs = require("fs");
const path = require("path");
const { createMarketplaceClient } = require("mypackage");

function loadSharedAddress() {
  try {
    const candidates = [
      path.join(__dirname, "..", "..", "..", "..", "shared", "contracts.json"),
      path.join(process.cwd(), "..", "shared", "contracts.json"),
      path.join(process.cwd(), "shared", "contracts.json"),
    ];
    for (const file of candidates) {
      if (!fs.existsSync(file)) continue;
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      if (data.marketplace) return data.marketplace;
    }
  } catch {
    // ignore — SDK defaults apply
  }
  return undefined;
}

const sharedAddress = loadSharedAddress();
const client = createMarketplaceClient({
  ...(process.env.MARKETPLACE_ADDRESS
    ? { marketplaceAddress: process.env.MARKETPLACE_ADDRESS }
    : sharedAddress
      ? { marketplaceAddress: sharedAddress }
      : {}),
});

const chainConfig = {
  get rpcUrl() {
    return client.rpcUrl;
  },
  get marketplace() {
    return client.marketplaceAddress;
  },
  get chainId() {
    return client.chainId;
  },
  get abi() {
    return client.abi;
  },
};

function getProvider() {
  return client.getProvider();
}

function getDeployerWallet() {
  return client.getDeployerWallet();
}

function getBuyerWallet() {
  return client.getBuyerWallet();
}

function getMarketplace(signerOrProvider) {
  return client.getContract(signerOrProvider);
}

function getChainStatus() {
  return client.getStatus();
}

function getOnChainListing(slug) {
  return client.getListing(slug);
}

function listModelOnChain(input) {
  return client.listModel(input);
}

function acquireLicenseOnChain(slug, buyerPrivateKey) {
  return client.acquireLicense(
    slug,
    buyerPrivateKey ? { buyerPrivateKey } : undefined,
  );
}

function buildAcquireTxRequest(listing) {
  return client.buildAcquireTx(listing);
}

function buildListTxRequest(input) {
  return client.buildListTx(input);
}

module.exports = {
  chainConfig,
  getProvider,
  getDeployerWallet,
  getBuyerWallet,
  getMarketplace,
  getChainStatus,
  getOnChainListing,
  listModelOnChain,
  acquireLicenseOnChain,
  buildAcquireTxRequest,
  buildListTxRequest,
  marketplaceClient: client,
};
