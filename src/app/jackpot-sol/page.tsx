"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";

import idl from "./idl.json";

// --- Program addresses (update after deployment) ---
const PROGRAM_ID = new PublicKey("11111111111111111111111111111111");
const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

function formatUSDC(raw: number | undefined): string {
  if (!raw) return "0.00";
  return (raw / 1e6).toLocaleString(undefined, {
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

export default function JackpotSolPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;

  const [countdown, setCountdown] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [potBalance, setPotBalance] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [totalBuybacks, setTotalBuybacks] = useState(0);
  const [totalPrizes, setTotalPrizes] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Anchor program
  const program = useMemo(() => {
    if (!wallet.publicKey) return null;
    try {
      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });
      return new Program(idl as any, PROGRAM_ID, provider);
    } catch {
      return null;
    }
  }, [connection, wallet]);

  // State PDA
  const statePDA = useMemo(() => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("jackpot_state")],
      PROGRAM_ID
    );
    return pda;
  }, []);

  // Fetch on-chain state
  const fetchState = useCallback(async () => {
    if (!program) return;
    try {
      const state = await (program.account as any).jackpotState.fetch(statePDA);
      setCurrentRound(state.currentRound.toNumber());
      setPotBalance(state.potBalance.toNumber());
      setPlayerCount(state.playerCount);
      setTotalBuybacks(state.totalBuybacks.toNumber());
      setTotalPrizes(state.totalPrizes.toNumber());

      const endTime = state.roundStartTime.toNumber() + state.roundDuration.toNumber();
      const now = Math.floor(Date.now() / 1000);
      setCountdown(Math.max(0, endTime - now));
    } catch {
      // Program not deployed yet
    }
  }, [program, statePDA]);

  // Check if player entered
  const checkEntry = useCallback(async () => {
    if (!program || !publicKey || !currentRound) return;
    try {
      const [entryPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("player_entry"),
          new BN(currentRound).toArrayLike(Buffer, "le", 8),
          publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );
      await (program.account as any).playerEntry.fetch(entryPDA);
      setHasEntered(true);
    } catch {
      setHasEntered(false);
    }
  }, [program, publicKey, currentRound]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 15000);
    return () => clearInterval(interval);
  }, [fetchState]);

  useEffect(() => {
    checkEntry();
  }, [checkEntry]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const roundOver = countdown === 0;

  // Enter jackpot
  const handleEnter = useCallback(async () => {
    if (!program || !publicKey) return;
    setIsEntering(true);
    try {
      const playerUsdcAta = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        PROGRAM_ID
      );
      const [playerListPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("player_list"),
          new BN(currentRound).toArrayLike(Buffer, "le", 8),
        ],
        PROGRAM_ID
      );
      const [playerEntryPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("player_entry"),
          new BN(currentRound).toArrayLike(Buffer, "le", 8),
          publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );

      await program.methods
        .enter()
        .accounts({
          player: publicKey,
          jackpotState: statePDA,
          playerUsdcAccount: playerUsdcAta,
          vault: vaultPDA,
          playerList: playerListPDA,
          playerEntry: playerEntryPDA,
        })
        .rpc();

      setHasEntered(true);
      await fetchState();
    } catch (err) {
      console.error("Enter failed:", err);
    } finally {
      setIsEntering(false);
    }
  }, [program, publicKey, currentRound, statePDA, fetchState]);

  // Finalize round
  const handleFinalize = useCallback(async () => {
    if (!program || !publicKey) return;
    setIsFinalizing(true);
    try {
      await program.methods.finalizeRound().rpc();
      await fetchState();
    } catch (err) {
      console.error("Finalize failed:", err);
    } finally {
      setIsFinalizing(false);
    }
  }, [program, publicKey, fetchState]);

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
            <h1 className="text-2xl font-bold text-gradient">
              Jackpot SOL
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20">
              Solana
            </span>
            <WalletMultiButton className="!bg-clawd-primary hover:!bg-clawd-primary/80 !rounded-lg !h-9 !text-sm" />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Round Info */}
        <div className="card-glow text-center">
          <p className="text-gray-400 text-sm mb-1">
            Round #{currentRound || "—"}
          </p>
          <div className="text-5xl font-mono font-bold text-gradient my-4">
            {formatCountdown(countdown)}
          </div>
          <p className="text-gray-400 text-sm">
            {roundOver
              ? "Round ended — draw the winner!"
              : "until round ends"}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-glow text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Pot Size
            </p>
            <p className="text-2xl font-bold text-white">
              {formatUSDC(potBalance)} USDC
            </p>
          </div>
          <div className="card-glow text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Players
            </p>
            <p className="text-2xl font-bold text-white">{playerCount}</p>
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

          {!connected ? (
            <p className="text-gray-400 text-sm">
              Connect your Solana wallet to enter.
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
          {roundOver && playerCount > 0 && (
            <button
              className="btn-secondary w-full mt-3"
              onClick={handleFinalize}
              disabled={isFinalizing}
            >
              {isFinalizing
                ? "Drawing winner..."
                : "Draw Winner & Start Next Round"}
            </button>
          )}
        </div>

        {/* How it works */}
        <div className="card-glow">
          <h2 className="text-lg font-bold text-white mb-3">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="flex gap-3">
              <span className="text-purple-400 font-bold">1.</span>
              <p>Deposit 1 USDC (SPL) to enter the current round.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-purple-400 font-bold">2.</span>
              <p>After 24 hours, anyone can trigger the draw.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-purple-400 font-bold">3.</span>
              <p>50% of the pot goes to a random winner.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-purple-400 font-bold">4.</span>
              <p>50% buys back $MEGACLAWD tokens via Jupiter.</p>
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
              {formatUSDC(totalPrizes)} USDC
            </p>
          </div>
          <div className="card-glow text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Total $MEGACLAWD Buybacks
            </p>
            <p className="text-xl font-bold text-purple-400">
              {formatUSDC(totalBuybacks)} USDC
            </p>
          </div>
        </div>

        {/* Contract info */}
        <div className="text-center text-xs text-gray-500 space-y-1 pb-8">
          <p>
            Program:{" "}
            <code className="text-gray-400">{PROGRAM_ID.toBase58()}</code>
          </p>
          <p>Solana Mainnet | USDC-SPL | Permissionless | Anchor</p>
        </div>
      </div>
    </main>
  );
}
