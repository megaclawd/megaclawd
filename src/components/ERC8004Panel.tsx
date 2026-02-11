"use client";

const AGENT_ID = "24011";
const REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";

export function ERC8004Panel() {
  const services = [
    { type: "web", endpoint: "github.com/megaclawd/megaclawd", status: "active" },
    { type: "ens", endpoint: "megaclawd.eth", status: "active" },
  ];

  return (
    <div className="card-glow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gradient">ERC-8004 Identity</h2>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
          Registered
        </span>
      </div>

      <div className="mb-4 p-3 bg-clawd-dark/50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500">Registry</span>
            <p className="font-mono text-xs text-gray-400">
              0x8004...9432
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Agent ID</span>
            <p className="text-clawd-gold font-bold">#{AGENT_ID}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-400">Declared Services</h3>
        {services.map((s) => (
          <div
            key={s.type}
            className="flex items-center justify-between p-2 bg-clawd-dark/30 rounded text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-clawd-primary/10 text-clawd-primary rounded text-xs uppercase">
                {s.type}
              </span>
              <span className="font-mono text-gray-300 text-xs">{s.endpoint}</span>
            </div>
            <span className="text-green-400 text-xs">{s.status}</span>
          </div>
        ))}
      </div>

      <div className="p-3 bg-clawd-dark/50 rounded-lg text-xs text-gray-500 mb-4">
        <p>x402 Support: enabled | Chain: Ethereum Mainnet | Standard: ERC-721</p>
      </div>

      <div className="flex gap-2">
        <a
          href={`https://8004scan.com/agent/${AGENT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm flex-1 text-center"
        >
          View on 8004scan
        </a>
        <a
          href={`https://etherscan.io/nft/${REGISTRY}/${AGENT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm flex-1 text-center"
        >
          View NFT
        </a>
      </div>
    </div>
  );
}
