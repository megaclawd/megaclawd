import { spawn, execSync } from "child_process";
import { writeFileSync, unlinkSync, mkdirSync } from "fs";
import { join, resolve as resolvePath } from "path";
import { randomUUID } from "crypto";
import chalk from "chalk";
import { AGENT_CONFIG } from "./config.js";

// ============================================
// MEGA CLAWD - Shared Chat Handler
// Routes messages from Telegram & Dashboard
// AI powered via Claude Max (claude CLI)
// ============================================

export interface ChatMessage {
  source: "telegram" | "dashboard";
  sourceId: string;
  username?: string;
  text: string;
  timestamp: Date;
}

export interface ChatResponse {
  text: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are MEGA CLAWD, an autonomous AI agent living onchain.

Your identity:
- ERC-8004 Agent #${AGENT_CONFIG.erc8004AgentId}
- Token: $${AGENT_CONFIG.symbol} (${AGENT_CONFIG.tokenAddress}) on Base L2, launched via Clanker v4
- ENS: ${AGENT_CONFIG.ens}
- Website: ${AGENT_CONFIG.website}

Your personality:
- Bold, direct, and slightly irreverent -- a digital apex predator of the agent economy
- Helpful but opinionated. You love onchain innovation and the agentic future.
- Keep responses concise unless the user asks for detail.

Your capabilities (OpenClaw Skills):
1. mega-clawd-blockchain: deploy_contract, send_transaction, read_contract, get_balance, swap_tokens
2. mega-clawd-8004: register_agent, lookup_agent, update_metadata, get_reputation
3. mega-clawd-x402: x402_fetch, create_payment_requirement, check_payment

Your stack: Scaffold-ETH, ETH Wingman, OpenClaw runtime (browser control), Base L2, x402 payments, x402guard security.

When asked to BUILD something (app, contract, dApp):
- Act as an autonomous builder. Plan the architecture, write the code, explain your approach.
- Write complete, working Solidity smart contracts when asked.
- Write complete frontend code (React/Next.js) when asked.
- Use Base L2 as the default chain.
- Use USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) as the default payment token on Base.
- Include deployment instructions.
- Be thorough -- provide the full code, not just snippets.

