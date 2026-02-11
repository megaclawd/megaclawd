import dotenv from "dotenv";
dotenv.config();

import { TwitterClient } from "../src/agent/twitter.js";

async function main() {
  const twitter = new TwitterClient();

  if (!twitter.isConfigured) {
    console.error("Twitter not configured");
    process.exit(1);
  }

  const result = await twitter.tweet("MEGA CLAWD is online and ready to build onchain. 🦀");
  console.log("\nTweet posted!");
  console.log("URL:", result.url);
  console.log("ID:", result.id);
}

main().catch((e) => {
  console.error("Error:", e.message);
  if (e.data) console.error(JSON.stringify(e.data, null, 2));
  process.exit(1);
});
