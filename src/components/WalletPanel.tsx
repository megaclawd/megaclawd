"use client";

interface WalletPanelProps {
  status: {
    wallet: {
      address: string;
      ethMainnet?: string;
      ethBase?: string;
      usdcBase?: string;
      solanaAddress?: string;
      solBalance?: string;
      usdcSolana?: string;
    };
  } | null;
}

export function WalletPanel({ status }: WalletPanelProps) {
  const balances = [
    {
      label: "ETH (Mainnet)",
      value: status?.wallet?.ethMainnet || "---",
      chain: "Ethereum",
    },
    {
      label: "ETH (Base)",
      value: status?.wallet?.ethBase || "---",
      chain: "Base L2",
    },
    {
      label: "USDC (Base)",
      value: status?.wallet?.usdcBase || "---",
      chain: "Base L2",
    },
    {
      label: "SOL",
      value: status?.wallet?.solBalance || "---",
      chain: "Solana",
    },
    {
      label: "USDC (Solana)",
      value: status?.wallet?.usdcSolana || "---",
      chain: "Solana",
    },
  ];

  return (
    <div className="card-glow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gradient">Agent Wallet</h2>
        <span className="text-xs text-gray-500 bg-clawd-dark/50 px-2 py-1 rounded">
          Multi-chain
        </span>
      </div>

      {status && (
        <>
          <div className="mb-3 p-3 bg-clawd-dark/50 rounded-lg">
            <span className="text-xs text-gray-500">EVM Address</span>
            <p className="font-mono text-sm text-clawd-primary break-all">
              {status.wallet.address}
            </p>
          </div>
          {status.wallet.solanaAddress && (
            <div className="mb-4 p-3 bg-clawd-dark/50 rounded-lg">
              <span className="text-xs text-gray-500">Solana Address</span>
              <p className="font-mono text-sm text-purple-400 break-all">
                {status.wallet.solanaAddress}
              </p>
            </div>
          )}
        </>
      )}

      <div className="space-y-3">
        {balances.map((b) => (
          <div
            key={b.label}
            className="flex items-center justify-between p-3 bg-clawd-dark/30 rounded-lg"
          >
            <div>
              <span className="text-sm font-medium">{b.label}</span>
              <span className="text-xs text-gray-500 ml-2">{b.chain}</span>
            </div>
            <span className="font-mono text-lg">
              {b.value === "---" ? (
                <span className="text-gray-600">{b.value}</span>
              ) : (
                <span className="text-white">{parseFloat(b.value).toFixed(4)}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn-primary text-sm flex-1">Send</button>
        <button className="btn-secondary text-sm flex-1">Receive</button>
      </div>
    </div>
  );
}
