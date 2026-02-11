import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

// ============================================
// MEGA CLAWD - Solana Configuration
// ============================================

export const SOLANA_CONFIG = {
  usdcMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  jupiterApiUrl: "https://quote-api.jup.ag/v6",
  explorer: "https://solscan.io",
} as const;

let _connection: Connection | null = null;
let _keypair: Keypair | null = null;

export function getSolanaConnection(): Connection {
  if (!_connection) {
    const rpcUrl =
      process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    _connection = new Connection(rpcUrl, "confirmed");
  }
  return _connection;
}

export function getSolanaKeypair(): Keypair {
  if (!_keypair) {
    const key = process.env.SOLANA_PRIVATE_KEY;
    if (!key) {
      throw new Error(
        "SOLANA_PRIVATE_KEY not set. Run `npm run setup-solana` to generate one."
      );
    }
    _keypair = Keypair.fromSecretKey(bs58.decode(key));
  }
  return _keypair;
}

export function getSolanaPublicKey(): PublicKey {
  return getSolanaKeypair().publicKey;
}
