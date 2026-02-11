import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import chalk from "chalk";
import {
  SOLANA_CONFIG,
  getSolanaConnection,
  getSolanaKeypair,
} from "./solana-config.js";

// ============================================
// MEGA CLAWD - Solana Wallet Manager
// ============================================

export interface SolanaWalletBalance {
  address: string;
  solBalance: string;
  usdcBalance: string;
}

export class SolanaWalletManager {
  private keypair = getSolanaKeypair();
  private connection = getSolanaConnection();

  get address(): string {
    return this.keypair.publicKey.toBase58();
  }

  async getBalances(): Promise<SolanaWalletBalance> {
    const [solLamports, usdcBalance] = await Promise.all([
      this.connection.getBalance(this.keypair.publicKey),
      this.getUsdcBalance(),
    ]);

    return {
      address: this.address,
      solBalance: (solLamports / LAMPORTS_PER_SOL).toFixed(4),
      usdcBalance,
    };
  }

  private async getUsdcBalance(): Promise<string> {
    try {
      const ata = await getAssociatedTokenAddress(
        SOLANA_CONFIG.usdcMint,
        this.keypair.publicKey
      );
      const balance = await this.connection.getTokenAccountBalance(ata);
      return balance.value.uiAmountString || "0.00";
    } catch {
      return "0.00";
    }
  }

  async sendSol(to: string, lamports: number): Promise<string> {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: new PublicKey(to),
        lamports,
      })
    );
    const sig = await sendAndConfirmTransaction(this.connection, tx, [
      this.keypair,
    ]);
    console.log(chalk.cyan(`[MEGA CLAWD] SOL sent: ${sig}`));
    return sig;
  }

  async sendSplToken(
    mint: string,
    to: string,
    amount: number,
    decimals: number
  ): Promise<string> {
    const mintPubkey = new PublicKey(mint);
    const toPubkey = new PublicKey(to);

    const fromAta = await getAssociatedTokenAddress(
      mintPubkey,
      this.keypair.publicKey
    );
    const toAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.keypair,
      mintPubkey,
      toPubkey
    );

    const rawAmount = amount * Math.pow(10, decimals);
    const tx = new Transaction().add(
      createTransferInstruction(
        fromAta,
        toAccount.address,
        this.keypair.publicKey,
        rawAmount
      )
    );
    const sig = await sendAndConfirmTransaction(this.connection, tx, [
      this.keypair,
    ]);
    console.log(chalk.cyan(`[MEGA CLAWD] SPL token sent: ${sig}`));
    return sig;
  }

  async swapViaJupiter(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps = 50
  ): Promise<string> {
    // 1. Get quote
    const quoteUrl = `${SOLANA_CONFIG.jupiterApiUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
    const quoteRes = await fetch(quoteUrl);
    const quoteData = await quoteRes.json();

    // 2. Get swap transaction
    const swapRes = await fetch(`${SOLANA_CONFIG.jupiterApiUrl}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: quoteData,
        userPublicKey: this.address,
        wrapAndUnwrapSol: true,
      }),
    });
    const swapData = await swapRes.json();

    // 3. Sign and send
    const { VersionedTransaction } = await import("@solana/web3.js");
    const txBuf = Buffer.from(swapData.swapTransaction, "base64");
    const vtx = VersionedTransaction.deserialize(txBuf);
    vtx.sign([this.keypair]);
    const sig = await this.connection.sendRawTransaction(vtx.serialize());
    console.log(chalk.cyan(`[MEGA CLAWD] Jupiter swap: ${sig}`));
    return sig;
  }

  printInfo() {
    console.log(
      chalk.magenta(
        `  Solana Wallet: ${this.address.slice(0, 8)}...${this.address.slice(-6)}`
      )
    );
  }
}
