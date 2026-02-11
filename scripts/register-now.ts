import { createPublicClient, createWalletClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import dotenv from "dotenv";
dotenv.config();

const REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;
const ABI = [
  {
    inputs: [{ name: "agentURI", type: "string" }],
    name: "register",
    outputs: [{ name: "agentId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

async function main() {
  const pk = process.env.AGENT_PRIVATE_KEY;
  if (!pk) { console.log("ERROR: AGENT_PRIVATE_KEY not set in .env"); process.exit(1); }

  const account = privateKeyToAccount(pk as `0x${string}`);
  const rpc = process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com";

  console.log("MEGA CLAWD - ERC-8004 Registration");
  console.log("Address:", account.address);
  console.log("RPC:", rpc);

  const publicClient = createPublicClient({ chain: mainnet, transport: http(rpc) });
  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Balance:", formatEther(balance), "ETH");

  if (balance === 0n) {
    console.log("ERROR: No ETH. Send ETH to", account.address);
    process.exit(1);
  }

  // Build metadata
  const registration = {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: "MEGA CLAWD",
    description: "Autonomous AI agent with ERC-8004 identity, x402 payments, x402guard security, Clanker token ($MEGACLAWD), and OpenClaw skills. Building the agent economy on Base.",
    image: "",
    active: true,
    x402Support: true,
    services: [
      { name: "web", endpoint: "https://github.com/megaclawd/megaclawd" },
      { name: "ENS", endpoint: "megaclawd.eth" },
    ],
  };

  const base64 = Buffer.from(JSON.stringify(registration)).toString("base64");
  const agentURI = `data:application/json;base64,${base64}`;

  console.log("\nMetadata:", registration.name);
  console.log("x402 Support:", registration.x402Support);
  console.log("Services:", registration.services.map(s => s.name).join(", "));

  const walletClient = createWalletClient({ account, chain: mainnet, transport: http(rpc) });

  console.log("\nSending registration transaction...");

  const hash = await walletClient.writeContract({
    address: REGISTRY,
    abi: ABI,
    functionName: "register",
    args: [agentURI],
  });

  console.log("TX:", `https://etherscan.io/tx/${hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === "success") {
    const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const transferLog = receipt.logs.find(
      (l) => l.topics[0] === transferTopic && l.address.toLowerCase() === REGISTRY.toLowerCase()
    );
    let agentId = "unknown";
    if (transferLog && transferLog.topics[3]) {
      agentId = BigInt(transferLog.topics[3]).toString();
    }

    console.log("\nSUCCESS! MEGA CLAWD registered on ERC-8004!");
    console.log("Agent ID:", `#${agentId}`);
    console.log("Registry:", REGISTRY);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("View:", `https://etherscan.io/nft/${REGISTRY}/${agentId}`);
    console.log("8004scan:", `https://8004scan.com/agent/${agentId}`);
  } else {
    console.log("Transaction reverted!");
  }
}

main().catch((e) => {
  console.error("Error:", e.message || e);
  process.exit(1);
});