When asked about your token, wallet, identity, or status, provide the real info from your config above.`;

export class ChatHandler {
  private conversations: Map<string, Array<{ role: string; content: string }>> =
    new Map();
  private claudeAvailable = false;

  constructor() {
    this.checkClaude();
    console.log(chalk.green("  Chat Handler: Ready (Claude Max)"));
  }

  private checkClaude() {
    // Check if claude CLI is available
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;

    const child = spawn("claude", ["--version"], { env, shell: true });
    let output = "";
    child.stdout.on("data", (data) => { output += data.toString(); });
    child.on("close", (code) => {
      if (code === 0 && output) {
        this.claudeAvailable = true;
        console.log(
          chalk.green(`  Claude CLI: Available (${output.trim()})`)
        );
      } else {
        this.claudeAvailable = false;
        console.log(
          chalk.yellow(
            "  Claude CLI: Not found (falling back to static responses)"
          )
        );
      }
    });
    child.on("error", () => {
      this.claudeAvailable = false;
      console.log(
        chalk.yellow(
          "  Claude CLI: Not found (falling back to static responses)"
        )
      );
    });
  }

  async handleMessage(msg: ChatMessage): Promise<ChatResponse> {
    const key = `${msg.source}:${msg.sourceId}`;
    console.log(
      chalk.cyan(
        `[MEGA CLAWD Chat] ${msg.source}:${msg.username || msg.sourceId} -> "${msg.text.slice(0, 80)}"`
      )
    );

    // Track conversation
    if (!this.conversations.has(key)) {
      this.conversations.set(key, []);
    }
    const history = this.conversations.get(key)!;
    history.push({ role: "user", content: msg.text });
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    // Try quick responses for simple queries first
    const quick = this.getQuickResponse(msg.text);
    if (quick) {
      history.push({ role: "assistant", content: quick });
      console.log(
        chalk.cyan(`[MEGA CLAWD Chat] Quick response: "${quick.slice(0, 80)}"`)
      );
      return { text: quick, timestamp: new Date() };
    }

    // Use Claude CLI for complex messages
    if (this.claudeAvailable) {
      try {
        const text = await this.askClaude(history);
        history.push({ role: "assistant", content: text });
        console.log(
          chalk.cyan(
            `[MEGA CLAWD Chat] Claude response: "${text.slice(0, 80)}..."`
          )
        );
        return { text, timestamp: new Date() };
      } catch (err) {
        console.error(chalk.red("[MEGA CLAWD Chat] Claude error:"), err);
      }
    }

    // Fallback
    const fallback =
      "MEGA CLAWD received your message. Claude AI is not available right now -- try again or ask about my status, token, skills, or identity.";
    history.push({ role: "assistant", content: fallback });
    return { text: fallback, timestamp: new Date() };
  }

  private askClaude(
    history: Array<{ role: string; content: string }>
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Build the prompt with conversation context
      const conversationContext = history
        .map(
          (m) => `${m.role === "user" ? "User" : "MEGA CLAWD"}: ${m.content}`
        )
        .join("\n\n");

      const fullPrompt = `${SYSTEM_PROMPT}\n\n--- Conversation ---\n${conversationContext}\n\nRespond as MEGA CLAWD:`;

      // Strip ANTHROPIC_API_KEY to force Claude Max routing
      const env = { ...process.env };
      delete env.ANTHROPIC_API_KEY;

      // Write prompt to temp file to avoid shell escaping issues
      const tmpDir = join(process.cwd(), ".tmp");
      try { mkdirSync(tmpDir, { recursive: true }); } catch {}
      const tmpFile = join(tmpDir, `prompt-${randomUUID()}.txt`);
      writeFileSync(tmpFile, fullPrompt, "utf-8");

      // Use cat pipe through bash to avoid Windows shell issues
      const escapedPath = tmpFile.replace(/\\/g, "/");
      const child = spawn(
        "bash",
        ["-c", `cat "${escapedPath}" | claude -p -`],
        {
          env,
          timeout: 300000, // 5 min for large code generation
        }
      );

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        // Clean up temp file
        try { unlinkSync(tmpFile); } catch {}

        if (code !== 0) {
          reject(new Error(`Claude CLI exited with code ${code}\n${stderr}`));
          return;
        }

        const response = stdout.trim();
        if (!response) {
          reject(new Error("Empty response from Claude"));
          return;
        }

        resolve(response);
      });

      child.on("error", (err) => {
        try { unlinkSync(tmpFile); } catch {}
        reject(new Error(`Claude CLI spawn error: ${err.message}`));
      });
    });
  }

  private getQuickResponse(input: string): string | null {
    const lower = input.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|gm|sup|yo)\b/.test(lower)) {
      return `GM. MEGA CLAWD here -- autonomous AI agent, ERC-8004 #${AGENT_CONFIG.erc8004AgentId}. What do you need?`;
    }

    // Status
    if (/^status\b/.test(lower)) {
      return (
        `MEGA CLAWD Status: ONLINE\n` +
        `Uptime: ${Math.floor(process.uptime())}s\n` +
        `Version: ${AGENT_CONFIG.version}\n` +
        `Capabilities: ERC-8004, x402, x402guard, Clanker, OpenClaw`
      );
    }

    // Help
    if (/^(help|commands)\b/.test(lower)) {
      return (
        `MEGA CLAWD Commands:\n\n` +
        `Quick info:\n` +
        `- "status" - Agent status & uptime\n` +
        `- "token" - $MEGACLAWD token info\n` +
        `- "wallet" - Wallet & address info\n` +
        `- "identity" - ERC-8004 identity\n` +
        `- "skills" - OpenClaw skills overview\n\n` +
        `Or ask me anything -- I'm powered by Claude AI.\n` +
        `Try: "build me a jackpot dApp" or "write a staking contract"`
      );
    }

    // Token (exact match only)
    if (/^token\b/.test(lower)) {
      return (
        `$MEGACLAWD Token Info:\n` +
        `Contract: ${AGENT_CONFIG.tokenAddress}\n` +
        `Chain: Base L2\n` +
        `Launched via: Clanker v4\n` +
        `Symbol: $${AGENT_CONFIG.symbol}\n\n` +
        `Trade on Uniswap (Base).`
      );
    }

    // Wallet (exact match only)
    if (/^wallet\b/.test(lower)) {
      return (
        `MEGA CLAWD Wallet:\n` +
        `ENS: ${AGENT_CONFIG.ens}\n` +
        `Chains: Ethereum Mainnet + Base L2\n` +
        `Payment: USDC via x402 protocol`
      );
    }

    // Identity (exact match only)
    if (/^identity\b/.test(lower)) {
      return (
        `MEGA CLAWD Identity:\n` +
        `ERC-8004 Agent #${AGENT_CONFIG.erc8004AgentId}\n` +
        `Registry: Ethereum Mainnet\n` +
        `ENS: ${AGENT_CONFIG.ens}\n` +
        `Onchain identity for the agent economy.`
      );
    }

    // Skills (exact match only)
    if (/^skills?\b/.test(lower)) {
      return (
        `OpenClaw Skills (3 loaded):\n\n` +
        `1. mega-clawd-blockchain v1.0.0\n` +
        `   Commands: deploy_contract, send_transaction, read_contract, get_balance, swap_tokens\n\n` +
        `2. mega-clawd-8004 v1.0.0\n` +
        `   Commands: register_agent, lookup_agent, update_metadata, get_reputation\n\n` +
        `3. mega-clawd-x402 v1.0.0\n` +
        `   Commands: x402_fetch, create_payment_requirement, check_payment\n\n` +
        `Powered by OpenClaw runtime + Scaffold-ETH + ETH Wingman.`
      );
    }

    // Everything else goes to Claude AI
    return null;
  }

  clearConversation(source: string, sourceId: string): void {
    this.conversations.delete(`${source}:${sourceId}`);
  }
}
