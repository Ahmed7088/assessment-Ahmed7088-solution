# mypackage

Node SDK for the NuvyraHub on-chain AI model marketplace. List models, acquire licenses, read listings, and build unsigned wallet transactions.

Requires **Node.js 18+** and **ethers v6**.

In this monorepo the package name is `mypackage` (`file:../mypackage` from `project/`). The API below is the same if you publish it under another name.

## Install (this repo)

```bash
cd mypackage
npm install
```

The app already depends on it from `project/package.json`:

```json
"mypackage": "file:../mypackage"
```

From `project/`, `npm run setup` installs this package, then installs app deps.

## Quick start

```js
const { createMarketplaceClient } = require("mypackage");

const client = createMarketplaceClient({
  rpcUrl: "http://127.0.0.1:8545",
  marketplaceAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  chainId: 31337,
});

async function main() {
  const status = await client.getStatus();
  console.log(status);

  const listing = await client.getListing("visionforge-pro");
  console.log(listing);

  // Relay: server signs with deployer / buyer keys (local Hardhat defaults)
  await client.listModel({
    slug: "my-model",
    metadataURI: "https://example.com/meta/my-model.json",
    priceEth: 0.1,
    royaltyBps: 500,
  });

  await client.acquireLicense("my-model");

  // Or build unsigned txs for a browser wallet
  if (listing) {
    console.log(client.buildAcquireTx(listing));
  }
}

main();
```

ESM:

```js
import { createMarketplaceClient } from "mypackage";
```

## Config

Pass options to `createMarketplaceClient()` or `new MarketplaceClient()`. Env vars are used when an option is omitted.

| Option | Env fallback | Default |
|--------|--------------|---------|
| `rpcUrl` | `RPC_URL` | `http://127.0.0.1:8545` |
| `marketplaceAddress` | `MARKETPLACE_ADDRESS` | Hardhat deploy address |
| `chainId` | — | `31337` |
| `deployerPrivateKey` | `DEPLOYER_PRIVATE_KEY` | Hardhat #0 (local only) |
| `buyerPrivateKey` | `BUYER_PRIVATE_KEY` | Hardhat #1 (local only) |
| `abi` | — | Bundled NuvyraHubMarketplace ABI |

Default private keys are Hardhat accounts and are **not** for production.

## API

### `createMarketplaceClient(config?)`

Returns a `MarketplaceClient`. Same as `new MarketplaceClient(config)`.

### Reads

| Method | Description |
|--------|-------------|
| `getStatus()` | RPC connectivity, chain id, marketplace code, deployer balance |
| `getListing(slug)` | On-chain listing, or `null` if the slug is not listed |

### Relay (server-signed)

These methods sign with the configured deployer/buyer keys.

| Method | Description |
|--------|-------------|
| `listModel(input)` | List a model. If the slug already exists, returns `{ alreadyListed: true }` without sending a tx |
| `acquireLicense(slug, opts?)` | Buy a license. Pass `opts.buyerPrivateKey` to override the default buyer. If already owned, returns `{ alreadyOwned: true }` |

`listModel` input:

```js
{
  slug: "my-model",
  metadataURI: "https://example.com/meta/my-model.json",
  priceEth: 0.1,
  royaltyBps: 500, // optional, default 500 (5%)
}
```

### Unsigned txs (browser wallets)

| Method | Description |
|--------|-------------|
| `buildListTx(input)` | Unsigned `listModel` tx (`to`, `data`, `value`, `chainId`) |
| `buildAcquireTx(listing)` | Unsigned `acquireLicense` tx; `listing` needs `tokenId` and `priceWei` |

### Helpers

| Method | Description |
|--------|-------------|
| `getProvider()` | `ethers.JsonRpcProvider` |
| `getDeployerWallet()` | Deployer `Wallet` |
| `getBuyerWallet()` | Buyer `Wallet` |
| `getContract(signerOrProvider?)` | Marketplace `Contract` |
| `config` | `{ rpcUrl, marketplace, chainId, abi }` |

### ABI

```js
const { marketplaceAbi } = require("mypackage");
// or
const { marketplaceAbi } = require("mypackage/abi");
```

## License

MIT
