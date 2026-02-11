"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

// --- Contract addresses (Base L2) ---
const JACKPOT_ADDRESS = "0x0000000000000000000000000000000000000000" as const; // Replace after deployment
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

// --- ABIs (minimal) ---
const JACKPOT_ABI = [
  {
    name: "enter",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "finalizeRound",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "currentRound",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "potBalance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "playerCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "timeRemaining",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "hasEntered",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "totalBuybacks",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "totalPrizes",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getRoundResult",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "round", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "winner", type: "address" },
          { name: "winnerPrize", type: "uint256" },
          { name: "buybackAmount", type: "uint256" },
          { name: "playerCount", type: "uint256" },
          { name: "endTime", type: "uint256" },
        ],
      },
    ],
  },
] as const;

const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

const ENTRY_AMOUNT = BigInt(1_000_000); // 1 USDC

function formatUSDC(raw: bigint | undefined): string {
  if (!raw) return "0.00";
  const n = Number(raw) / 1e6;
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function JackpotPage() {
  const { address, isConnected } = useAccount();
  const [countdown, setCountdown] = useState(0);

  // --- Read contract state ---
  const { data: currentRound } = useReadContract({
    address: JACKPOT_ADDRESS,
    abi: JACKPOT_ABI,
    functionName: "currentRound",
  });

  const { data: potBalance } = useReadContract({
    address: JACKPOT_ADDRESS,
    abi: JACKPOT_ABI,
    functionName: "potBalance",
  });

  const { data: playerCount } = useReadContract({
    address: JACKPOT_ADDRESS,
    abi: JACKPOT_ABI,
    functionName: "playerCount",
  });

  const { data: timeLeft } = useReadContract({
    address: JACKPOT_ADDRESS,
    abi: JACKPOT_ABI,
    functionName: "timeRemaining",
  });

  const { data: hasEntered } = useReadContract({
    address: JACKPOT_ADDRESS,
    abi: JACKPOT_ABI,
    functionName: "hasEntered",
    args: address ? [address] : undefined,
  });

  const { data: totalBuybacks } = useReadContract({
    address: JACKPOT_ADDRESS,
    abi: JACKPOT_ABI,
    functionName: "totalBuybacks",
  });

  const { data: totalPrizes } = useReadContract({
    address: JACKPOT_ADDRESS,
    abi: JACKPOT_ABI,
    functionName: "totalPrizes",
  });

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, JACKPOT_ADDRESS] : undefined,
  });

  // --- Write ---
  const { writeContract: approve, data: approveTxHash } = useWriteContract();
  const { writeContract: enter, data: enterTxHash } = useWriteContract();
  const { writeContract: finalize, data: finalizeTxHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });
  const { isLoading: isEntering } = useWaitForTransactionReceipt({
    hash: enterTxHash,
  });
  const { isLoading: isFinalizing } = useWaitForTransactionReceipt({
    hash: finalizeTxHash,
  });

  // --- Countdown timer ---
  useEffect(() => {
    if (timeLeft !== undefined) {
      setCountdown(Number(timeLeft));
    }
  }, [timeLeft]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // --- Handlers ---
  const needsApproval = !allowance || allowance < ENTRY_AMOUNT;
  const roundOver = countdown === 0;

  const handleApprove = useCallback(() => {
    approve({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [JACKPOT_ADDRESS, ENTRY_AMOUNT],
    });
  }, [approve]);

  const handleEnter = useCallback(() => {
    enter({
      address: JACKPOT_ADDRESS,
      abi: JACKPOT_ABI,
      functionName: "enter",
    });
  }, [enter]);

  const handleFinalize = useCallback(() => {
    finalize({
      address: JACKPOT_ADDRESS,
      abi: JACKPOT_ABI,
      functionName: "finalizeRound",
    });
  }, [finalize]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-clawd-primary/20 bg-clawd-dark/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              &larr; Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gradient">Jackpot dApp</h1>
          </div>
          <span className="text-xs text-gray-500 px-2 py-1 bg-clawd-primary/10 rounded border border-clawd-primary/20">
            Built by MEGA CLAWD
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Round Info */}
        <div className="card-glow text-center">
          <p className="text-gray-400 text-sm mb-1">
            Round #{currentRound?.toString() ?? "—"}
          </p>
          <div className="text-5xl font-mono font-bold text-gradient my-4">
            {formatCountdown(countdown)}
          </div>
          <p className="text-gray-400 text-sm">
            {roundOver ? "Round ended — draw the winner!" : "until round ends"}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-glow text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Pot Size
            </p>
            <p className="text-2xl font-bold text-white">
              {formatUSDC(potBalance as bigint | undefined)} USDC
            </p>
          </div>
          <div className="card-glow text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Players
            </p>
            <p className="text-2xl font-bold text-white">
              {playerCount?.toString() ?? "0"}
            </p>
          </div>
          <div className="card-glow text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Entry
            </p>
            <p className="text-2xl font-bold text-white">1 USDC</p>
          </div>
        </div>

        {/* Action */}
        <div className="card-glow">
          <h2 className="text-lg font-bold text-white mb-4">Enter the Pot</h2>

          {!isConnected ? (
            <p className="text-gray-400 text-sm">
              Connect your wallet to enter.
            </p>
          ) : hasEntered ? (
            <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4 text-center">
              <p className="text-green-400 font-semibold">
                You&apos;re in this round!
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Wait for the countdown to end, then draw the winner.
              </p>
            </div>
          ) : roundOver ? (
            <p className="text-yellow-400 text-sm">
              Round ended. Draw the winner below before entering the next round.
            </p>
          ) : needsApproval ? (
            <button
              className="btn-primary w-full"
              onClick={handleApprove}
              disabled={isApproving}
            >
              {isApproving ? "Approving USDC..." : "Approve 1 USDC"}
            </button>
          ) : (
            <button
              className="btn-primary w-full"
              onClick={handleEnter}
              disabled={isEntering}
            >
              {isEntering ? "Entering..." : "Enter Jackpot (1 USDC)"}
            </button>
          )}

          {/* Finalize button */}
          {roundOver && Number(playerCount ?? 0) > 0 && (
            <button
              className="btn-secondary w-full mt-3"
              onClick={handleFinalize}
              disabled={isFinalizing}
            >
              {isFinalizing ? "Drawing winner..." : "Draw Winner & Start Next Round"}
            </button>
          )}
        </div>

        {/* How it works */}
        <div className="card-glow">
          <h2 className="text-lg font-bold text-white mb-3">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="flex gap-3">
              <span className="text-clawd-primary font-bold">1.</span>
              <p>Deposit 1 USDC to enter the current round.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-clawd-primary font-bold">2.</span>
              <p>After 24 hours, anyone can trigger the draw.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-clawd-primary font-bold">3.</span>
              <p>50% of the pot goes to a random winner.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-clawd-primary font-bold">4.</span>
              <p>50% buys back $MEGACLAWD tokens via Uniswap.</p>
            </div>
          </div>
        </div>

        {/* Lifetime stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-glow text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Total Prizes Paid
            </p>
            <p className="text-xl font-bold text-green-400">
              {formatUSDC(totalPrizes as bigint | undefined)} USDC
            </p>
          </div>
          <div className="card-glow text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Total $MEGACLAWD Buybacks
            </p>
            <p className="text-xl font-bold text-clawd-primary">
              {formatUSDC(totalBuybacks as bigint | undefined)} USDC
            </p>
          </div>
        </div>

        {/* Contract info */}
        <div className="text-center text-xs text-gray-500 space-y-1 pb-8">
          <p>
            Contract:{" "}
            <code className="text-gray-400">{JACKPOT_ADDRESS}</code>
          </p>
          <p>Base L2 | USDC | Permissionless</p>
        </div>
      </div>
    </main>
  );
}
