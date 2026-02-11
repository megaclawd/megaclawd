import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";

// ============================================
// MEGA CLAWD - Wallet Setup Script
// Generates a new agent wallet and saves the private key
// ============================================

async function main() {
  console.log("\n  MEGA CLAWD - Wallet Setup\n");

  const envPath = resolve(process.cwd(), ".env");
  const envExamplePath = resolve(process.cwd(), ".env.example");

  // Check if wallet already exists
  if (existsSync(envPath)) {
    const existingEnv = readFileSync(envPath, "utf-8");
    if (
      existingEnv.includes("AGENT_PRIVATE_KEY=0x") &&
      !existingEnv.includes("AGENT_PRIVATE_KEY=0x_your_private_key_here")
    ) {
      console.log("  Wallet already configured in .env");
      const match = existingEnv.match(/AGENT_PRIVATE_KEY=(0x[a-fA-F0-9]+)/);
      if (match) {
        const account = privateKeyToAccount(match[1] as `0x${string}`);
        console.log(`  Address: ${account.address}\n`);
      }
      return;
    }
  }

  // Generate new wallet
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  console.log(`  New wallet generated!`);
  console.log(`  Address: ${account.address}`);
  console.log(`  Private Key: ${privateKey.slice(0, 10)}...${privateKey.slice(-4)}`);
  console.log("");

  // Create or update .env file
  let envContent: string;
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, "utf-8");
    envContent = envContent.replace(
      /AGENT_PRIVATE_KEY=.*/,
      `AGENT_PRIVATE_KEY=${privateKey}`
    );
  } else if (existsSync(envExamplePath)) {
    envContent = readFileSync(envExamplePath, "utf-8");
    envContent = envContent.replace(
      /AGENT_PRIVATE_KEY=.*/,
      `AGENT_PRIVATE_KEY=${privateKey}`
    );
  } else {
    envContent = `AGENT_PRIVATE_KEY=${privateKey}\n`;
  }

  writeFileSync(envPath, envContent);
  console.log("  Private key saved to .env");
  console.log("");
  console.log("  IMPORTANT: Fund this wallet before running the agent:");
  console.log(`    - Send ETH to ${account.address} on Ethereum mainnet (for ERC-8004 registration)`);
  console.log(`    - Send ETH + USDC to ${account.address} on Base (for x402 payments)`);
  console.log("");
}

main().catch(console.error);
