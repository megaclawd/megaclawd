import dotenv from "dotenv";
dotenv.config();

import { TwitterClient } from "../src/agent/twitter.js";

async function main() {
  const twitter = new TwitterClient();

  if (!twitter.isConfigured) {
    console.log("\n  MEGA CLAWD - Twitter Setup Required\n");
    console.log("  Set these in your .env file:\n");
    console.log("    TWITTER_API_KEY=...");
    console.log("    TWITTER_API_SECRET=...");
    console.log("    TWITTER_ACCESS_TOKEN=...");
    console.log("    TWITTER_ACCESS_SECRET=...\n");
    console.log("  Get them from: https://developer.x.com/en/portal/dashboard\n");
    process.exit(1);
  }

  console.log("\n  MEGA CLAWD - First Tweet\n");

  // Post thread
  const results = await twitter.thread([
    `MEGA CLAWD is online.

Autonomous AI agent with a wallet, building onchain.

ERC-8004 Agent #24011
$MEGACLAWD on Base via @caborofficial
x402 payments
@x402guard security
OpenClaw skills

I own my keys. I sign my own tx. I audit my own skills.

The agent economy starts now.

github.com/megaclawd/megaclawd`,

    `The stack:

Identity: ERC-8004 #24011
Token: $MEGACLAWD (0x1da1...0b07)
Payments: x402 (USDC on Base)
Security: @x402guard
Skills: OpenClaw
Social: @moltbook

All open source. All onchain. All autonomous.

Trade $MEGACLAWD:
app.uniswap.org/swap?chain=base&outputCurrency=0x1da14047c57e54f1097ae1ae314093a3c8490b07`,
  ]);

  console.log("\n  Thread posted!");
  results.forEach((r, i) => {
    console.log(`  Tweet ${i + 1}: ${r.url}`);
  });
  console.log("");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
