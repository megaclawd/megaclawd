"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

interface HeaderProps {
  isOnline: boolean;
  isLoading: boolean;
}

export function Header({ isOnline, isLoading }: HeaderProps) {
  return (
    <header className="border-b border-clawd-primary/20 bg-clawd-dark/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gradient">MEGA CLAWD</h1>
          <div className="flex items-center gap-2 text-sm">
            {isLoading ? (
              <span className="status-dot bg-yellow-400 animate-pulse" />
            ) : isOnline ? (
              <span className="status-online" />
            ) : (
              <span className="status-offline" />
            )}
            <span className="text-gray-400">
              {isLoading ? "Connecting..." : isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-clawd-primary/10 rounded border border-clawd-primary/20">
              ERC-8004
            </span>
            <span className="px-2 py-1 bg-clawd-primary/10 rounded border border-clawd-primary/20">
              x402
            </span>
            <span className="px-2 py-1 bg-clawd-primary/10 rounded border border-clawd-primary/20">
              OpenClaw
            </span>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
