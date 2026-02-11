"use client";

const TOKEN_ADDRESS = "0x1da14047c57e54f1097ae1ae314093a3c8490b07";

export function ClankerPanel() {
  const tokenConfig = {
    name: "MEGA CLAWD",
    symbol: "$MEGACLAWD",
    contract: `${TOKEN_ADDRESS.slice(0, 6)}...${TOKEN_ADDRESS.slice(-4)}`,
    supply: "100,000,000,000",
    chain: "Base (Clanker v4)",
    pool: "Uniswap V4",
    status: "LIVE",
  };

  const launchMethods = [
    {
      method: "Farcaster",
      description: 'Tag @clanker on Warpcast',
      difficulty: "Easiest",
      color: "text-green-400",
    },
    {
      method: "clanker.world",
      description: "Web interface with full config",
      difficulty: "Easy",
      color: "text-blue-400",
    },
    {
      method: "SDK",
      description: "npm install clanker-sdk",
      difficulty: "Programmatic",
      color: "text-purple-400",
    },
    {
      method: "API",
      description: "REST API (requires API key)",
      difficulty: "Automated",
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="card-glow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gradient">$MEGACLAWD Token</h2>
        <a
          href="https://clanker.world"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30 hover:bg-orange-500/30 transition"
        >
          clanker.world
        </a>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        $MEGACLAWD launched via Clanker on Base. Uniswap V4 pool with locked
        liquidity. LP fees flow to agent wallet.
      </p>

      {/* Token Config */}
      <div className="mb-4 p-3 bg-clawd-dark/50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Token Configuration</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(tokenConfig).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-500 capitalize">{key}:</span>
              <span className="text-white font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Methods */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Launch Methods</h3>
        <div className="space-y-2">
          {launchMethods.map((m) => (
            <div
              key={m.method}
              className="flex items-center justify-between p-2 bg-clawd-dark/30 rounded text-sm"
            >
              <div>
                <span className="font-medium">{m.method}</span>
                <p className="text-xs text-gray-500">{m.description}</p>
              </div>
              <span className={`text-xs ${m.color}`}>{m.difficulty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Info */}
      <div className="p-3 bg-clawd-dark/50 rounded-lg text-xs text-gray-500 mb-4">
        <p>
          Clanker charges 0.2% protocol fee on swaps. Creator earns LP fees
          (dynamic, ~0.25-0.5% base + volatility). All fees claimable at
          clanker.world.
        </p>
      </div>

      <div className="flex gap-2">
        <a
          href={`https://app.uniswap.org/swap?chain=base&outputCurrency=${TOKEN_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm flex-1 text-center"
        >
          Trade $MEGACLAWD
        </a>
        <a
          href={`https://basescan.org/token/${TOKEN_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm flex-1 text-center"
        >
          View on BaseScan
        </a>
      </div>
    </div>
  );
}
