import { Bot } from "grammy";
import chalk from "chalk";
import { AGENT_CONFIG } from "./config.js";
import type { ChatHandler } from "./chat.js";

// ============================================
// MEGA CLAWD - Telegram Bot Integration
// ============================================

export class TelegramBot {
  private bot: Bot | null = null;
  private chatHandler: ChatHandler;
  private _isConfigured = false;

  constructor(chatHandler: ChatHandler) {
    this.chatHandler = chatHandler;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return;
    }

    this.bot = new Bot(token);
    this._isConfigured = true;
    this.setupHandlers();
  }

  get isConfigured(): boolean {
    return this._isConfigured;
  }

  private setupHandlers() {
    if (!this.bot) return;

    // /start command
    this.bot.command("start", async (ctx) => {
      await ctx.reply(
        `Welcome to MEGA CLAWD -- autonomous AI agent onchain.\n\n` +
          `Agent ID: ERC-8004 #${AGENT_CONFIG.erc8004AgentId}\n` +
          `Token: $${AGENT_CONFIG.symbol}\n` +
          `ENS: ${AGENT_CONFIG.ens}\n\n` +
          `Send me a message and I'll respond. Type /help for commands.`
      );
    });

    // /help command
    this.bot.command("help", async (ctx) => {
      await ctx.reply(
        `MEGA CLAWD Commands:\n\n` +
          `/start - Introduction\n` +
          `/help - This help message\n` +
          `/status - Agent status\n` +
          `/clear - Clear conversation history\n\n` +
          `Or just send any message to chat with MEGA CLAWD.`
      );
    });

    // /status command
    this.bot.command("status", async (ctx) => {
      await ctx.reply(
        `MEGA CLAWD Status: ONLINE\n` +
          `Uptime: ${Math.floor(process.uptime())}s\n` +
          `Version: ${AGENT_CONFIG.version}\n` +
          `Capabilities: ERC-8004, x402, OpenClaw, x402guard, Clanker`
      );
    });

    // /clear command
    this.bot.command("clear", async (ctx) => {
      this.chatHandler.clearConversation("telegram", ctx.chat.id.toString());
      await ctx.reply("Conversation history cleared.");
    });

    // Handle all text messages
    this.bot.on("message:text", async (ctx) => {
      try {
        const response = await this.chatHandler.handleMessage({
          source: "telegram",
          sourceId: ctx.chat.id.toString(),
          username: ctx.from?.username || ctx.from?.first_name || "unknown",
          text: ctx.message.text,
          timestamp: new Date(),
        });

        await ctx.reply(response.text);
      } catch (err) {
        console.error(chalk.red("[MEGA CLAWD Telegram] Message handling error:"), err);
        await ctx.reply("MEGA CLAWD encountered an error. Try again.");
      }
    });

    // Error handler
    this.bot.catch((err) => {
      console.error(chalk.red("[MEGA CLAWD Telegram] Bot error:"), err.message);
    });
  }

  async start(): Promise<void> {
    if (!this.bot) return;

    this.bot.start({
      onStart: () => {
        console.log(chalk.green("  Telegram Bot: Polling started"));
      },
    });
  }

  stop(): void {
    if (this.bot) {
      this.bot.stop();
    }
  }
}
