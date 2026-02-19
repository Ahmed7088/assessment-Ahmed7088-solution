"use client";

import { BrowserProvider, Contract, formatEther } from "ethers";
import marketplaceAbi from "@/abi/NuvyraHubMarketplace.json";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
const MARKETPLACE =
  process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export function getMarketplaceAddress() {
  return MARKETPLACE;
}

export async function connectBrowserWallet() {
  if (!window.ethereum) {
    throw new Error("No wallet found. Install MetaMask or use relay acquire.");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

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
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, address, chainId: Number(network.chainId) };
}

export async function getMarketplaceContract(signerOrProvider) {
  const provider = signerOrProvider || new BrowserProvider(window.ethereum);
  const runner = "getSigner" in provider ? await provider.getSigner() : provider;
  return new Contract(MARKETPLACE, marketplaceAbi.abi, runner);
}

export async function acquireLicenseWithWallet(slug) {
  const { signer, address } = await connectBrowserWallet();
  const market = new Contract(MARKETPLACE, marketplaceAbi.abi, signer);
  const tokenId = await market.getTokenIdBySlug(slug);
  if (tokenId === BigInt(0)) {
    throw new Error("Model is not listed on-chain yet");
  }
  const listing = await market.getListing(tokenId);
  const tx = await market.acquireLicense(tokenId, { value: listing.priceWei });
  const receipt = await tx.wait();
  return {
    txHash: receipt?.hash || tx.hash,
    buyer: address,
    tokenId: Number(tokenId),
    priceEth: formatEther(listing.priceWei),
  };
}

export async function listModelWithWallet(input) {
  const { signer, address } = await connectBrowserWallet();
  const market = new Contract(MARKETPLACE, marketplaceAbi.abi, signer);
  const existing = await market.getTokenIdBySlug(input.slug);
  if (existing !== BigInt(0)) {
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
