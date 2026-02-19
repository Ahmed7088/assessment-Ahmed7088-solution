# NuvyraHub Backend

Express JavaScript API. In-memory catalog/auth, plus on-chain list/acquire through the local `mypackage` SDK.

API base: `http://localhost:4000`

Run from the `project/` folder (this API is started with the UI):

```bash
cd project
npm run setup   # installs ../mypackage, then npm install
npm run dev
```

## Environment

See `backend/.env`. Used by `mypackage` when options are omitted:

| Variable | Default |
|----------|---------|
| `PORT` | `4000` |
| `RPC_URL` | `http://127.0.0.1:8545` |
| `MARKETPLACE_ADDRESS` | `shared/contracts.json` or Hardhat local deploy |
| `DEPLOYER_PRIVATE_KEY` | Hardhat #0 (local only) |
| `BUYER_PRIVATE_KEY` | Hardhat #1 (local only) |
| `FRONTEND_ORIGIN` | extra allowed CORS origin |

If the Hardhat node is down, catalog and auth still work; acquire falls back to a simulated tx.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | no | Service health |
| GET | `/api/categories` | no | Category list |
| GET | `/api/tags` | no | Tag frequencies |
| GET | `/api/models` | no | List/filter (`category`, `q`, `tag`, `page`, `pageSize`) |
| GET | `/api/models/:slug` | no | Model detail + related |
| POST | `/api/models` | Bearer | Publish a model (also lists on-chain when RPC is up) |
| PATCH | `/api/models/:slug` | Bearer | Update model |
| DELETE | `/api/models/:slug` | Bearer | Delete model |
| POST | `/api/models/:slug/acquire` | optional | Relay acquire (on-chain, or simulated if RPC is down) |
| POST | `/api/models/:slug/infer` | optional | Demo inference job |
| GET | `/api/models/:slug/inferences` | no | Recent inference jobs |
| GET | `/api/chain/status` | no | RPC + marketplace status |
| GET | `/api/chain/config` | no | Address, chain id, ABI |
| GET | `/api/chain/listing/:slug` | no | On-chain listing |
| POST | `/api/chain/list/:slug` | optional | List on-chain (`?mode=tx` for unsigned tx) |
| POST | `/api/chain/acquire/:slug` | optional | `relay` / `tx` / `confirm` |
| POST | `/api/auth/signup` | no | Create account |
| POST | `/api/auth/login` | no | Sign in (demo: auto-provisions unknown emails) |
| POST | `/api/auth/wallet` | no | Connect wallet |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/auth/logout` | Bearer | Logout |
| GET | `/api/dashboard` | optional | Creator dashboard metrics |

`POST /api/chain/acquire/:slug` body:

```json
{ "mode": "relay" }
{ "mode": "tx" }
{ "mode": "confirm", "txHash": "0x…", "walletAddress": "0x…" }
```

## Example

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/models?category=llm
curl http://localhost:4000/api/chain/status
curl -X POST http://localhost:4000/api/auth/wallet -H "Content-Type: application/json" -d "{\"walletAddress\":\"0xABC123\"}"
curl -X POST http://localhost:4000/api/models/visionforge-pro/infer -H "Content-Type: application/json" -d "{\"prompt\":\"neon city\"}"
```
