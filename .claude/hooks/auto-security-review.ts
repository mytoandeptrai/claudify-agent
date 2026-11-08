// .claude/hooks/auto-security-review.ts
// Stop hook — scans code Claude wrote this turn for security vulnerabilities

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import {
  readHookInput,
  loadCurrentTurn,
  writtenCode,
  stateDir,
  blockOrNotify,
  done,
} from "./lib/claude-hook.ts";

interface SecurityFinding {
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  description: string;
  location?: string;
  suggestion: string;
}

// Security settings live under "validation" in .claude/hooks.config.json
interface SecurityConfig {
  validation?: {
    enableSecurityReview?: boolean;
    securitySeverityThreshold?: "critical" | "high" | "medium" | "low";
    securityScanPatterns?: {
      hardcodedCredentials?: boolean;
      sqlInjection?: boolean;
      xss?: boolean;
      insecureCrypto?: boolean;
      pathTraversal?: boolean;
      commandInjection?: boolean;
    };
  };
}

// Security pattern definitions (OWASP Top 10 inspired)
const SECURITY_PATTERNS = {
  hardcodedCredentials: [
    {
      pattern: /(password|passwd|pwd)\s*[=:]\s*["'][^"']+["']/gi,
      type: "Hardcoded Password",
      severity: "critical" as const,
      suggestion: "Use environment variables or secure secret management (e.g., AWS Secrets Manager, Azure Key Vault)"
    },
    {
      pattern: /(api[_-]?key|apikey)\s*[=:]\s*["'][^"']+["']/gi,
      type: "Hardcoded API Key",
      severity: "critical" as const,
      suggestion: "Store API keys in environment variables or secure vault"
    },
    {
      pattern: /(secret|token|auth)\s*[=:]\s*["'][^"']+["']/gi,
      type: "Hardcoded Secret/Token",
      severity: "critical" as const,
      suggestion: "Use environment variables for secrets"
    },
    {
      pattern: /AWS[_A-Z]*KEY|AWS[_A-Z]*SECRET/gi,
      type: "AWS Credentials",
      severity: "critical" as const,
      suggestion: "Use IAM roles or AWS Secrets Manager"
    }
  ],
  sqlInjection: [
    {
      pattern: /(execute|query|raw)\s*\(\s*`[^`]*\$\{[^}]+\}/gi,
      type: "Potential SQL Injection",
      severity: "critical" as const,
      suggestion: "Use parameterized queries or ORM methods instead of string interpolation"
    },
    {
      pattern: /execute\s*\(\s*["'][^"']*["']\s*\+/gi,
      type: "SQL String Concatenation",
      severity: "critical" as const,
      suggestion: "Use parameterized queries"
    }
  ],
  xss: [
    {
      pattern: /dangerouslySetInnerHTML\s*=/gi,
      type: "Dangerous HTML Rendering",
      severity: "high" as const,
      suggestion: "Avoid dangerouslySetInnerHTML or sanitize input with DOMPurify"
    },
    {
      pattern: /innerHTML\s*=/gi,
      type: "Inner HTML Assignment",
      severity: "high" as const,
      suggestion: "Use textContent or sanitize HTML before assignment"
    },
    {
      pattern: /eval\s*\(/gi,
      type: "Eval Usage",
      severity: "high" as const,
      suggestion: "Avoid eval() - use safer alternatives"
    }
  ],
  insecureCrypto: [
    {
      pattern: /crypto\s*\.\s*createHash\s*\(\s*["']md5["']/gi,
      type: "Weak Hash Algorithm (MD5)",
      severity: "high" as const,
      suggestion: "Use SHA-256 or stronger (crypto.createHash('sha256'))"
    },
    {
      pattern: /crypto\s*\.\s*createHash\s*\(\s*["']sha1["']/gi,
      type: "Weak Hash Algorithm (SHA1)",
      severity: "medium" as const,
      suggestion: "Use SHA-256 or stronger for security-critical applications"
    },
    {
      pattern: /Math\.random\s*\(/gi,
      type: "Insecure Random Number Generator",
      severity: "medium" as const,
      suggestion: "Use crypto.randomBytes() for security-sensitive randomness"
    }
  ],
  pathTraversal: [
    {
      pattern: /fs\s*\.\s*(readFile|writeFile|appendFile)\s*\([^)]*\+/gi,
      type: "Potential Path Traversal",
      severity: "high" as const,
      suggestion: "Validate and sanitize file paths, use path.resolve() and path.normalize()"
    },
    {
      pattern: /require\s*\(\s*[^)]*\+/gi,
      type: "Dynamic Require with User Input",
      severity: "high" as const,
      suggestion: "Avoid dynamic require with user-controlled paths"
    }
  ],
  commandInjection: [
    {
      pattern: /exec\s*\(\s*`[^`]*\$\{[^}]+\}/gi,
      type: "Command Injection via Template Literal",
      severity: "critical" as const,
      suggestion: "Avoid shell commands with user input, use execFile with arguments array"
    },
    {
      pattern: /spawn\s*\(\s*[^)]*\+/gi,
      type: "Command Injection via String Concatenation",
      severity: "critical" as const,
      suggestion: "Use spawn with arguments array instead of string concatenation"
    },
    {
      pattern: /child_process\s*\.\s*exec\s*\(/gi,
      type: "Unsafe exec Usage",
      severity: "medium" as const,
      suggestion: "Prefer execFile or spawn with argument separation"
    }
  ]
};

const input = await readHookInput();

// Load configuration
const configPath = join(stateDir(input), 'hooks.config.json');
const config: SecurityConfig = existsSync(configPath) 
  ? JSON.parse(readFileSync(configPath, 'utf-8')) 
  : {};

const securityConfig = {
  enableSecurityReview: config.validation?.enableSecurityReview !== false,
  severityThreshold: config.validation?.securitySeverityThreshold || "high",
  scanPatterns: config.validation?.securityScanPatterns || {
    hardcodedCredentials: true,
    sqlInjection: true,
    xss: true,
    insecureCrypto: true,
    pathTraversal: true,
    commandInjection: true
  }
};

if (!securityConfig.enableSecurityReview) {
  console.error("[Security Review] ⚠ Security review disabled in config");
  done();
}

console.error("[Security Review] Running automatic security scan...");

const findings: SecurityFinding[] = [];

// Scan the code Claude wrote (Write/Edit/MultiEdit) in this turn
const turn = loadCurrentTurn(input.transcript_path);
const codeToScan = turn ? writtenCode(turn.toolUses) : [];

// Scan code for security issues
function scanCodeForSecurity(code: string, file: string, patternCategory: string): SecurityFinding[] {
  const categoryFindings: SecurityFinding[] = [];
  const patterns = SECURITY_PATTERNS[patternCategory as keyof typeof SECURITY_PATTERNS];
  
  if (!patterns || !securityConfig.scanPatterns[patternCategory as keyof typeof securityConfig.scanPatterns]) {
    return categoryFindings;
  }
  
  for (const { pattern, type, severity, suggestion } of patterns) {
    const matches = code.match(pattern);
    if (matches) {
      categoryFindings.push({
        severity,
        type,
        description: `Found ${matches.length} occurrence(s) of potentially insecure pattern`,
        location: file,
        suggestion
      });
    }
  }
  
  return categoryFindings;
}

// If no code was written, skip scan
if (codeToScan.length === 0) {
  console.error("[Security Review] ⚠ No code changes found to scan");
  done();
}

// Run security scans on each written chunk
const patternCategories = Object.keys(SECURITY_PATTERNS);
for (const { file, code } of codeToScan) {
  for (const category of patternCategories) {
    findings.push(...scanCodeForSecurity(code, file, category));
  }
}

// Filter by severity threshold
const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const thresholdLevel = severityOrder[securityConfig.severityThreshold];

const filteredFindings = findings.filter(
  finding => severityOrder[finding.severity] <= thresholdLevel
);

// Generate security report
const criticalCount = filteredFindings.filter(f => f.severity === "critical").length;
const highCount = filteredFindings.filter(f => f.severity === "high").length;
const mediumCount = filteredFindings.filter(f => f.severity === "medium").length;
const lowCount = filteredFindings.filter(f => f.severity === "low").length;

const reportPath = join(stateDir(input), 'security-report.md');

const securityReport = `## Security Scan Report

Generated: ${new Date().toISOString()}
Session: ${input.session_id}
Severity Threshold: ${securityConfig.severityThreshold}

## Summary

- 🔴 Critical: ${criticalCount}
- 🟠 High: ${highCount}
- 🟡 Medium: ${mediumCount}
- 🟢 Low: ${lowCount}
- **Total Findings**: ${filteredFindings.length}

## Findings

${filteredFindings.length === 0 ? '✅ No security issues found!' : filteredFindings.map((finding, i) => `
### ${i + 1}. ${finding.type}

**Severity**: ${finding.severity.toUpperCase()}

**File**: ${finding.location || 'unknown'}

**Description**: ${finding.description}

**Recommendation**: ${finding.suggestion}

---
`).join('\n')}

## Security Checklist (OWASP Top 10)

- [ ] All user input validated and sanitized
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (escaping/sanitization)
- [ ] Authentication/authorization verified
- [ ] No hardcoded credentials or secrets
- [ ] Error handling doesn't leak sensitive info
- [ ] Rate limiting on auth endpoints
- [ ] Secure random number generation used
- [ ] Strong cryptographic algorithms used
- [ ] File paths validated and normalized

## Next Steps

${criticalCount > 0 ? '🚨 CRITICAL issues found! Address immediately before deployment.' : 
  highCount > 0 ? '⚠️ HIGH severity issues found. Review and fix before production.' :
  mediumCount > 0 ? '📋 Medium severity issues found. Schedule for next sprint.' :
  lowCount > 0 ? '💡 Low severity issues found. Consider fixing for best practices.' :
  '✅ No security issues detected at current threshold.'}
`;

writeFileSync(reportPath, securityReport);
console.error(`[Security Review] Report saved to ${reportPath}`);

// Provide feedback to user
if (criticalCount > 0 || highCount > 0) {
  const summary = filteredFindings
    .filter(f => f.severity === "critical" || f.severity === "high")
    .map(f => `- [${f.severity.toUpperCase()}] ${f.type} in ${f.location}: ${f.suggestion}`)
    .join('\n');
  blockOrNotify(input, `🚨 Security scan found ${criticalCount} critical and ${highCount} high severity issues. Review and fix them (or confirm they are false positives). Full report: ${reportPath}\n\n${summary}`);
} else if (filteredFindings.length > 0) {
  console.error(`[Security Review] ⚠️ Found ${filteredFindings.length} security finding(s). Report saved.`);
  done();
} else {
  console.error("[Security Review] ✓ No security issues found");
  done();
}
