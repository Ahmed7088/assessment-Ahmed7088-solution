"use client";

import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  formatEther,
} from "ethers";
import marketplaceAbi from "@/abi/NuvyraHubMarketplace.json";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
const MARKETPLACE =
  process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export function getMarketplaceAddress() {
  return MARKETPLACE;
}

export function getExpectedChainId() {
  return CHAIN_ID;
}

export function getExpectedChainName() {
  return CHAIN_ID === 31337 ? "Hardhat Local" : `chain ${CHAIN_ID}`;
}

export function formatWalletError(error, fallback = "Wallet request failed") {
  const code = error?.code;
  const message = String(error?.shortMessage || error?.message || "").toLowerCase();

  if (code === 4001 || code === "ACTION_REJECTED" || message.includes("user rejected")) {
    return "The wallet request was cancelled.";
  }
  if (code === "INSUFFICIENT_FUNDS" || message.includes("insufficient funds")) {
    return "This wallet does not have enough ETH to pay for the license and gas.";
  }
  if (code === "CALL_EXCEPTION") {
    return "The contract rejected the purchase. Check the listing and wallet network.";
  }
  if (message.includes("network") || message.includes("chain")) {
    return "The wallet is on the wrong network.";
  }
  return error instanceof Error ? error.message : fallback;
}

export async function connectBrowserWallet({ autoSwitch = true } = {}) {
  if (!window.ethereum) {
    throw new Error("No wallet found. Install MetaMask to continue.");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  if (autoSwitch) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      });
    } catch (err) {
      const code = err?.code;
      if (code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${CHAIN_ID.toString(16)}`,
              chainName: "Hardhat Local",
              rpcUrls: [RPC_URL],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, address, chainId: Number(network.chainId) };
}

export async function getMarketplaceContract(signerOrProvider) {
  const runner =
    signerOrProvider ||
    (window.ethereum ? new BrowserProvider(window.ethereum) : new JsonRpcProvider(RPC_URL));
  return new Contract(MARKETPLACE, marketplaceAbi.abi, runner);
}

export async function readListingForSlug(slug, provider = new JsonRpcProvider(RPC_URL)) {
  const market = new Contract(MARKETPLACE, marketplaceAbi.abi, provider);
  const tokenId = await market.getTokenIdBySlug(slug);

  if (tokenId === 0n) {
    throw new Error("Model is not listed on-chain yet.");
  }

  const listing = await market.getListing(tokenId);
  return {
    tokenId: Number(tokenId),
    tokenIdRaw: tokenId,
    priceWei: listing.priceWei,
    priceEth: formatEther(listing.priceWei),
    active: listing.active,
    totalLicensesSold: Number(listing.totalLicensesSold),
  };
}

export async function submitLicensePurchase(slug, signer) {
  const listing = await readListingForSlug(slug, signer.provider);
  const market = new Contract(MARKETPLACE, marketplaceAbi.abi, signer);
  const tx = await market.acquireLicense(listing.tokenIdRaw, {
    value: listing.priceWei,
  });

  return { tx, ...listing };
}

export async function getLicenseBalance(address, tokenId, provider) {
  const market = new Contract(
    MARKETPLACE,
    marketplaceAbi.abi,
    provider || new JsonRpcProvider(RPC_URL),
  );
  return market.balanceOf(address, tokenId);
}

export async function acquireLicenseWithWallet(slug) {
  const { signer, address } = await connectBrowserWallet();
  const { tx, ...listing } = await submitLicensePurchase(slug, signer);
  const receipt = await tx.wait();
  return {
    txHash: receipt?.hash || tx.hash,
    buyer: address,
    ...listing,
  };
}

export async function listModelWithWallet(input) {
  const { signer, address } = await connectBrowserWallet();
  const market = new Contract(MARKETPLACE, marketplaceAbi.abi, signer);
  const existing = await market.getTokenIdBySlug(input.slug);
  if (existing !== 0n) {
    return {
      txHash: null,
      creator: address,
      tokenId: Number(existing),
      alreadyListed: true,
    };
  }
  const { parseEther } = await import("ethers");
  const tx = await market.listModel(
    input.slug,
    input.metadataURI,
    parseEther(String(input.priceEth)),
    input.royaltyBps ?? 500,
  );
  const receipt = await tx.wait();
  const tokenId = await market.getTokenIdBySlug(input.slug);
  return {
    txHash: receipt?.hash || tx.hash,
    creator: address,
    tokenId: Number(tokenId),
    alreadyListed: false,
  };
}
