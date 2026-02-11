"use client";

import { useState } from "react";

export function X402GuardPanel() {
  const [scanUrl, setScanUrl] = useState("");
  const [scanning, setScanning] = useState(false);

  const tiers = [
    {
      name: "Quick",
      price: "$0.01",
      features: "YARA scan, risk score",
      endpoint: "/audit/quick",
    },
    {
      name: "Standard",
      price: "$0.05",
      features: "+ permissions, network detection",
      endpoint: "/audit/standard",
    },
    {
      name: "Deep",
      price: "$0.10",
      features: "+ sandbox, signed attestation",
      endpoint: "/audit/deep",
    },
  ];

  const trustStack = [
    { layer: 1, name: "Identity", provider: "ERC-8004", active: true },
    { layer: 2, name: "Code Security", provider: "x402guard", active: true },
    { layer: 3, name: "Runtime Behavior", provider: "Trustline", active: false },
    { layer: 4, name: "Payment Security", provider: "x402-secure", active: false },
  ];

  return (
    <div className="card-glow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gradient">x402guard Security</h2>
        <a
          href="https://x402guard.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 hover:bg-red-500/30 transition"
        >
          x402guard.xyz
        </a>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Pre-installation vulnerability detection for AI agent skills. Scans for malware,
        data exfiltration, excessive permissions, and obfuscated code.
      </p>

      {/* Agentic Trust Stack */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Agentic Trust Stack</h3>
        <div className="space-y-1">
          {trustStack.map((layer) => (
            <div
              key={layer.layer}
              className={`flex items-center justify-between p-2 rounded text-xs ${
                layer.active
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-clawd-dark/30 border border-gray-700/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500">L{layer.layer}</span>
                <span className={layer.active ? "text-white" : "text-gray-600"}>
                  {layer.name}
                </span>
              </div>
              <span className={layer.active ? "text-green-400" : "text-gray-600"}>
                {layer.provider}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Tiers */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Audit Tiers</h3>
        <div className="space-y-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="flex items-center justify-between p-2 bg-clawd-dark/30 rounded text-sm"
            >
              <div>
                <span className="font-medium">{tier.name}</span>
                <p className="text-xs text-gray-500">{tier.features}</p>
              </div>
              <span className="text-clawd-gold font-mono">{tier.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scan Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Skill URL to audit..."
          value={scanUrl}
          onChange={(e) => setScanUrl(e.target.value)}
          className="flex-1 bg-clawd-dark/50 border border-clawd-primary/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-clawd-primary/50"
        />
        <button
          className="btn-primary text-sm"
          disabled={!scanUrl || scanning}
          onClick={() => setScanning(true)}
        >
          {scanning ? "Scanning..." : "Scan"}
        </button>
      </div>
    </div>
  );
}
