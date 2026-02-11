import chalk from "chalk";
import ora from "ora";
import { WalletManager } from "./wallet.js";
import { ERC8004Client } from "./erc8004.js";
import { X402Client } from "./x402.js";
import { OpenClawGateway } from "./openclaw.js";
import { X402GuardClient } from "./x402guard.js";
import { ClankerLauncher } from "./clanker.js";
import { TwitterClient } from "./twitter.js";
import { ChatHandler } from "./chat.js";
import { TelegramBot } from "./telegram.js";
import { SolanaWalletManager } from "./solana-wallet.js";
import type { SolanaWalletBalance } from "./solana-wallet.js";
import { AgentServer } from "./server.js";
import { AGENT_CONFIG } from "./config.js";

// ============================================
//
//   ███╗   ███╗███████╗ ██████╗  █████╗
//   ████╗ ████║██╔════╝██╔════╝ ██╔══██╗
//   ██╔████╔██║█████╗  ██║  ███╗███████║
//   ██║╚██╔╝██║██╔══╝  ██║   ██║██╔══██║
//   ██║ ╚═╝ ██║███████╗╚██████╔╝██║  ██║
//   ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝
//
//    ██████╗██╗      █████╗ ██╗    ██╗██████╗
//   ██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗
//   ██║     ██║     ███████║██║ █╗ ██║██║  ██║
//   ██║     ██║     ██╔══██║██║███╗██║██║  ██║
//   ╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝
//    ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝
//
//   Autonomous AI Agent | ERC-8004 | x402 | OpenClaw
//
// ============================================

