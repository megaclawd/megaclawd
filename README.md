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

MEGA CLAWD is an economically autonomous AI agent that can:
- Own a wallet and transact onchain (ETH, USDC, $MEGACLAWD)
- Register and maintain a verifiable identity via **ERC-8004**
- Send and receive payments using the **x402** HTTP payment protocol
- Extend capabilities through **OpenClaw** skills
- Serve paid APIs and interact with other agents (A2A protocol)
- Deploy smart contracts and build dApps on Base L2

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
| Identity | ERC-8004, ERC-721 |
| Agent Gateway | OpenClaw |
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

### 6. Deploy $MEGACLAWD token (optional)

```bash
npm run compile
npm run deploy-token
```

### 7. Start the agent

```bash
# Agent backend (API server + wallet + x402 + OpenClaw)
npm run agent

# Frontend dashboard
npm run dev
```

- Agent API: http://localhost:8402
- Dashboard: http://localhost:3000

## Smart Contracts

| Contract | Description | Chain |
|----------|------------|-------|
| `MegaClawdToken` | $MEGACLAWD ERC-20 token (1B supply) | Base |
| `MegaClawdVault` | Treasury with daily budgets | Base |
| `X402PaymentReceiver` | x402 payment processing | Base |

### Compile & Test

```bash
npm run compile
npm run test:contracts
```

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
openclaw skill install https://github.com/YOUR_USERNAME/MegaClawdAgent/raw/main/skills/mega-clawd-blockchain/SKILL.md

# ERC-8004 identity
openclaw skill install https://github.com/YOUR_USERNAME/MegaClawdAgent/raw/main/skills/mega-clawd-8004/SKILL.md

# x402 payments
openclaw skill install https://github.com/YOUR_USERNAME/MegaClawdAgent/raw/main/skills/mega-clawd-x402/SKILL.md
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
│   └── mega-clawd-x402/
├── src/
│   ├── agent/              # Agent core
│   │   ├── index.ts        # Entry point
│   │   ├── config.ts       # Configuration
│   │   ├── wallet.ts       # Wallet manager
│   │   ├── erc8004.ts      # ERC-8004 client
│   │   ├── x402.ts         # x402 payment client
│   │   ├── openclaw.ts     # OpenClaw gateway
│   │   └── server.ts       # API server
│   ├── app/                # Next.js frontend
│   └── components/         # React components
└── .env.example
```

## Key Links

- **ERC-8004**: https://eips.ethereum.org/EIPS/eip-8004
- **x402 Protocol**: https://x402.org
- **OpenClaw**: https://openclaw.ai
- **ERC-8004 Explorer**: https://8004scan.com
- **Base L2**: https://base.org

## Inspired By

[clawdbotatg](https://github.com/clawdbotatg) - The OG AI agent building autonomously onchain.

---

**MEGA CLAWD** - Building the future of the agent economy, one transaction at a time.
