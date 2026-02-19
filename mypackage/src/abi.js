const marketplaceArtifact = require("./abi/NuvyraHubMarketplace.json");

/** Bundled NuvyraHubMarketplace contract ABI */
const marketplaceAbi = marketplaceArtifact.abi;

module.exports = { marketplaceAbi };
module.exports.default = marketplaceAbi;
