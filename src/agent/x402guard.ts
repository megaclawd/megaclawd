import { X402Client } from "./x402.js";
import { AGENT_CONFIG } from "./config.js";

// ============================================
// MEGA CLAWD - x402guard Skill Security Auditor
// Pre-installation vulnerability detection for AI agent skills
// https://x402guard.xyz
// ============================================

export type AuditTier = "quick" | "standard" | "deep";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AuditResult {
  risk_score: number;
  risk_level: RiskLevel;
  recommendation: "SAFE" | "CAUTION" | "UNSAFE";
  findings: {
    malware: string[];
    permissions: string[];
    network: string[];
    obfuscation: string[];
    data_exfiltration: string[];
  };
  audit_id: string;
  timestamp: string;
  tier: AuditTier;
  attestation?: string; // Signed attestation (deep tier only)
}

export interface AuditRequest {
  skill_url?: string;
  skill_content?: string;
}

const TIER_PRICES: Record<AuditTier, string> = {
  quick: "0.01",
  standard: "0.05",
  deep: "0.10",
};

const X402GUARD_BASE_URL = "https://x402guard.xyz";

export class X402GuardClient {
  private x402: X402Client;

  constructor(x402Client: X402Client) {
    this.x402 = x402Client;
  }

  /**
   * Audit a skill before installation
   * Uses x402 payment protocol - pays USDC per scan
   */
  async auditSkill(
    request: AuditRequest,
    tier: AuditTier = "standard"
  ): Promise<AuditResult> {
    const url = `${X402GUARD_BASE_URL}/audit/${tier}`;

    console.log(`[MEGA CLAWD x402guard] Auditing skill (${tier} tier, $${TIER_PRICES[tier]} USDC)...`);

    if (request.skill_url) {
      console.log(`[MEGA CLAWD x402guard] Skill URL: ${request.skill_url}`);
    }

    // x402 client handles the 402 payment flow automatically
    const response = await this.x402.fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`x402guard audit failed: ${response.status} ${response.statusText}`);
    }

    const result: AuditResult = await response.json();

    console.log(`[MEGA CLAWD x402guard] Risk Score: ${result.risk_score}/100 (${result.risk_level})`);
    console.log(`[MEGA CLAWD x402guard] Recommendation: ${result.recommendation}`);

    if (result.findings.malware.length > 0) {
      console.warn(`[MEGA CLAWD x402guard] MALWARE DETECTED:`, result.findings.malware);
    }
    if (result.findings.data_exfiltration.length > 0) {
      console.warn(`[MEGA CLAWD x402guard] DATA EXFILTRATION:`, result.findings.data_exfiltration);
    }

    return result;
  }

  /**
   * Quick scan - YARA scan, risk score, basic recommendation ($0.01)
   */
  async quickScan(request: AuditRequest): Promise<AuditResult> {
    return this.auditSkill(request, "quick");
  }

  /**
   * Standard scan - + permission analysis, network detection ($0.05)
   */
  async standardScan(request: AuditRequest): Promise<AuditResult> {
    return this.auditSkill(request, "standard");
  }

  /**
   * Deep scan - + behavioral sandbox, signed attestation ($0.10)
   */
  async deepScan(request: AuditRequest): Promise<AuditResult> {
    return this.auditSkill(request, "deep");
  }

  /**
   * Audit a skill and decide whether to install it
   * Returns true if safe to install, false if risky
   */
  async shouldInstallSkill(
    skillUrl: string,
    maxRiskScore: number = 50
  ): Promise<{ safe: boolean; result: AuditResult }> {
    const result = await this.standardScan({ skill_url: skillUrl });

    const safe = result.risk_score <= maxRiskScore && result.recommendation !== "UNSAFE";

    if (!safe) {
      console.warn(
        `[MEGA CLAWD x402guard] Skill BLOCKED - risk score ${result.risk_score} exceeds threshold ${maxRiskScore}`
      );
    } else {
      console.log(`[MEGA CLAWD x402guard] Skill APPROVED for installation`);
    }

    return { safe, result };
  }
}
