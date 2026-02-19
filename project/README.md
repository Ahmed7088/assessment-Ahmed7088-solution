# NuvyraHub Project

Next.js 16 UI and Express API in one folder. One `package.json`, one `node_modules`, one command for both servers.

The API lives in `backend/`. The UI lives in `src/`.

## Run

```bash
cd project
npm install
npm run dev
```

- UI: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:4000](http://localhost:4000)

Optionally start the Hardhat node first (`cd ../contracts-project && npm run node`). If the chain is down, catalog and auth still work; acquire is simulated.

First-time setup (installs `../mypackage`, then this package):

```bash
npm run setup
```

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | API (`node --watch`) + Next.js dev |
| `npm start` | API + `next start` (after `npm run build`) |
| `npm run build` | Next.js production build |
| `npm run lint` | ESLint |

## Routes

| Path | Description |
|------|-------------|
| `/` | Marketing home |
| `/marketplace` | Catalog with category / tag / search |
| `/models/[slug]` | Detail, relay acquire, MetaMask acquire, demo inference |
| `/upload` | Publish a model |
| `/dashboard` | Creator dashboard |
| `/pricing` | Plans |
| `/sign-up` | Signup |

If the API is offline, catalog pages fall back to seed data in `src/lib/data.js`.

## Environment

Backend (`backend/.env`):

| Variable | Default |
|----------|---------|
| `PORT` | `4000` |
| `RPC_URL` | `http://127.0.0.1:8545` |
| `MARKETPLACE_ADDRESS` | `shared/contracts.json` or Hardhat local deploy |
| `DEPLOYER_PRIVATE_KEY` | Hardhat #0 (local only) |
| `BUYER_PRIVATE_KEY` | Hardhat #1 (local only) |
| `FRONTEND_ORIGIN` | extra allowed CORS origin |

Optional UI (`.env.local`):

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |
| `NEXT_PUBLIC_CHAIN_ID` | `31337` |
| `NEXT_PUBLIC_RPC_URL` | `http://127.0.0.1:8545` |
| `NEXT_PUBLIC_MARKETPLACE_ADDRESS` | local Hardhat marketplace |
