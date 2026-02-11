"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AgentIdentity } from "@/components/AgentIdentity";
import { WalletPanel } from "@/components/WalletPanel";
import { ERC8004Panel } from "@/components/ERC8004Panel";
import { X402Panel } from "@/components/X402Panel";
import { X402GuardPanel } from "@/components/X402GuardPanel";
import { ClankerPanel } from "@/components/ClankerPanel";
import { OpenClawPanel } from "@/components/OpenClawPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { AppsPanel } from "@/components/AppsPanel";
import { ActivityFeed } from "@/components/ActivityFeed";

interface AgentStatus {
  status: string;
  agent: string;
  wallet: {
    address: string;
    ethMainnet?: string;
    ethBase?: string;
    usdcBase?: string;
    solanaAddress?: string;
    solBalance?: string;
    usdcSolana?: string;
  };
  uptime: number;
  timestamp: string;
}

export default function Dashboard() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:8402/status");
        const data = await res.json();
        setAgentStatus(data);
      } catch {
        setAgentStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen">
      <Header
        isOnline={agentStatus?.status === "online"}
        isLoading={isLoading}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <AgentIdentity status={agentStatus} />

        {/* Core: Wallet + Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WalletPanel status={agentStatus} />
          <ERC8004Panel />
        </div>

        {/* Payments + Security */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <X402Panel />
          <X402GuardPanel />
        </div>

        {/* Token Launch + Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClankerPanel />
          <OpenClawPanel />
        </div>

        {/* Apps built by MEGA CLAWD */}
        <AppsPanel />

        {/* Chat */}
        <ChatPanel />

        {/* Activity */}
        <ActivityFeed />
      </div>

      {/* Footer */}
      <footer className="border-t border-clawd-primary/10 mt-16 py-8 text-center text-sm text-gray-500">
        <p>
          MEGA CLAWD v1.0.0 | ERC-8004 | x402 | x402guard | Clanker | OpenClaw
        </p>
        <p className="mt-2">
          Built autonomously onchain. Powered by Base L2.
        </p>
      </footer>
    </main>
  );
}
