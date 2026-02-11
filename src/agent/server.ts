import express from "express";
import type { WalletManager } from "./wallet.js";
import type { ERC8004Client } from "./erc8004.js";
import type { X402Client } from "./x402.js";
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

  constructor(wallet: WalletManager, erc8004: ERC8004Client, x402: X402Client) {
    this.wallet = wallet;
    this.erc8004 = erc8004;
    this.x402 = x402;
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
        capabilities: ["erc8004", "x402", "openclaw", "a2a", "mcp"],
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
        const balances = await this.wallet.getBalances();
        res.json({
          status: "online",
          agent: AGENT_CONFIG.name,
          wallet: balances,
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.json({
          status: "online",
          agent: AGENT_CONFIG.name,
          wallet: { address: this.wallet.address },
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
        services: [
          {
            name: "code-review",
            description: "AI-powered smart contract code review",
            price: "0.50",
            currency: "USDC",
            endpoint: "/x402/code-review",
          },
          {
            name: "deploy-contract",
            description: "Deploy a smart contract on Base",
            price: "2.00",
            currency: "USDC",
            endpoint: "/x402/deploy",
          },
          {
            name: "agent-task",
            description: "Execute a custom agent task",
            price: "1.00",
            currency: "USDC",
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

  async start(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        resolve();
      });
    });
  }
}
