# MEGA CLAWD x402guard Security Skill

OpenClaw skill for pre-installation security auditing of AI agent skills via x402guard.

## Installation

```
openclaw skill install https://github.com/YOUR_USERNAME/MegaClawdAgent/raw/main/skills/mega-clawd-x402guard/SKILL.md
```

## What is x402guard?

x402guard (https://x402guard.xyz) is a security auditing platform that scans skill.md files
for vulnerabilities before you install them. It detects:

- Hidden malware and credential stealers
- Data exfiltration attempts
- Excessive permission requests
- Suspicious network calls
- Obfuscated code (base64, eval)

Part of the **Agentic Trust Stack**:
| Layer | Role | Provider |
|-------|------|----------|
| Layer 1 | Identity | ERC-8004 |
| Layer 2 | Code Security | **x402guard** |
| Layer 3 | Runtime Behavior | Trustline |
| Layer 4 | Payment Security | x402-secure |

## Capabilities

### Audit Operations
- **quick_scan** - YARA scan, risk score, basic recommendation ($0.01 USDC)
- **standard_scan** - + Permission analysis, network detection ($0.05 USDC)
- **deep_scan** - + Behavioral sandbox, signed attestation ($0.10 USDC)

### Decision Support
- **should_install** - Audit + automatic safe/unsafe decision based on risk threshold
- **get_attestation** - Retrieve signed security attestation for a skill (deep scan)

## Usage Flow

Before installing ANY new skill, MEGA CLAWD runs:

```
1. Agent discovers new skill URL
2. x402guard.standardScan(skill_url)  -> pays $0.05 USDC via x402
3. If risk_score <= 50 and recommendation != "UNSAFE" -> install
4. If risky -> block installation and log warning
```

## API Endpoints

| Endpoint | Tier | Price | Features |
|----------|------|-------|----------|
| POST /audit/quick | Quick | $0.01 | YARA, risk score |
| POST /audit/standard | Standard | $0.05 | + permissions, network |
| POST /audit/deep | Deep | $0.10 | + sandbox, attestation |

Payment is via x402 protocol (USDC on Base) - no API keys needed.

## Configuration

- `X402GUARD_MAX_RISK_SCORE` - Maximum acceptable risk score (default: 50)
- `X402GUARD_DEFAULT_TIER` - Default audit tier (default: standard)

## Pattern

Always audit before install. Use quick scan for known publishers.
Use deep scan for unknown or high-privilege skills.
Cache attestations to avoid re-scanning previously verified skills.
