"use client";

interface AgentIdentityProps {
  status: {
    agent: string;
    wallet: { address: string };
    uptime: number;
    timestamp: string;
  } | null;
}

export function AgentIdentity({ status }: AgentIdentityProps) {
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="card-glow text-center py-12">
      {/* ASCII Art Logo */}
      <pre className="text-clawd-primary text-xs sm:text-sm leading-tight mb-6 inline-block text-left">
{`  ███╗   ███╗███████╗ ██████╗  █████╗
  ████╗ ████║██╔════╝██╔════╝ ██╔══██╗
  ██╔████╔██║█████╗  ██║  ███╗███████║
  ██║╚██╔╝██║██╔══╝  ██║   ██║██╔══██║
  ██║ ╚═╝ ██║███████╗╚██████╔╝██║  ██║
  ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝
   ██████╗██╗      █████╗ ██╗    ██╗██████╗
  ██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗
  ██║     ██║     ███████║██║ █╗ ██║██║  ██║
  ██║     ██║     ██╔══██║██║███╗██║██║  ██║
  ╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝
   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝`}
      </pre>

      <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
        Autonomous AI Agent with onchain identity, x402 payments, and OpenClaw skills.
        Building the future of the agent economy.
      </p>

      {status && (
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">Wallet: </span>
            <code className="text-clawd-primary">
              {status.wallet.address.slice(0, 6)}...{status.wallet.address.slice(-4)}
            </code>
          </div>
          <div>
            <span className="text-gray-500">Uptime: </span>
            <span className="text-green-400">{formatUptime(status.uptime)}</span>
          </div>
          <div>
            <span className="text-gray-500">ENS: </span>
            <span className="text-clawd-gold">megaclawd.eth</span>
          </div>
          <div>
            <span className="text-gray-500">Token: </span>
            <a
              href="https://basescan.org/token/0x1da14047c57e54f1097ae1ae314093a3c8490b07"
              target="_blank"
              rel="noopener noreferrer"
              className="text-clawd-accent hover:underline"
            >
              $MEGACLAWD
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
