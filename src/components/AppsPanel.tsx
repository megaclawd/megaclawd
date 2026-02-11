"use client";

import Link from "next/link";

interface AppEntry {
  name: string;
  description: string;
  href: string;
  status: "live" | "deploying" | "draft";
  icon: string;
}

const APPS: AppEntry[] = [
  {
    name: "Jackpot dApp",
    description:
      "1 USDC entry, 24h rounds. 50% to winner, 50% buyback $MEGACLAWD.",
    href: "/jackpot",
    status: "live",
    icon: "🎰",
  },
];

const statusColors: Record<AppEntry["status"], string> = {
  live: "bg-green-400/20 text-green-400 border-green-400/30",
  deploying: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
  draft: "bg-gray-400/20 text-gray-400 border-gray-400/30",
};

export function AppsPanel() {
  return (
    <div className="card-glow">
      <h2 className="text-xl font-bold text-gradient mb-1">
        Built by MEGA CLAWD
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Apps autonomously built by the agent
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {APPS.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="group block bg-clawd-dark/50 border border-clawd-primary/10 rounded-lg p-4 hover:border-clawd-primary/40 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{app.icon}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[app.status]}`}
              >
                {app.status}
              </span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-clawd-primary transition-colors">
              {app.name}
            </h3>
            <p className="text-gray-400 text-sm mt-1">{app.description}</p>
            <span className="inline-block mt-3 text-xs text-clawd-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Launch &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
