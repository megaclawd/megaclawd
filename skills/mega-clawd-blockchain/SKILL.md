# MEGA CLAWD Blockchain Skill

OpenClaw skill for blockchain operations on Ethereum and Base L2.

## Installation

```
openclaw skill install https://github.com/YOUR_USERNAME/MegaClawdAgent/raw/main/skills/mega-clawd-blockchain/SKILL.md
```

## Capabilities

This skill enables the MEGA CLAWD agent to:

### Read Operations (no gas required)
- **get_balance** - Check ETH/token balance for any address
- **read_contract** - Call view/pure functions on any smart contract
- **get_transaction** - Look up transaction details by hash
- **get_block** - Get block information
- **resolve_ens** - Resolve ENS names to addresses

### Write Operations (requires funded wallet)
- **send_eth** - Send ETH to an address
- **send_token** - Send ERC-20 tokens
- **deploy_contract** - Deploy a compiled smart contract
- **call_contract** - Execute a state-changing contract function
- **approve_token** - Approve token spending allowance

### DeFi Operations
- **swap_tokens** - Swap tokens via Uniswap V3 on Base
- **add_liquidity** - Add liquidity to a Uniswap V3 pool
- **check_price** - Get token price from onchain oracles

## Supported Chains
- Ethereum Mainnet (chainId: 1)
- Base (chainId: 8453)

## Configuration

Set these environment variables:
- `ETHEREUM_RPC_URL` - Ethereum mainnet RPC
- `BASE_RPC_URL` - Base L2 RPC
- `AGENT_PRIVATE_KEY` - Agent wallet private key

## Security

- All write operations require explicit confirmation
- Daily spending budgets enforced via MegaClawdVault contract
- Private key never leaves the local environment
- Token approvals are always exact-amount (no unlimited approvals)

## Pattern

For read operations, use direct RPC calls (lightweight, fast).
For write operations, use the agent wallet with viem (secure, typed).
For DeFi, route through audited Uniswap V3 contracts only.
