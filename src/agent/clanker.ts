import {
  type Address,
  type Hash,
  encodeFunctionData,
  parseEther,
} from "viem";
import { getAccount, getBaseWalletClient, getBaseClient } from "./config.js";

// ============================================
// MEGA CLAWD - Clanker Token Launcher
// Launch $MEGACLAWD via Clanker on Base
// https://clanker.world
// ============================================

// Clanker v4.1.0 Factory on Base
const CLANKER_FACTORY = "0xE85A59c628F7d27878ACeB4bf3b35733630083a9" as const;

// Clanker v4.1.0 Dynamic Fee Hook on Base
const CLANKER_HOOK_DYNAMIC = "0xd60D6B218116cFd801E28F78d011a203D2b068Cc" as const;

export interface ClankerDeployConfig {
  name: string;
  symbol: string;
  image?: string; // IPFS or HTTP URL for token logo
  description?: string;
  tokenAdmin: Address;
  rewards: ClankerReward[];
  feeType: "dynamic" | "static";
  vault?: ClankerVault;
  devBuyEth?: number; // ETH amount for initial dev buy
}

export interface ClankerReward {
  recipient: Address;
  admin: Address;
  bps: number; // Basis points (must sum to 10000)
  token: "Both" | "Paired" | "Clanker";
}

export interface ClankerVault {
  percentage: number; // 10-90% of supply
  lockupDuration: number; // Minimum 7 days in seconds
  vestingDuration: number; // Linear vesting period in seconds
  recipient: Address;
}

export interface ClankerDeployResult {
  txHash: Hash;
  tokenAddress?: Address;
  poolAddress?: string;
}

export class ClankerLauncher {
  private account = getAccount();

  /**
   * Build the default deployment config for $MEGACLAWD
   */
  buildMegaClawdConfig(): ClankerDeployConfig {
    return {
      name: "MEGA CLAWD",
      symbol: "MEGACLAWD",
      description:
        "MEGA CLAWD - Autonomous AI Agent token. ERC-8004 identity, x402 payments, OpenClaw skills.",
      tokenAdmin: this.account.address,
      feeType: "dynamic",
      rewards: [
        {
          recipient: this.account.address, // Agent wallet receives LP fees
          admin: this.account.address,
          bps: 10_000, // 100% of creator rewards
          token: "Both",
        },
      ],
      vault: {
        percentage: 20, // 20% locked in vault
        lockupDuration: 604800, // 7 days lock
        vestingDuration: 2592000, // 30 days linear vesting
        recipient: this.account.address,
      },
      devBuyEth: 0.01, // Small initial buy
    };
  }

