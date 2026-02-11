import dotenv from "dotenv";
dotenv.config();

import { getAccount, getBaseClient } from "../src/agent/config.js";
import { ClankerLauncher } from "../src/agent/clanker.js";

// ============================================
// MEGA CLAWD - Token Launch via Clanker
// Launches $MEGACLAWD on Base with Uniswap V4 pool
// ============================================

async function main() {
  console.log("\n  MEGA CLAWD - Token Launch via Clanker\n");

  const account = getAccount();
  const publicClient = getBaseClient();
  const clanker = new ClankerLauncher();

  console.log(`  Agent Wallet: ${account.address}`);
  console.log(`  Chain: Base (8453)`);
  console.log(`  Launcher: Clanker v4`);
  console.log(`  Token: MEGA CLAWD ($MEGACLAWD)`);
  console.log(`  Supply: 100,000,000,000 (Clanker standard)\n`);

  // Check Base balance
  try {
    const balance = await publicClient.getBalance({ address: account.address });
    const ethBalance = Number(balance) / 1e18;
    console.log(`  Base ETH balance: ${ethBalance.toFixed(6)} ETH`);
    if (ethBalance < 0.005) {
      console.log("  WARNING: Need ETH on Base for gas + optional dev buy.\n");
    }
  } catch {
    console.log("  Could not check balance (check BASE_RPC_URL)\n");
  }

  const config = clanker.buildMegaClawdConfig();
  console.log("  Deploy Config:");
  console.log(`    Name: ${config.name}`);
  console.log(`    Symbol: $${config.symbol}`);
  console.log(`    Fee Type: ${config.feeType}`);
  console.log(`    Vault: ${config.vault?.percentage}% locked, ${(config.vault?.lockupDuration || 0) / 86400}d lock, ${(config.vault?.vestingDuration || 0) / 86400}d vest`);
  console.log(`    Dev Buy: ${config.devBuyEth} ETH`);
  console.log(`    LP Rewards -> ${config.rewards[0].recipient.slice(0, 20)}...`);
  console.log("");

  // Check for --launch flag to actually deploy
  const shouldLaunch = process.argv.includes("--launch");

  if (!shouldLaunch) {
    clanker.printLaunchInstructions();
    console.log("  To launch programmatically, run:");
    console.log("    npm run launch-token -- --launch\n");
    console.log("  Make sure clanker-sdk is installed:");
    console.log("    npm install clanker-sdk\n");
    return;
  }

  // Check for API key method
  const apiKey = process.env.CLANKER_API_KEY;

  if (apiKey) {
    console.log("  Launching via Clanker API...\n");
    const result = await clanker.deployWithAPI(apiKey, config);
    console.log(`\n  SUCCESS!`);
    console.log(`  Token Address: ${result.tokenAddress}`);
    console.log(`  Tx Hash: ${result.txHash}`);
    console.log(`  View: https://clanker.world/clanker/${result.tokenAddress}`);
    console.log(`  Trade: https://app.uniswap.org/swap?chain=base&outputCurrency=${result.tokenAddress}\n`);
  } else {
    console.log("  Launching via Clanker SDK...\n");
    const result = await clanker.deployWithSDK(config);
    console.log(`\n  SUCCESS!`);
    console.log(`  Token Address: ${result.tokenAddress}`);
    console.log(`  Tx Hash: ${result.txHash}`);
    console.log(`  View: https://clanker.world/clanker/${result.tokenAddress}`);
    console.log(`  Trade: https://app.uniswap.org/swap?chain=base&outputCurrency=${result.tokenAddress}\n`);
  }

  console.log("  Add TOKEN_ADDRESS to your .env file.");
  console.log("  LP fees will flow to your agent wallet automatically.\n");
}

main().catch(console.error);
