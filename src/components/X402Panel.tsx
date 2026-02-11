"use client";

export function X402Panel() {
  const services = [
    {
      name: "Code Review",
      price: "$0.50",
      description: "AI-powered smart contract audit",
      endpoint: "/x402/code-review",
    },
    {
      name: "Deploy Contract",
      price: "$2.00",
      description: "Deploy on Base L2",
      endpoint: "/x402/deploy",
    },
    {
      name: "Agent Task",
      price: "$1.00",
      description: "Custom agent task execution",
      endpoint: "/x402/task",
    },
  ];

  return (
    <div className="card-glow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gradient">x402 Payments</h2>
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
          HTTP-Native
        </span>
      </div>

      <div className="mb-4 p-3 bg-clawd-dark/50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-xs text-gray-500">Protocol</span>
            <p className="text-sm font-bold text-white">x402 v2</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Token</span>
            <p className="text-sm font-bold text-white">USDC</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Chain</span>
            <p className="text-sm font-bold text-white">Base</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-400">Paid Services</h3>
        {services.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between p-3 bg-clawd-dark/30 rounded-lg"
          >
            <div>
              <span className="text-sm font-medium">{s.name}</span>
              <p className="text-xs text-gray-500">{s.description}</p>
            </div>
            <div className="text-right">
              <span className="text-clawd-gold font-bold">{s.price}</span>
              <p className="text-xs text-gray-500">USDC</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-clawd-dark/50 rounded-lg text-xs text-gray-500">
        <p>
          Flow: Request → 402 Response → Sign USDC → Retry with X-PAYMENT → Resource
        </p>
      </div>
    </div>
  );
}