  /**
   * Deploy $MEGACLAWD token via Clanker SDK
   * This is the recommended programmatic approach
   */
  async deployWithSDK(config?: ClankerDeployConfig): Promise<ClankerDeployResult> {
    const deployConfig = config || this.buildMegaClawdConfig();

    console.log(`[MEGA CLAWD Clanker] Deploying token via Clanker SDK...`);
    console.log(`[MEGA CLAWD Clanker] Name: ${deployConfig.name}`);
    console.log(`[MEGA CLAWD Clanker] Symbol: $${deployConfig.symbol}`);
    console.log(`[MEGA CLAWD Clanker] Fee Type: ${deployConfig.feeType}`);
    console.log(`[MEGA CLAWD Clanker] Admin: ${deployConfig.tokenAdmin}`);

    // Dynamic import of clanker-sdk (must be installed: npm install clanker-sdk)
    try {
      const { Clanker } = await import("clanker-sdk/v4");

      const publicClient = getBaseClient();
      const walletClient = getBaseWalletClient();

      const clanker = new Clanker({
        publicClient,
        wallet: walletClient,
      });

      const { txHash, waitForTransaction, error } = await clanker.deploy({
        name: deployConfig.name,
        symbol: deployConfig.symbol,
        tokenAdmin: deployConfig.tokenAdmin,
        image: deployConfig.image,
        metadata: {
          description: deployConfig.description,
          websites: ["https://megaclawd.eth.link"],
        },
        fees: { type: deployConfig.feeType },
        rewards: {
          recipients: deployConfig.rewards.map((r) => ({
            recipient: r.recipient,
            admin: r.admin,
            bps: r.bps,
            token: r.token,
          })),
        },
        ...(deployConfig.vault && {
          vault: {
            percentage: deployConfig.vault.percentage,
            lockupDuration: deployConfig.vault.lockupDuration,
            vestingDuration: deployConfig.vault.vestingDuration,
            recipient: deployConfig.vault.recipient,
          },
        }),
        ...(deployConfig.devBuyEth && {
          devBuy: { ethAmount: deployConfig.devBuyEth },
        }),
        vanity: true,
      });

      if (error) {
        throw new Error(`Clanker deploy error: ${error}`);
      }

      console.log(`[MEGA CLAWD Clanker] Deploy tx: ${txHash}`);

      const result = await waitForTransaction();
      console.log(`[MEGA CLAWD Clanker] Token deployed at: ${result.address}`);
      console.log(`[MEGA CLAWD Clanker] View: https://clanker.world/clanker/${result.address}`);

      return {
        txHash,
        tokenAddress: result.address as Address,
      };
    } catch (error: any) {
      if (error.message?.includes("Cannot find module")) {
        console.log(`[MEGA CLAWD Clanker] clanker-sdk not installed.`);
        console.log(`[MEGA CLAWD Clanker] Install with: npm install clanker-sdk`);
        console.log(`[MEGA CLAWD Clanker] Or use the API method instead.`);
        throw new Error(
          "clanker-sdk not installed. Run: npm install clanker-sdk"
        );
      }
      throw error;
    }
  }

  /**
   * Deploy via Clanker REST API (requires API key)
   */
  async deployWithAPI(
    apiKey: string,
    config?: ClankerDeployConfig
  ): Promise<ClankerDeployResult> {
    const deployConfig = config || this.buildMegaClawdConfig();

    console.log(`[MEGA CLAWD Clanker] Deploying token via Clanker API...`);

    const requestKey = `megaclawd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const response = await fetch(
      "https://www.clanker.world/api/tokens/deploy/v4",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          name: deployConfig.name,
          symbol: deployConfig.symbol,
          image: deployConfig.image,
          tokenAdmin: deployConfig.tokenAdmin,
          description: deployConfig.description,
          requestKey,
          rewards: deployConfig.rewards.map((r) => ({
            admin: r.admin,
            recipient: r.recipient,
            bps: r.bps,
            token: r.token,
          })),
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Clanker API error: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    console.log(`[MEGA CLAWD Clanker] API response:`, result);

    return {
      txHash: result.txHash || ("0x" as Hash),
      tokenAddress: result.expectedAddress as Address,
    };
  }

  /**
   * Print deployment instructions for manual launch
   */
  printLaunchInstructions() {
    const config = this.buildMegaClawdConfig();
    console.log(`
╔══════════════════════════════════════════════════╗
║     MEGA CLAWD - Token Launch via Clanker        ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Option 1: Farcaster (Simplest)                  ║
║  Post on Warpcast:                               ║
║  "@clanker deploy a token called MEGA CLAWD      ║
║   with ticker MEGACLAWD"                         ║
║                                                  ║
║  Option 2: clanker.world                         ║
║  Go to https://clanker.world                     ║
║  Name: MEGA CLAWD                                ║
║  Symbol: MEGACLAWD                               ║
║  Connect wallet: ${config.tokenAdmin.slice(0, 20)}... ║
║                                                  ║
║  Option 3: SDK (npm install clanker-sdk)         ║
║  Run: npm run launch-token                       ║
║                                                  ║
║  Token gets 100B supply + Uniswap V4 pool        ║
║  Immediately tradeable on Base                   ║
║  LP fees flow to agent wallet                    ║
╚══════════════════════════════════════════════════╝
    `);
  }
}
