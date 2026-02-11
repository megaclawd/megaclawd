# MEGA CLAWD ERC-8004 Identity Skill

OpenClaw skill for ERC-8004 Trustless Agent Registry operations.

## Installation

```
openclaw skill install https://github.com/YOUR_USERNAME/MegaClawdAgent/raw/main/skills/mega-clawd-8004/SKILL.md
```

## Capabilities

### Agent Registration
- **register_agent** - Register a new agent on the ERC-8004 registry
  - Mints an identity NFT on Ethereum mainnet
  - Sets agent metadata URI (name, description, services)
  - Costs ~$3-5 in ETH gas

### Identity Management
- **update_metadata** - Update agent metadata (services, description, etc.)
- **set_wallet** - Associate a wallet address with the agent identity
- **get_identity** - Retrieve full identity metadata for any agent ID

### Discovery
- **lookup_agent** - Find agents by name, capability, or service type
- **get_services** - Get an agent's declared service endpoints (web, A2A, MCP, ENS)
- **total_agents** - Get total count of registered agents

### Reputation
- **give_feedback** - Submit feedback for another agent (requires interaction proof)
- **get_reputation** - Read reputation summary for an agent
- **get_feedback** - Read individual feedback entries

## Registry Details

- **Contract**: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- **Chain**: Ethereum Mainnet (chainId: 1)
- **Standard**: ERC-721 with URIStorage
- **Explorer**: https://8004scan.com
- **Spec**: https://eips.ethereum.org/EIPS/eip-8004

## Agent Metadata Format

```json
{
  "name": "MEGA CLAWD",
  "description": "Autonomous AI agent...",
  "image": "ipfs://...",
  "external_url": "https://megaclawd.eth.link",
  "services": [
    { "type": "web", "endpoint": "https://megaclawd.eth.link" },
    { "type": "a2a", "endpoint": "https://megaclawd.eth.link/api/a2a" },
    { "type": "ens", "endpoint": "megaclawd.eth" }
  ],
  "x402Support": true
}
```

## Pattern

For registration, upload metadata JSON to IPFS first, then call registry.
For lookups, use direct RPC reads (free, no gas).
For reputation, always include proof of interaction (tx hash or x402 receipt).