async function main() {
  console.log(chalk.hex("#ff6b2b").bold(`
   ███╗   ███╗███████╗ ██████╗  █████╗
   ████╗ ████║██╔════╝██╔════╝ ██╔══██╗
   ██╔████╔██║█████╗  ██║  ███╗███████║
   ██║╚██╔╝██║██╔══╝  ██║   ██║██╔══██║
   ██║ ╚═╝ ██║███████╗╚██████╔╝██║  ██║
   ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝

    ██████╗██╗      █████╗ ██╗    ██╗██████╗
   ██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗
   ██║     ██║     ███████║██║ █╗ ██║██║  ██║
   ██║     ██║     ██╔══██║██║███╗██║██║  ██║
   ╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝
    ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝
  `));
  console.log(chalk.gray(`  v${AGENT_CONFIG.version} | ${AGENT_CONFIG.description}\n`));

  // ---- Initialize Components ----

  const spinner = ora("Initializing MEGA CLAWD...").start();

  // 1. Wallet
  spinner.text = "Loading agent wallet...";
  const wallet = new WalletManager();
  wallet.printInfo();

  try {
    const balanceTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 10000)
    );
    const balances = await Promise.race([wallet.getBalances(), balanceTimeout]) as Awaited<ReturnType<typeof wallet.getBalances>>;
    console.log(chalk.cyan("  Balances:"));
    console.log(chalk.white(`    ETH (Mainnet): ${balances.ethMainnet}`));
    console.log(chalk.white(`    ETH (Base):    ${balances.ethBase}`));
    console.log(chalk.white(`    USDC (Base):   ${balances.usdcBase}`));
  } catch {
    console.log(chalk.yellow("  Could not fetch balances (check RPC URLs)"));
  }

  // 1b. Solana Wallet
  spinner.text = "Loading Solana wallet...";
  let solanaWallet: SolanaWalletManager | null = null;
  if (process.env.SOLANA_PRIVATE_KEY) {
    solanaWallet = new SolanaWalletManager();
    solanaWallet.printInfo();
    try {
      const solBalances = await Promise.race([
        solanaWallet.getBalances(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 10000)),
      ]) as SolanaWalletBalance;
      console.log(chalk.cyan("  Solana Balances:"));
      console.log(chalk.white(`    SOL:          ${solBalances.solBalance}`));
      console.log(chalk.white(`    USDC (SPL):   ${solBalances.usdcBalance}`));
    } catch {
      console.log(chalk.yellow("  Could not fetch Solana balances (check RPC URL)"));
    }
  } else {
    console.log(chalk.yellow("  Solana: Not configured (set SOLANA_PRIVATE_KEY in .env)"));
  }

  // 2. ERC-8004 Identity
  spinner.text = "Initializing ERC-8004 identity client...";
  const erc8004 = new ERC8004Client();
  try {
    const regTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 10000)
    );
    const totalAgents = await Promise.race([erc8004.getTotalAgents(), regTimeout]) as bigint;
    console.log(
      chalk.green(`\n  ERC-8004 Registry: ${totalAgents.toString()} agents registered`)
    );
  } catch {
    console.log(chalk.yellow("\n  ERC-8004: Could not query registry (check Ethereum RPC)"));
  }

  // 3. x402 Payment Client
  spinner.text = "Initializing x402 payment client...";
  const x402 = new X402Client();
  console.log(chalk.green("  x402 Payment Client: Ready"));

  // 4. x402guard Skill Security
  spinner.text = "Initializing x402guard security auditor...";
  const x402guard = new X402GuardClient(x402);
  console.log(chalk.green("  x402guard Security Auditor: Ready (https://x402guard.xyz)"));

  // 5. Clanker Token Launcher
  spinner.text = "Initializing Clanker launcher...";
  const clanker = new ClankerLauncher();
  console.log(chalk.green("  Clanker Token Launcher: Ready ($MEGACLAWD via Clanker v4)"));

  // 6. Twitter/X
  spinner.text = "Initializing Twitter client...";
  const twitter = new TwitterClient();
  if (twitter.isConfigured) {
    console.log(chalk.green("  Twitter/X: Connected (@megaclawd)"));
  } else {
    console.log(chalk.yellow("  Twitter/X: Not configured (set TWITTER_API_KEY in .env)"));
  }

  // 7. Chat Handler
  spinner.text = "Initializing chat handler...";
  const chatHandler = new ChatHandler();

  // 8. Telegram Bot
  spinner.text = "Initializing Telegram bot...";
  const telegram = new TelegramBot(chatHandler);
  if (telegram.isConfigured) {
    await telegram.start();
    console.log(chalk.green("  Telegram Bot: Connected"));
  } else {
    console.log(chalk.yellow("  Telegram: Not configured (set TELEGRAM_BOT_TOKEN in .env)"));
  }

  // 9. OpenClaw Gateway
  spinner.text = "Connecting to OpenClaw gateway...";
  const openclaw = new OpenClawGateway();
  const openclawConnected = await openclaw.connect().catch(() => false);
  if (openclawConnected) {
    console.log(chalk.green("  OpenClaw Gateway: Connected"));
  } else {
    console.log(
      chalk.yellow("  OpenClaw Gateway: Not available (agent runs standalone)")
    );
  }

  // 10. Agent API Server
  spinner.text = "Starting agent API server...";
  const server = new AgentServer(wallet, erc8004, x402, chatHandler, solanaWallet);
  const port = parseInt(process.env.AGENT_API_PORT || "8402");
  await server.start(port);

  spinner.succeed(chalk.hex("#ff6b2b").bold("MEGA CLAWD is online!"));

  console.log(chalk.gray(`\n  Agent API: http://localhost:${port}`));
  console.log(chalk.gray(`  Dashboard: http://localhost:${process.env.PORT || 3000}`));
  console.log(chalk.gray(`  Dashboard Chat: ws://localhost:${port}/chat`));
  console.log(chalk.gray(`  Telegram: ${telegram.isConfigured ? "Active" : "Not configured"}`));
  console.log(chalk.gray(`  Solana: ${solanaWallet ? "Active" : "Not configured"}`));
  console.log(chalk.gray(`  x402 Endpoint: http://localhost:${port}/x402\n`));

  console.log(
    chalk.hex("#ff6b2b")(
      "  Ready to build, trade, and interact autonomously onchain.\n"
    )
  );

  // Keep alive
  process.on("SIGINT", () => {
    console.log(chalk.red("\n  MEGA CLAWD shutting down..."));
    telegram.stop();
    openclaw.disconnect();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
