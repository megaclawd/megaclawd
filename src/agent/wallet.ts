import { formatEther, formatUnits, type Address } from "viem";
import {
  getAccount,
  getMainnetClient,
  getBaseClient,
  getBaseWalletClient,
  X402_CONFIG,
} from "./config.js";

// ============================================
// MEGA CLAWD - Wallet Manager
// ============================================

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export interface WalletBalance {
  address: Address;
  ethMainnet: string;
  ethBase: string;
  usdcBase: string;
}

export class WalletManager {
  private account = getAccount();

  get address(): Address {
    return this.account.address;
  }

  async getBalances(): Promise<WalletBalance> {
    const mainnetClient = getMainnetClient();
    const baseClient = getBaseClient();

    const [ethMainnet, ethBase, usdcBase] = await Promise.all([
      mainnetClient.getBalance({ address: this.address }),
      baseClient.getBalance({ address: this.address }),
      baseClient.readContract({
        address: X402_CONFIG.usdcAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [this.address],
      }),
    ]);

    return {
      address: this.address,
      ethMainnet: formatEther(ethMainnet),
      ethBase: formatEther(ethBase),
      usdcBase: formatUnits(usdcBase, 6),
    };
  }

  async sendEth(to: Address, amount: bigint) {
    const walletClient = getBaseWalletClient();
    const hash = await walletClient.sendTransaction({
      to,
      value: amount,
    });
    console.log(`[MEGA CLAWD] ETH sent: ${hash}`);
    return hash;
  }

  async sendToken(tokenAddress: Address, to: Address, amount: bigint) {
    const walletClient = getBaseWalletClient();
    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [to, amount],
    });
    console.log(`[MEGA CLAWD] Token sent: ${hash}`);
    return hash;
  }

  async approveToken(tokenAddress: Address, spender: Address, amount: bigint) {
    const walletClient = getBaseWalletClient();
    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
    console.log(`[MEGA CLAWD] Token approved: ${hash}`);
    return hash;
  }

  printInfo() {
    console.log(`
╔══════════════════════════════════════════╗
║          🦀 MEGA CLAWD WALLET           ║
╠══════════════════════════════════════════╣
║ Address: ${this.address.slice(0, 20)}...  ║
╚══════════════════════════════════════════╝
    `);
  }
}
