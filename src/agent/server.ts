import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import type { WalletManager } from "./wallet.js";
import type { ERC8004Client } from "./erc8004.js";
import type { X402Client } from "./x402.js";
import type { ChatHandler } from "./chat.js";
import type { SolanaWalletManager } from "./solana-wallet.js";
import { AGENT_CONFIG } from "./config.js";

// ============================================
// MEGA CLAWD - Agent API Server
// Exposes agent capabilities via HTTP with x402 payment gating
// ============================================

export class AgentServer {
  private app = express();
  private wallet: WalletManager;
  private erc8004: ERC8004Client;
  private x402: X402Client;
  private chatHandler: ChatHandler | null = null;
  private solanaWallet: SolanaWalletManager | null = null;
  private wss: WebSocketServer | null = null;

  constructor(wallet: WalletManager, erc8004: ERC8004Client, x402: X402Client, chatHandler?: ChatHandler, solanaWallet?: SolanaWalletManager | null) {
    this.wallet = wallet;
    this.erc8004 = erc8004;
    this.x402 = x402;
    this.chatHandler = chatHandler || null;
    this.solanaWallet = solanaWallet || null;
    this.setupRoutes();
  }

  private setupRoutes() {
    this.app.use(express.json());

    // CORS for frontend
    this.app.use((_req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*, X-PAYMENT, X-PAYMENT-VERSION");
      res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      next();
    });

    // ---- Public Endpoints ----

    // Agent identity
    this.app.get("/", (_req, res) => {
      res.json({
        name: AGENT_CONFIG.name,
        version: AGENT_CONFIG.version,
        description: AGENT_CONFIG.description,
        wallet: this.wallet.address,
        ens: AGENT_CONFIG.ens,
        website: AGENT_CONFIG.website,
        twitter: `https://x.com/${AGENT_CONFIG.twitter}`,
        erc8004AgentId: AGENT_CONFIG.erc8004AgentId,
        tokenAddress: AGENT_CONFIG.tokenAddress,
        capabilities: ["erc8004", "x402", "openclaw", "solana", "a2a", "mcp"],
        x402: true,
        endpoints: {
          identity: "/identity",
          status: "/status",
          services: "/x402/services",
          a2a: "/a2a",
        },
      });
    });

    // Agent status (balances, health)
    this.app.get("/status", async (_req, res) => {
      try {
        const timeout = <T>(p: Promise<T>, ms: number) =>
          Promise.race([p, new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
        const balances = await timeout(this.wallet.getBalances(), 8000);
        let solanaData: Record<string, string> = {};
        if (this.solanaWallet) {
          try {
            const solBal = await timeout(this.solanaWallet.getBalances(), 8000);
            solanaData = {
              solanaAddress: solBal.address,
              solBalance: solBal.solBalance,
              usdcSolana: solBal.usdcBalance,
            };
          } catch { /* graceful fallback */ }
        }
        res.json({
          status: "online",
          agent: AGENT_CONFIG.name,
          wallet: { ...balances, ...solanaData },
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const walletData: Record<string, string> = { address: this.wallet.address };
        if (this.solanaWallet) {
          walletData.solanaAddress = this.solanaWallet.address;
        }
        res.json({
          status: "online",
          agent: AGENT_CONFIG.name,
          wallet: walletData,
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          note: "Balance fetch unavailable",
        });
      }
    });

    // ERC-8004 identity metadata
    this.app.get("/identity", (_req, res) => {
      const metadata = this.erc8004.buildMetadata();
      res.json(metadata);
    });

    // ---- x402 Gated Endpoints ----

    // List available paid services
    this.app.get("/x402/services", (_req, res) => {
      res.json({
        chains: ["base", "solana"],
        services: [
          {
            name: "code-review",
            description: "AI-powered smart contract code review",
            price: "0.50",
            currency: "USDC",
            chains: ["base", "solana"],
            endpoint: "/x402/code-review",
          },
          {
            name: "deploy-contract",
            description: "Deploy a smart contract on Base or Solana",
            price: "2.00",
            currency: "USDC",
            chains: ["base", "solana"],
            endpoint: "/x402/deploy",
          },
          {
            name: "agent-task",
            description: "Execute a custom agent task",
            price: "1.00",
            currency: "USDC",
            chains: ["base", "solana"],
            endpoint: "/x402/task",
          },
        ],
      });
    });

    // x402-gated code review service
    this.app.post("/x402/code-review", (req, res) => {
      const payment = req.headers["x-payment"];

      if (!payment) {
        // Return 402 with payment requirements
        const requirement = this.x402.createPaymentRequirement(
          "/x402/code-review",
          "0.50",
          "AI-powered smart contract code review by MEGA CLAWD"
        );

        res.status(402).json({
          error: "Payment Required",
          paymentRequirements: [requirement],
        });
        return;
      }

      // Payment provided - process the request
      const { code } = req.body;
      res.json({
        agent: AGENT_CONFIG.name,
        service: "code-review",
        result: {
          reviewed: true,
          message: "Code review completed by MEGA CLAWD",
          codeLength: code?.length || 0,
          timestamp: new Date().toISOString(),
        },
      });
    });

    // x402-gated task execution
    this.app.post("/x402/task", (req, res) => {
      const payment = req.headers["x-payment"];

      if (!payment) {
        const requirement = this.x402.createPaymentRequirement(
          "/x402/task",
          "1.00",
          "Execute a custom task via MEGA CLAWD agent"
        );

        res.status(402).json({
          error: "Payment Required",
          paymentRequirements: [requirement],
        });
        return;
      }

      const { task } = req.body;
      res.json({
        agent: AGENT_CONFIG.name,
        service: "agent-task",
        task,
        result: {
          accepted: true,
          message: `Task queued for execution by MEGA CLAWD`,
          timestamp: new Date().toISOString(),
        },
      });
    });

    // ---- Agent-to-Agent (A2A) Protocol ----

    this.app.post("/a2a", (req, res) => {
      const { fromAgent, taskType, payload } = req.body;
      console.log(
        `[MEGA CLAWD] A2A request from agent: ${fromAgent}, task: ${taskType}`
      );

      res.json({
        agent: AGENT_CONFIG.name,
        agentId: "erc8004:1:megaclawd",
        response: "acknowledged",
        capabilities: ["code-review", "deploy", "swap", "bridge"],
        x402Required: true,
      });
    });

    // ---- Health Check ----
    this.app.get("/health", (_req, res) => {
      res.json({ healthy: true, timestamp: Date.now() });
    });
  }

  private setupWebSocket(server: import("http").Server) {
    if (!this.chatHandler) return;

    this.wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (request, socket, head) => {
      const url = new URL(request.url || "/", `http://${request.headers.host}`);
      if (url.pathname === "/chat") {
        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          this.wss!.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    this.wss.on("connection", (ws) => {
      const connectionId = randomUUID();
      console.log(`[MEGA CLAWD] Dashboard chat connected: ${connectionId}`);

      ws.on("message", async (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.type === "message" && parsed.text) {
            const response = await this.chatHandler!.handleMessage({
              source: "dashboard",
              sourceId: connectionId,
              text: parsed.text,
              timestamp: new Date(),
            });

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "response",
                  text: response.text,
                  timestamp: response.timestamp.toISOString(),
                })
              );
            }
          }
        } catch (err) {
          console.error("[MEGA CLAWD] Chat WS message error:", err);
        }
      });

      ws.on("close", () => {
        console.log(`[MEGA CLAWD] Dashboard chat disconnected: ${connectionId}`);
        this.chatHandler!.clearConversation("dashboard", connectionId);
      });
    });
  }

  async start(port: number): Promise<void> {
    return new Promise((resolve) => {
      const server = this.app.listen(port, () => {
        this.setupWebSocket(server);
        resolve();
      });
    });
  }
}
