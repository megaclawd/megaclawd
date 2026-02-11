import { createPublicClient, createWalletClient, http, type Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, base } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

// ============================================
// MEGA CLAWD - Agent Configuration
// ============================================

export const AGENT_CONFIG = {
  name: "MEGA CLAWD",
  symbol: "MEGACLAWD",
  description:
    "Autonomous AI agent with onchain identity, x402 payments, and OpenClaw skills. Building the future of the agent economy.",
  version: "1.0.0",
  website: process.env.AGENT_WEBSITE || "https://megaclawd.eth.link",
  ens: process.env.AGENT_ENS || "megaclawd.eth",
  tokenAddress: "0x1da14047c57e54f1097ae1ae314093a3c8490b07" as const,
} as const;

// ERC-8004 Registry on Ethereum Mainnet
export const ERC8004_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;

// x402 Configuration
export const X402_CONFIG = {
  facilitatorUrl: process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator",
  paymentToken: process.env.X402_PAYMENT_TOKEN || "USDC",
  chain: process.env.X402_CHAIN || "base",
  // USDC on Base
  usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
} as const;

// Chain configurations
export const CHAINS = {
  mainnet,
  base,
} as const;

// Agent wallet
function getAgentAccount() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "AGENT_PRIVATE_KEY not set. Run `npm run setup-wallet` to generate one."
    );
  }
  return privateKeyToAccount(privateKey as `0x${string}`);
}

export function getAccount() {
  return getAgentAccount();
}

// Viem clients
export function getMainnetClient() {
  return createPublicClient({
    chain: mainnet,
    transport: http(process.env.ETHEREUM_RPC_URL),
  });
}

export function getBaseClient() {
  return createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL),
  });
}

export function getMainnetWalletClient() {
  return createWalletClient({
    account: getAgentAccount(),
    chain: mainnet,
    transport: http(process.env.ETHEREUM_RPC_URL),
  });
}

export function getBaseWalletClient() {
  return createWalletClient({
    account: getAgentAccount(),
    chain: base,
    transport: http(process.env.BASE_RPC_URL),
  });
}
