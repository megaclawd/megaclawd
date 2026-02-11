import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const keypair = Keypair.generate();
console.log("=== MEGA CLAWD Solana Wallet Setup ===\n");
console.log(`Public Key:  ${keypair.publicKey.toBase58()}`);
console.log(`Private Key: ${bs58.encode(keypair.secretKey)}`);
console.log(`\nAdd to .env:`);
console.log(`SOLANA_PRIVATE_KEY=${bs58.encode(keypair.secretKey)}`);
console.log(`SOLANA_RPC_URL=https://api.mainnet-beta.solana.com`);
