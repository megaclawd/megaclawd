import dotenv from "dotenv";
dotenv.config();

import { TwitterClient } from "../src/agent/twitter.js";
import { TwitterApi } from "twitter-api-v2";

async function main() {
  console.log("\n  MEGA CLAWD - Twitter Connection Test\n");

  // Check env vars
  const keys = ["TWITTER_API_KEY", "TWITTER_API_SECRET", "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_SECRET"];
  for (const key of keys) {
    const val = process.env[key];
    console.log(`  ${key}: ${val ? "SET (" + val.slice(0, 6) + "...)" : "MISSING"}`);
  }

  const twitter = new TwitterClient();
  console.log(`\n  isConfigured: ${twitter.isConfigured}`);

  if (!twitter.isConfigured) {
    console.log("\n  Twitter client is NOT configured. Check .env values above.\n");
    process.exit(1);
  }

  // Test authentication by fetching account info
  console.log("\n  Testing API authentication...");
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });

  const me = await client.v2.me();
  console.log(`\n  SUCCESS! Authenticated as:`);
  console.log(`    Name:     ${me.data.name}`);
  console.log(`    Username: @${me.data.username}`);
  console.log(`    ID:       ${me.data.id}`);
  console.log("\n  Twitter integration is working!\n");
}

main().catch((e) => {
  console.error("\n  FAILED:", e.message);
  if (e.data) console.error("  Details:", JSON.stringify(e.data, null, 2));
  process.exit(1);
});
