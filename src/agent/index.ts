import chalk from "chalk";
import ora from "ora";
import { WalletManager } from "./wallet.js";
import { ERC8004Client } from "./erc8004.js";
import { X402Client } from "./x402.js";
import { OpenClawGateway } from "./openclaw.js";
import { X402GuardClient } from "./x402guard.js";
import { ClankerLauncher } from "./clanker.js";
import { TwitterClient } from "./twitter.js";
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
    const balances = await wallet.getBalances();
    console.log(chalk.cyan("  Balances:"));
    console.log(chalk.white(`    ETH (Mainnet): ${balances.ethMainnet}`));
    console.log(chalk.white(`    ETH (Base):    ${balances.ethBase}`));
    console.log(chalk.white(`    USDC (Base):   ${balances.usdcBase}`));
  } catch {
    console.log(chalk.yellow("  Could not fetch balances (check RPC URLs)"));
  }

  // 2. ERC-8004 Identity
  spinner.text = "Initializing ERC-8004 identity client...";
  const erc8004 = new ERC8004Client();
  try {
    const totalAgents = await erc8004.getTotalAgents();
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

  // 7. OpenClaw Gateway
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

  // 7. Agent API Server
  spinner.text = "Starting agent API server...";
  const server = new AgentServer(wallet, erc8004, x402);
  const port = parseInt(process.env.AGENT_API_PORT || "8402");
  await server.start(port);

  spinner.succeed(chalk.hex("#ff6b2b").bold("MEGA CLAWD is online!"));

  console.log(chalk.gray(`\n  Agent API: http://localhost:${port}`));
  console.log(chalk.gray(`  Dashboard: http://localhost:${process.env.PORT || 3000}`));
  console.log(chalk.gray(`  x402 Endpoint: http://localhost:${port}/x402\n`));

  console.log(
    chalk.hex("#ff6b2b")(
      "  Ready to build, trade, and interact autonomously onchain.\n"
    )
  );

  // Keep alive
  process.on("SIGINT", () => {
    console.log(chalk.red("\n  MEGA CLAWD shutting down..."));
    openclaw.disconnect();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
