"use client";

import { useState, useEffect } from "react";

interface Activity {
  id: string;
  type: "tx" | "x402" | "erc8004" | "openclaw" | "system";
  message: string;
  timestamp: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const now = new Date().toISOString();
    setActivities([
      {
        id: "1",
        type: "system",
        message: "MEGA CLAWD agent initialized",
        timestamp: now,
      },
      {
        id: "2",
        type: "erc8004",
        message: "ERC-8004 identity client ready",
        timestamp: now,
      },
      {
        id: "3",
        type: "x402",
        message: "x402 payment client ready (USDC on Base)",
        timestamp: now,
      },
      {
        id: "4",
        type: "openclaw",
        message: "3 OpenClaw skills loaded",
        timestamp: now,
      },
    ]);
  }, []);

  const typeColors: Record<string, string> = {
    tx: "text-green-400 bg-green-500/10 border-green-500/20",
    x402: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    erc8004: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    openclaw: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    system: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  return (
    <div className="card-glow">
      <h2 className="text-xl font-bold text-gradient mb-4">Activity Feed</h2>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-clawd-dark/30 rounded-lg animate-slide-up"
          >
            <span
              className={`px-2 py-0.5 rounded text-xs uppercase border ${
                typeColors[activity.type]
              }`}
            >
              {activity.type}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-gray-600 mt-1">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <p className="text-center text-gray-600 py-8">
          No activity yet. Start the agent to see events.
        </p>
      )}
    </div>
  );
}
