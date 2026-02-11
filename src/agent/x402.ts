import { type Address, parseUnits, keccak256, toBytes, encodePacked } from "viem";
import { getAccount, getBaseWalletClient, getBaseClient, X402_CONFIG } from "./config.js";
import {
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

// ============================================
// MEGA CLAWD - x402 HTTP Payment Protocol Client
// ============================================

export interface X402PaymentRequirement {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType?: string;
  payTo: Address;
  maxTimeoutSeconds: number;
  asset: Address;
  extra?: Record<string, unknown>;
}

export interface X402PaymentPayload {
  x402Version: number;
  scheme: "exact";
  network: string;
  payload: {
    signature: string;
    authorization: {
      from: Address;
      to: Address;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

export interface X402Response {
  status: 200 | 402;
  headers: Record<string, string>;
  body: unknown;
  paymentRequirements?: X402PaymentRequirement[];
}

export class X402Client {
  private account = getAccount();

  /**
   * Make an HTTP request with x402 payment support
   * If the server responds with 402, automatically sign and send payment
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    // First attempt - normal request
    const response = await globalThis.fetch(url, options);

    if (response.status !== 402) {
      return response;
    }

    console.log(`[MEGA CLAWD x402] Received 402 Payment Required from ${url}`);

    // Parse payment requirements from response
    const paymentRequirements = await this.parsePaymentRequirements(response);

    if (!paymentRequirements || paymentRequirements.length === 0) {
      throw new Error("Received 402 but no payment requirements found");
    }

    const requirement = paymentRequirements[0];
    console.log(
      `[MEGA CLAWD x402] Payment required: ${requirement.maxAmountRequired} ${X402_CONFIG.paymentToken} on ${requirement.network} to ${requirement.payTo}`
    );

    // Sign the payment (route by network)
    const paymentPayload =
      requirement.network === "solana"
        ? await this.signSolanaPayment(requirement)
        : await this.signPayment(requirement);

    // Retry with payment header
    const paidResponse = await globalThis.fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        "X-PAYMENT": JSON.stringify(paymentPayload),
        "X-PAYMENT-VERSION": "2",
      },
    });

    console.log(`[MEGA CLAWD x402] Payment accepted, status: ${paidResponse.status}`);
    return paidResponse;
  }

  /**
   * Parse x402 payment requirements from a 402 response
   */
  private async parsePaymentRequirements(
    response: Response
  ): Promise<X402PaymentRequirement[]> {
    // Check header first
    const paymentHeader = response.headers.get("X-PAYMENT-REQUIREMENTS");
    if (paymentHeader) {
      return JSON.parse(paymentHeader);
    }

    // Fallback to body
    const body = await response.json();
    if (body.paymentRequirements) {
      return body.paymentRequirements;
    }
    if (body.accepts) {
      return body.accepts;
    }

    return [];
  }

  /**
   * Sign an x402 payment authorization using EIP-3009 transferWithAuthorization
   */
  private async signPayment(
    requirement: X402PaymentRequirement
  ): Promise<X402PaymentPayload> {
    const walletClient = getBaseWalletClient();

    const amount = requirement.maxAmountRequired;
    const now = Math.floor(Date.now() / 1000);
    const nonce = keccak256(
      encodePacked(
        ["address", "uint256", "uint256"],
        [this.account.address, BigInt(now), BigInt(Math.floor(Math.random() * 1e9))]
      )
    );

    // EIP-712 typed data for transferWithAuthorization (EIP-3009)
    const domain = {
      name: "USD Coin",
      version: "2",
      chainId: 8453n, // Base
      verifyingContract: X402_CONFIG.usdcAddress,
    };

    const types = {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    };

    const value = parseUnits(amount, 6);
    const validAfter = BigInt(now - 60);
    const validBefore = BigInt(now + requirement.maxTimeoutSeconds);

    const message = {
      from: this.account.address,
      to: requirement.payTo,
      value,
      validAfter,
      validBefore,
      nonce: nonce as `0x${string}`,
    };

    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: "TransferWithAuthorization",
      message,
    });

    console.log(`[MEGA CLAWD x402] Payment signed: ${value} USDC`);

    return {
      x402Version: 2,
      scheme: "exact",
      network: "base",
      payload: {
        signature,
        authorization: {
          from: this.account.address,
          to: requirement.payTo,
          value: value.toString(),
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce,
        },
      },
    };
  }

  /**
   * Sign an x402 payment on Solana using USDC-SPL transfer
   */
  private async signSolanaPayment(
    requirement: X402PaymentRequirement
  ): Promise<X402PaymentPayload> {
    const { getSolanaKeypair, getSolanaConnection, SOLANA_CONFIG } = await import("./solana-config.js");
    const keypair = getSolanaKeypair();
    const connection = getSolanaConnection();

    const amount = Math.round(parseFloat(requirement.maxAmountRequired) * 1e6);
    const payTo = new PublicKey(requirement.payTo as string);

    const fromAta = await getAssociatedTokenAddress(
      SOLANA_CONFIG.usdcMint,
      keypair.publicKey
    );
    const toAta = await getAssociatedTokenAddress(
      SOLANA_CONFIG.usdcMint,
      payTo
    );

    const tx = new Transaction().add(
      createTransferInstruction(fromAta, toAta, keypair.publicKey, amount)
    );
    tx.feePayer = keypair.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.sign(keypair);

    const serialized = tx.serialize().toString("base64");

    console.log(`[MEGA CLAWD x402] Solana payment signed: ${amount} USDC-SPL`);

    return {
      x402Version: 2,
      scheme: "exact",
      network: "solana",
      payload: {
        signature: serialized,
        authorization: {
          from: keypair.publicKey.toBase58() as Address,
          to: requirement.payTo,
          value: amount.toString(),
          validAfter: "0",
          validBefore: (Math.floor(Date.now() / 1000) + requirement.maxTimeoutSeconds).toString(),
          nonce: `0x${Buffer.from(keypair.publicKey.toBytes().slice(0, 32)).toString("hex")}` as `0x${string}`,
        },
      },
    };
  }

  /**
   * Create x402 payment requirements for serving MEGA CLAWD's own APIs
   */
  createPaymentRequirement(
    resource: string,
    amount: string,
    description: string,
    network: "base" | "solana" = "base"
  ): X402PaymentRequirement {
    if (network === "solana") {
      let solanaAddress: string;
      try {
        const { getSolanaKeypair } = require("./solana-config.js");
        solanaAddress = getSolanaKeypair().publicKey.toBase58();
      } catch {
        solanaAddress = "";
      }
      return {
        scheme: "exact",
        network: "solana",
        maxAmountRequired: amount,
        resource,
        description,
        payTo: solanaAddress as Address,
        maxTimeoutSeconds: 300,
        asset: X402_CONFIG.usdcSolanaAddress as unknown as Address,
      };
    }
    return {
      scheme: "exact",
      network: "base",
      maxAmountRequired: amount,
      resource,
      description,
      payTo: this.account.address,
      maxTimeoutSeconds: 300,
      asset: X402_CONFIG.usdcAddress,
    };
  }
}
