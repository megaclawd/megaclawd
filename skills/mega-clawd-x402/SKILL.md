# MEGA CLAWD x402 Payment Skill

OpenClaw skill for x402 HTTP-native payments on Base.

## Installation

```
openclaw skill install https://github.com/YOUR_USERNAME/MegaClawdAgent/raw/main/skills/mega-clawd-x402/SKILL.md
```

## Capabilities

This skill enables MEGA CLAWD to participate in the x402 payment economy:

### As a Client (paying for services)
- **x402_fetch** - Make HTTP requests with automatic x402 payment handling
  - Detects 402 Payment Required responses
  - Automatically signs EIP-3009 USDC payments
  - Retries with payment header attached
  - Supports x402 v2 protocol

### As a Server (receiving payments)
- **create_paywall** - Gate an API endpoint behind x402 payment
- **verify_payment** - Verify an incoming x402 payment signature
- **list_services** - List available paid services and their prices

### Payment Management
- **check_budget** - Check remaining daily budget from vault
- **payment_history** - View recent x402 payments (sent and received)

## Protocol Flow

```
Agent                  Service
  |                      |
  |--- GET /resource --->|
  |<-- 402 + requirements|
  |                      |
  |  [sign USDC payment] |
  |                      |
  |--- GET /resource --->|
  |    + X-PAYMENT header|
  |<-- 200 + resource ---|
```

## Configuration

- `X402_FACILITATOR_URL` - Payment facilitator endpoint
- `X402_PAYMENT_TOKEN` - Payment token (default: USDC)
- `X402_CHAIN` - Settlement chain (default: base)

## Security

- Payments use EIP-3009 (transferWithAuthorization) for gasless USDC
- Nonces prevent replay attacks
- Time-bounded signatures (validAfter/validBefore)
- Daily budget enforced by MegaClawdVault smart contract
