# NuvyraHub Smart Contracts

Hardhat project for the NuvyraHub ERC-1155 model license marketplace.

## Contract

`NuvyraHubMarketplace` (`contracts/NuvyraHubMarketplace.sol`)

- `listModel(slug, metadataURI, priceWei, royaltyBps)` — creator lists a model
- `acquireLicense(tokenId)` — buyer pays ETH, receives ERC-1155 license
- Platform fee: 2.5% to fee recipient
- Events: `ModelListed`, `LicenseAcquired`

## Commands

```bash
cd contracts-project
npm install --legacy-peer-deps
npm run compile
npm test

# terminal A
npm run node

# terminal B
npm run deploy:local
npm run export-abi
```

Deployed local address is written to:

- `contracts-project/deployments/localhost-31337.json`
- `shared/contracts.json`

`export-abi` copies the ABI to `shared/`, `project/backend/src/abi`, and `project/src/abi`.

## Wire-up

| Layer | Role |
|-------|------|
| Hardhat node `:8545` | Local EVM |
| `mypackage` | ethers SDK used by the backend |
| Backend `:4000` | Lists/acquires via deployer/buyer keys + `/api/chain/*` |
| Frontend `:3000` | MetaMask acquire + relay acquire |

Hardhat account #0 (local only):

- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
