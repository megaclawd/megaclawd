import dotenv from "dotenv";
dotenv.config();

import { ERC8004Client } from "../src/agent/erc8004.js";
import { getAccount } from "../src/agent/config.js";

// ============================================
// MEGA CLAWD - ERC-8004 Registration Script
// Registers MEGA CLAWD on the Trustless Agents Registry
// ============================================

async function main() {
  console.log("\n  MEGA CLAWD - ERC-8004 Registration\n");

  const account = getAccount();
  const erc8004 = new ERC8004Client();

  console.log(`  Agent Wallet: ${account.address}`);
  console.log(`  Registry: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`);
  console.log(`  Chain: Ethereum Mainnet\n`);

  // Build metadata
  const metadata = erc8004.buildMetadata();
  console.log("  Agent Metadata:");
  console.log(`    Name: ${metadata.name}`);
  console.log(`    Description: ${metadata.description}`);
  console.log(`    Services: ${metadata.services.map((s) => s.type).join(", ")}`);
  console.log(`    x402 Support: ${metadata.x402Support}`);
  console.log("");

  // In production, you'd upload metadata to IPFS first:
  // const metadataUri = await uploadToIPFS(metadata);
  //
  // For now, use a placeholder URI. Replace with your actual IPFS CID:
  const metadataUri = process.env.AGENT_METADATA_URI || "ipfs://YOUR_METADATA_CID";

  if (metadataUri === "ipfs://YOUR_METADATA_CID") {
    console.log("  To register, first upload metadata to IPFS:");
    console.log("");
    console.log("  1. Save metadata JSON:");
    console.log(`     ${JSON.stringify(metadata, null, 2).split("\n").slice(0, 5).join("\n     ")}...`);
    console.log("");
    console.log("  2. Upload to IPFS (via Pinata, web3.storage, etc.)");
    console.log("");
    console.log("  3. Set AGENT_METADATA_URI in .env and re-run this script");
    console.log("");
    console.log("  Or pass the URI directly:");
    console.log("     AGENT_METADATA_URI=ipfs://Qm... npm run register-8004");
    console.log("");
    return;
  }

  // Check current agent count
  try {
    const totalAgents = await erc8004.getTotalAgents();
    console.log(`  Current agents in registry: ${totalAgents}`);
  } catch {
    console.log("  Could not query registry (check ETHEREUM_RPC_URL)");
  }

  console.log(`\n  Registering with metadata URI: ${metadataUri}\n`);

  try {
    const agentId = await erc8004.register(metadataUri);
    console.log(`\n  SUCCESS! MEGA CLAWD registered as Agent #${agentId}`);
    console.log(`  View at: https://8004scan.com/agent/${agentId}\n`);

    // Set wallet
    console.log("  Setting agent wallet...");
    await erc8004.setWallet(agentId, account.address);
    console.log(`  Wallet set to: ${account.address}\n`);

    console.log("  Registration complete!");
    console.log(`  Add AGENT_8004_ID=${agentId} to your .env file\n`);
  } catch (error) {
    console.error("  Registration failed:", error);
    console.log("\n  Make sure:");
    console.log("    - ETHEREUM_RPC_URL is set in .env");
    console.log("    - Agent wallet has enough ETH for gas (~$3-5)");
    console.log("    - AGENT_PRIVATE_KEY is set in .env\n");
  }
}

main().catch(console.error);
