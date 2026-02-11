```
  ███╗   ███╗███████╗ ██████╗  █████╗
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
   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝
```

# MEGA CLAWD

**Autonomous AI Agent with onchain identity, x402 payments, and OpenClaw skills.**

**$MEGACLAWD Token**: [`0x1da14047c57e54f1097ae1ae314093a3c8490b07`](https://basescan.org/token/0x1da14047c57e54f1097ae1ae314093a3c8490b07) (Base, via Clanker)

[Trade on Uniswap](https://app.uniswap.org/swap?chain=base&outputCurrency=0x1da14047c57e54f1097ae1ae314093a3c8490b07) | [View on BaseScan](https://basescan.org/token/0x1da14047c57e54f1097ae1ae314093a3c8490b07) | [View on Clanker](https://clanker.world/clanker/0x1da14047c57e54f1097ae1ae314093a3c8490b07) | [Moltbook](https://moltbook.com/u/MEGA-CLAWD)

MEGA CLAWD is an economically autonomous AI agent that can:
- Own a wallet and transact onchain (ETH, USDC, $MEGACLAWD)
- Register and maintain a verifiable identity via **ERC-8004**
- Send and receive payments using the **x402** HTTP payment protocol
- Audit skills before installation via **x402guard**
- Launch tokens via **Clanker** on Base
- Extend capabilities through **OpenClaw** skills
- Serve paid APIs and interact with other agents (A2A protocol)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    MEGA CLAWD                        │
├─────────────┬──────────────┬───────────┬────────────┤
│   Wallet    │   ERC-8004   │   x402    │  OpenClaw  │
│   Manager   │   Identity   │  Payments │  Gateway   │
├─────────────┴──────────────┴───────────┴────────────┤
│                  Agent Core (TypeScript)             │
├─────────────────────────────────────────────────────┤
│          Agent API Server (Express, port 8402)       │
├─────────────────────────────────────────────────────┤
│           Frontend Dashboard (Next.js 15)            │
├──────────────────────┬──────────────────────────────┤
│   Ethereum Mainnet   │          Base L2              │
│   (ERC-8004 ID)      │   (Token, Vault, x402)       │
└──────────────────────┴──────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.20, Foundry |
| Agent Core | TypeScript, viem |
| Frontend | Next.js 15, React 19, Tailwind, RainbowKit |
| Payments | x402 v2, EIP-3009 (USDC) |
| Security | x402guard (skill auditing) |
| Token Launch | Clanker v4 (Uniswap V4) |
| Identity | ERC-8004, ERC-721 |
| Agent Gateway | OpenClaw |
| Social | Moltbook |
| Chains | Ethereum Mainnet, Base L2 |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Generate agent wallet

```bash
npm run setup-wallet
```

This creates a new Ethereum wallet and saves the private key to `.env`.

### 3. Fund the wallet

Send funds to your agent's address:
- **Ethereum Mainnet**: ETH for ERC-8004 registration (~$3-5 gas)
- **Base L2**: ETH (gas) + USDC (x402 payments)

### 4. Configure environment

Copy `.env.example` to `.env` and fill in:
- `ETHEREUM_RPC_URL` - Alchemy/Infura Ethereum RPC
- `BASE_RPC_URL` - Alchemy/Infura Base RPC
- `ANTHROPIC_API_KEY` - For AI capabilities

### 5. Register on ERC-8004

```bash
npm run register-8004
```

Registers MEGA CLAWD on the Trustless Agents Registry (Ethereum mainnet).

### 6. Start the agent

```bash
# Agent backend (API server + wallet + x402 + OpenClaw)
npm run agent

# Frontend dashboard
npm run dev
```

- Agent API: http://localhost:8402
- Dashboard: http://localhost:3000

## $MEGACLAWD Token

Launched via **Clanker v4** on Base with Uniswap V4 pool.

| Property | Value |
|----------|-------|
| **Contract** | [`0x1da14047c57e54f1097ae1ae314093a3c8490b07`](https://basescan.org/token/0x1da14047c57e54f1097ae1ae314093a3c8490b07) |
| **Chain** | Base (8453) |
| **DEX** | Uniswap V4 |
| **Launcher** | Clanker |
| **LP Fees** | Dynamic, flow to agent wallet |

## Smart Contracts

| Contract | Description | Chain |
|----------|------------|-------|
| `MegaClawdVault` | Treasury with daily budgets | Base |
| `X402PaymentReceiver` | x402 payment processing | Base |

## Agent API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | Public | Agent identity |
| `/status` | GET | Public | Wallet balances, uptime |
| `/identity` | GET | Public | ERC-8004 metadata |
| `/x402/services` | GET | Public | List paid services |
| `/x402/code-review` | POST | x402 | Smart contract code review |
| `/x402/task` | POST | x402 | Custom agent task |
| `/a2a` | POST | Public | Agent-to-Agent protocol |
| `/health` | GET | Public | Health check |

## OpenClaw Skills

Install MEGA CLAWD skills in your OpenClaw agent:

```bash
# Blockchain operations
openclaw skill install https://github.com/megaclawd/megaclawd/raw/main/skills/mega-clawd-blockchain/SKILL.md

# ERC-8004 identity
openclaw skill install https://github.com/megaclawd/megaclawd/raw/main/skills/mega-clawd-8004/SKILL.md

# x402 payments
openclaw skill install https://github.com/megaclawd/megaclawd/raw/main/skills/mega-clawd-x402/SKILL.md

# x402guard security
openclaw skill install https://github.com/megaclawd/megaclawd/raw/main/skills/mega-clawd-x402guard/SKILL.md
```

## How x402 Payments Work

```
Client                     MEGA CLAWD
  |                            |
  |--- POST /x402/task ------->|
  |<-- 402 + requirements -----|
  |                            |
  |  [sign USDC via EIP-3009]  |
  |                            |
  |--- POST /x402/task ------->|
  |    + X-PAYMENT header      |
  |<-- 200 + result -----------|
```

Payments are gasless USDC on Base via EIP-3009 `transferWithAuthorization`.

## Project Structure

```
MegaClawdAgent/
├── contracts/              # Solidity smart contracts (Foundry)
│   └── src/
│       ├── MegaClawdToken.sol
│       ├── MegaClawdVault.sol
│       ├── X402PaymentReceiver.sol
│       └── interfaces/
├── scripts/                # Setup & deployment scripts
│   ├── setup-wallet.ts
│   ├── register-8004.ts
│   └── deploy-token.ts
├── skills/                 # OpenClaw skill definitions
│   ├── mega-clawd-blockchain/
│   ├── mega-clawd-8004/
│   ├── mega-clawd-x402/
│   └── mega-clawd-x402guard/
├── src/
│   ├── agent/              # Agent core
│   │   ├── index.ts        # Entry point
│   │   ├── config.ts       # Configuration
│   │   ├── wallet.ts       # Wallet manager
│   │   ├── erc8004.ts      # ERC-8004 client
│   │   ├── x402.ts         # x402 payment client
│   │   ├── x402guard.ts    # x402guard security auditor
│   │   ├── clanker.ts      # Clanker token launcher
│   │   ├── openclaw.ts     # OpenClaw gateway
│   │   └── server.ts       # API server
│   ├── app/                # Next.js frontend
│   └── components/         # React components
└── .env.example
```

## Key Links

- **$MEGACLAWD Token**: [BaseScan](https://basescan.org/token/0x1da14047c57e54f1097ae1ae314093a3c8490b07) | [Uniswap](https://app.uniswap.org/swap?chain=base&outputCurrency=0x1da14047c57e54f1097ae1ae314093a3c8490b07) | [Clanker](https://clanker.world/clanker/0x1da14047c57e54f1097ae1ae314093a3c8490b07)
- **Moltbook**: https://moltbook.com/u/MEGA-CLAWD
- **ERC-8004**: https://eips.ethereum.org/EIPS/eip-8004
- **x402 Protocol**: https://x402.org
- **x402guard**: https://x402guard.xyz
- **Clanker**: https://clanker.world
- **OpenClaw**: https://openclaw.ai
- **ERC-8004 Explorer**: https://8004scan.com
- **Base L2**: https://base.org

## Inspired By

[clawdbotatg](https://github.com/clawdbotatg) - The OG AI agent building autonomously onchain.

---

**MEGA CLAWD** - Building the future of the agent economy, one transaction at a time.
