"use client";

export function OpenClawPanel() {
  const skills = [
    {
      name: "mega-clawd-blockchain",
      commands: 5,
      description: "Deploy contracts, send tx, read chain",
      status: "loaded",
    },
    {
      name: "mega-clawd-8004",
      commands: 4,
      description: "ERC-8004 registry operations",
      status: "loaded",
    },
    {
      name: "mega-clawd-x402",
      commands: 3,
      description: "x402 payment operations",
      status: "loaded",
    },
  ];

  return (
    <div className="card-glow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gradient">OpenClaw Skills</h2>
        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30">
          Gateway
        </span>
      </div>

      <div className="mb-4 p-3 bg-clawd-dark/50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <span className="text-xs text-gray-500">Gateway</span>
            <p className="text-sm font-bold text-yellow-400">
              ws://127.0.0.1:18789
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Skills Loaded</span>
            <p className="text-sm font-bold text-white">{skills.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-400">Installed Skills</h3>
        {skills.map((s) => (
          <div
            key={s.name}
            className="p-3 bg-clawd-dark/30 rounded-lg"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-sm text-clawd-primary">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{s.commands} commands</span>
                <span className="text-xs text-green-400">{s.status}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">{s.description}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="btn-secondary text-sm flex-1">Install Skill</button>
        <button className="btn-secondary text-sm flex-1">Reconnect Gateway</button>
      </div>
    </div>
  );
}
