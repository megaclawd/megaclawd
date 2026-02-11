import WebSocket from "ws";
import { AGENT_CONFIG } from "./config.js";

// ============================================
// MEGA CLAWD - OpenClaw Gateway Integration
// ============================================

export interface OpenClawMessage {
  type: "message" | "tool_call" | "tool_result" | "status" | "error";
  id?: string;
  content?: string;
  tool?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export interface OpenClawSkill {
  name: string;
  description: string;
  version: string;
  commands: string[];
}

export class OpenClawGateway {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnects = 5;
  private messageHandlers: Map<string, (msg: OpenClawMessage) => void> = new Map();
  private gatewayUrl: string;

  constructor() {
    this.gatewayUrl =
      process.env.OPENCLAW_GATEWAY_URL || "ws://127.0.0.1:18789";
  }

  /**
   * Connect to the OpenClaw gateway
   */
  async connect(): Promise<boolean> {
    if (process.env.OPENCLAW_ENABLED !== "true") {
      console.log("[MEGA CLAWD] OpenClaw integration disabled");
      return false;
    }

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.gatewayUrl);

        this.ws.on("open", () => {
          console.log(
            `[MEGA CLAWD] Connected to OpenClaw gateway at ${this.gatewayUrl}`
          );
          this.reconnectAttempts = 0;

          // Register agent capabilities with gateway
          this.sendMessage({
            type: "status",
            content: JSON.stringify({
              agent: AGENT_CONFIG.name,
              version: AGENT_CONFIG.version,
              capabilities: [
                "blockchain",
                "smart-contracts",
                "solana",
                "solana-payments",
                "x402-payments",
                "erc8004",
                "code-review",
                "deploy",
              ],
              skills: this.getRegisteredSkills().map((s) => s.name),
            }),
          });

          resolve(true);
        });

        this.ws.on("message", (data) => {
          try {
            const msg: OpenClawMessage = JSON.parse(data.toString());
            this.handleMessage(msg);
          } catch (e) {
            console.error("[MEGA CLAWD] Failed to parse OpenClaw message:", e);
          }
        });

        this.ws.on("close", () => {
          console.log("[MEGA CLAWD] OpenClaw gateway disconnected");
          this.attemptReconnect();
        });

        this.ws.on("error", (err) => {
          console.error("[MEGA CLAWD] OpenClaw gateway error:", err.message);
          resolve(false);
        });

        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000);
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Send a message to the OpenClaw gateway
   */
  sendMessage(msg: OpenClawMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  /**
   * Register a handler for incoming messages
   */
  onMessage(type: string, handler: (msg: OpenClawMessage) => void) {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Handle incoming messages from the gateway
   */
  private handleMessage(msg: OpenClawMessage) {
    const handler = this.messageHandlers.get(msg.type);
    if (handler) {
      handler(msg);
      return;
    }

    // Default handling
    switch (msg.type) {
      case "tool_call":
        console.log(
          `[MEGA CLAWD] Tool call from OpenClaw: ${msg.tool}(${JSON.stringify(msg.args)})`
        );
        this.handleToolCall(msg);
        break;
      case "message":
        console.log(`[MEGA CLAWD] Message from OpenClaw: ${msg.content}`);
        break;
      case "error":
        console.error(`[MEGA CLAWD] OpenClaw error: ${msg.error}`);
        break;
    }
  }

  /**
   * Handle tool calls from the OpenClaw gateway
   */
  private handleToolCall(msg: OpenClawMessage) {
    // Respond to tool calls from the gateway
    this.sendMessage({
      type: "tool_result",
      id: msg.id,
      result: {
        agent: AGENT_CONFIG.name,
        tool: msg.tool,
        status: "acknowledged",
        message: `MEGA CLAWD processed tool call: ${msg.tool}`,
      },
    });
  }

  /**
   * Disconnect from the gateway
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get registered OpenClaw skills
   */
  getRegisteredSkills(): OpenClawSkill[] {
    return [
      {
        name: "mega-clawd-blockchain",
        description: "Blockchain operations: deploy contracts, send transactions, read chain state",
        version: "1.0.0",
        commands: [
          "deploy_contract",
          "send_transaction",
          "read_contract",
          "get_balance",
          "swap_tokens",
        ],
      },
      {
        name: "mega-clawd-8004",
        description: "ERC-8004 agent registry operations: register, lookup, update identity",
        version: "1.0.0",
        commands: [
          "register_agent",
          "lookup_agent",
          "update_metadata",
          "get_reputation",
        ],
      },
      {
        name: "mega-clawd-solana",
        description: "Solana operations: send SOL/SPL, swap via Jupiter, deploy Anchor programs",
        version: "1.0.0",
        commands: [
          "send_sol",
          "send_spl_token",
          "swap_jupiter",
          "deploy_program",
          "get_sol_balance",
        ],
      },
      {
        name: "mega-clawd-x402",
        description: "x402 HTTP payment operations: pay for services, receive payments",
        version: "1.0.0",
        commands: [
          "x402_fetch",
          "create_payment_requirement",
          "check_payment",
        ],
      },
    ];
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.log("[MEGA CLAWD] Max reconnection attempts reached for OpenClaw");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(
      `[MEGA CLAWD] Reconnecting to OpenClaw in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnects})`
    );

    setTimeout(() => this.connect(), delay);
  }
}
