import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({ chain: mainnet, transport: http("https://eth.llamarpc.com") });

async function main() {
  const hash = "0x1d059e075027f60fc0317e19ac7acb600433deeb3490fe37485ff31efe0bc9f9";
  try {
    const receipt = await client.getTransactionReceipt({ hash: hash as `0x${string}` });
    console.log("Status:", receipt.status);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Block:", receipt.blockNumber.toString());

    if (receipt.status === "success") {
      const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
      const REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
      const transferLog = receipt.logs.find(
        (l) => l.topics[0] === transferTopic && l.address.toLowerCase() === REGISTRY.toLowerCase()
      );
      if (transferLog && transferLog.topics[3]) {
        const agentId = BigInt(transferLog.topics[3]).toString();
        console.log("\nMEGA CLAWD registered!");
        console.log("Agent ID: #" + agentId);
        console.log("Etherscan: https://etherscan.io/nft/" + REGISTRY + "/" + agentId);
        console.log("8004scan: https://8004scan.com/agent/" + agentId);
      }
    }
  } catch (e: any) {
    console.log("TX still pending or not found:", e.message?.slice(0, 100));
  }
}

main();
