# NuvyraHub - Test

Decentralized AI model marketplace. Creators list models, buyers mint ERC-1155 licenses (ETH), and the app serves a demo inference API.

## Architecture

```
project (Next.js :3000 + Express :4000)
    │  REST (same process tree, one npm command)
    │
    ├── src/          Next.js UI
    └── backend/      Express API  ── uses ──►  mypackage (ethers SDK)
                            │  JSON-RPC
                            ▼
                    Hardhat node (:8545)  ◄──  NuvyraHubMarketplace (ERC-1155)
```

| Folder | Role | Port |
|--------|------|------|
| `project` | Next.js UI + Express API (one `package.json`) | 3000 / 4000 |
| `mypackage` | Node SDK (`ethers` v6) for list / acquire / reads | — |
| `contracts-project` | Hardhat ERC-1155 marketplace | 8545 |
| `shared` | Deployed address + ABI copies | — |

## Prerequisites

- Node.js 18+
- npm
- MetaMask (optional, for wallet acquire)

## First-time setup

```bash
cd contracts-project
npm install --legacy-peer-deps

cd ../mypackage
npm install

cd ../project
npm install
```

Or from `project/`, run `npm run setup` to install `mypackage`, then install project deps.

## Run locally

Three terminals, in this order.

```bash
# 1) Local chain
cd contracts-project
npm run node

# 2) Deploy + export ABI (other terminal)
cd contracts-project
npm run deploy:local
npm run export-abi

# 3) API + UI
cd project
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API: [http://localhost:4000](http://localhost:4000).

If the chain is down, the API still serves models and simulates acquire.

## Pages

| Path | Description |
|------|-------------|
| `/` | Marketing home |
| `/marketplace` | Browse / filter models |
| `/models/[slug]` | Detail, relay acquire, MetaMask acquire, demo inference |
| `/upload` | Publish a model (Bearer session) |
| `/dashboard` | Creator metrics |
| `/pricing` | Plans |
| `/sign-up` | Email / passphrase signup |

## On-chain flow

1. Creator publishes → backend calls `listModel` on `NuvyraHubMarketplace` (via `mypackage`).
2. **Acquire Contract (Relay)** → backend buyer wallet pays ETH and mints an ERC-1155 license.
3. **Acquire With MetaMask** → wallet signs `acquireLicense`; backend records the tx (`mode: confirm`).

Local Hardhat marketplace: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (account #0). Platform fee is 2.5%.

Default Hardhat keys are for **local relay only** — never use them on a public network.

## Environment

Backend (`project/backend/.env`):

| Variable | Default |
|----------|---------|
| `PORT` | `4000` |
| `RPC_URL` | `http://127.0.0.1:8545` |
| `MARKETPLACE_ADDRESS` | from `shared/contracts.json` or Hardhat #0 deploy |
| `DEPLOYER_PRIVATE_KEY` | Hardhat account #0 |
| `BUYER_PRIVATE_KEY` | Hardhat account #1 |
| `FRONTEND_ORIGIN` | optional extra CORS origin |

Frontend (optional `project/.env.local`):

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |
| `NEXT_PUBLIC_CHAIN_ID` | `31337` |
| `NEXT_PUBLIC_RPC_URL` | `http://127.0.0.1:8545` |
| `NEXT_PUBLIC_MARKETPLACE_ADDRESS` | local Hardhat marketplace |

## Package docs

- [project/README.md](project/README.md)
- [project/backend/README.md](project/backend/README.md)
- [mypackage/README.md](mypackage/README.md)
- [contracts-project/README.md](contracts-project/README.md)
