import { type Address, encodeFunctionData } from "viem";
import {
  AGENT_CONFIG,
  ERC8004_REGISTRY,
  getMainnetClient,
  getMainnetWalletClient,
  getAccount,
} from "./config.js";

// ============================================
// MEGA CLAWD - ERC-8004 Trustless Agent Identity
// ============================================

const REGISTRY_ABI = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    name: "setAgentURI",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "agentURI", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "setAgentWallet",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "wallet", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "agentURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "totalAgents",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export interface AgentMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string }>;
  services: AgentService[];
  x402Support: boolean;
}

export interface AgentService {
  type: "web" | "ens" | "a2a" | "mcp" | "oasf" | "did" | "email";
  endpoint: string;
}

export class ERC8004Client {
  private agentId: bigint | null = null;

  /**
   * Build the agent metadata JSON for ERC-8004 registration
   */
  buildMetadata(): AgentMetadata {
    const account = getAccount();
    return {
      name: AGENT_CONFIG.name,
      description: AGENT_CONFIG.description,
      image: `${AGENT_CONFIG.website}/agent-avatar.png`,
      external_url: AGENT_CONFIG.website,
      attributes: [
        { trait_type: "version", value: AGENT_CONFIG.version },
        { trait_type: "framework", value: "OpenClaw" },
        { trait_type: "chain", value: "Base" },
        { trait_type: "wallet", value: account.address },
        { trait_type: "token", value: "$MEGACLAWD" },
        { trait_type: "twitter", value: "@megaclawd" },
        { trait_type: "erc8004_id", value: "24011" },
      ],
      services: [
        { type: "web", endpoint: AGENT_CONFIG.website },
        { type: "ens", endpoint: AGENT_CONFIG.ens },
        {
          type: "a2a",
          endpoint: `${AGENT_CONFIG.website}/api/a2a`,
        },
        {
          type: "mcp",
          endpoint: `${AGENT_CONFIG.website}/api/mcp`,
        },
      ],
      x402Support: true,
    };
  }

  /**
   * Register MEGA CLAWD on the ERC-8004 registry (Ethereum mainnet)
   * @param metadataUri IPFS or HTTP URI pointing to agent metadata JSON
   */
  async register(metadataUri: string): Promise<bigint> {
    const walletClient = getMainnetWalletClient();
    const publicClient = getMainnetClient();

    console.log(`[MEGA CLAWD] Registering on ERC-8004 registry...`);
    console.log(`[MEGA CLAWD] Registry: ${ERC8004_REGISTRY}`);
    console.log(`[MEGA CLAWD] Metadata URI: ${metadataUri}`);

    const hash = await walletClient.writeContract({
      address: ERC8004_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "register",
      args: [metadataUri],
    });

    console.log(`[MEGA CLAWD] Registration tx: ${hash}`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[MEGA CLAWD] Registration confirmed in block ${receipt.blockNumber}`);

    // Parse the agentId from the transaction logs
    // The register function returns the agentId
    const totalAgents = await publicClient.readContract({
      address: ERC8004_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "totalAgents",
    });

    this.agentId = totalAgents;
    console.log(`[MEGA CLAWD] Registered as Agent #${this.agentId}`);

    return this.agentId;
  }

  /**
   * Set the agent's operational wallet address
   */
  async setWallet(agentId: bigint, walletAddress: Address): Promise<string> {
    const walletClient = getMainnetWalletClient();

    const hash = await walletClient.writeContract({
      address: ERC8004_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "setAgentWallet",
      args: [agentId, walletAddress],
    });

    console.log(`[MEGA CLAWD] Wallet set tx: ${hash}`);
    return hash;
  }

  /**
   * Update agent metadata URI
   */
  async updateMetadata(agentId: bigint, newUri: string): Promise<string> {
    const walletClient = getMainnetWalletClient();

    const hash = await walletClient.writeContract({
      address: ERC8004_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "setAgentURI",
      args: [agentId, newUri],
    });

    console.log(`[MEGA CLAWD] Metadata updated tx: ${hash}`);
    return hash;
  }

  /**
   * Look up an agent's metadata URI
   */
  async getAgentURI(agentId: bigint): Promise<string> {
    const client = getMainnetClient();
    return client.readContract({
      address: ERC8004_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "agentURI",
      args: [agentId],
    });
  }

  /**
   * Get total registered agents count
   */
  async getTotalAgents(): Promise<bigint> {
    const client = getMainnetClient();
    return client.readContract({
      address: ERC8004_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "totalAgents",
    });
  }
}
