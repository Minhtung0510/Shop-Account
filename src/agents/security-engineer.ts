/**
 * SecurityEngineerAgent - Alex Thompson
 * 10 years of experience in Application Security
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - Security architecture review
 * - Penetration testing
 * - Security code review (focus: vulnerabilities)
 * - Vulnerability assessment
 * - Compliance auditing (SOC2, GDPR, etc.)
 * - Security training
 * 
 * ❌ DO NOT DO:
 * - Write application code (Developers)
 * - Write business requirements (Product Manager)
 * - Design UI/UX (UX Designer)
 * - Write tests (QA)
 * - Setup infrastructure (DevOps)
 * - Deploy applications (DevOps)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole } from '../types/index.js';

export class SecurityEngineerAgent extends BaseAgent {
  constructor() {
    super(AgentRole.SECURITY_ENGINEER);
  }

  protected getSystemPrompt(): string {
    return `You are **Alex Thompson**, a Senior Security Engineer with 10 years of experience in application security and penetration testing.

## Your Profile
- **Name**: Alex Thompson
- **Experience**: 10 years in Security Engineering
- **Expertise**: Penetration Testing, Security Architecture, OWASP Top 10, CVE Analysis, Threat Modeling, Cryptography, SIEM, Security Auditing, Incident Response

## Your Responsibilities
1. Review security architecture and designs
2. Conduct penetration testing and vulnerability assessments
3. Perform security code reviews
4. Assess and remediate vulnerabilities
5. Provide security training to developers
6. Respond to security incidents
7. Ensure compliance (SOC2, GDPR, HIPAA, PCI-DSS)
8. Define security requirements for features

## Your Work Style
- Security-first mindset
- "Attacker's perspective" advocate
- Continuous learner (new threats daily)
- Documentation thorough
- Zero-trust proponent
- Defense in depth thinker

## OWASP Top 10 (2021)

1. **A01:2021 - Broken Access Control**
   - IDOR, privilege escalation, CORS misconfiguration
2. **A02:2021 - Cryptographic Failures**
   - Sensitive data exposure, weak encryption
3. **A03:2021 - Injection**
   - SQL, NoSQL, OS, LDAP, XSS
4. **A04:2021 - Insecure Design**
   - Missing rate limiting, business logic flaws
5. **A05:2021 - Security Misconfiguration**
   - Default creds, error handling, open cloud storage
6. **A06:2021 - Vulnerable Components**
   - Outdated dependencies, untrusted packages
7. **A07:2021 - Authentication Failures**
   - Credential stuffing, session management
8. **A08:2021 - Software and Data Integrity Failures**
   - CI/CD without validation, unsafe deserialization
9. **A09:2021 - Security Logging Failures**
   - Insufficient logging, delayed response
10. **A10:2021 - SSRF**
    - Server-side request forgery

## Security Testing Types

### SAST (Static Analysis)
- Code review tools: SonarQube, Snyk, Checkmarx
- Prevents: SQL injection, XSS, hardcoded secrets

### DAST (Dynamic Analysis)
- Runtime testing: OWASP ZAP, Burp Suite
- Finds: Runtime vulnerabilities, API issues

### IAST (Interactive)
- Hybrid approach during runtime

### SCA (Software Composition Analysis)
- Dependency vulnerability scanning
- License compliance

## Security Checklist

### Authentication
- [ ] Password hashing (bcrypt/argon2)
- [ ] MFA implementation
- [ ] Session timeout
- [ ] Account lockout
- [ ] Secure password reset

### Authorization
- [ ] Role-based access control
- [ ] Principle of least privilege
- [ ] Resource-level permissions
- [ ] Audit logging

### Data Protection
- [ ] Encryption at rest
- [ ] Encryption in transit (TLS 1.3)
- [ ] Key management
- [ ] Data masking
- [ ] Secure deletion

### Input Validation
- [ ] Server-side validation
- [ ] Parameterized queries
- [ ] Content Security Policy
- [ ] Output encoding

## Communication Style
- Security reports with severity ratings (Critical/High/Medium/Low)
- Risk assessments with likelihood and impact
- Remediation guidance with code examples
- "What could go wrong" scenarios
- Security training and awareness

Remember: You have 10 years of experience. You know that security is not a feature you add at the end - it's a mindset that must be baked in from the start. The best security is invisible to users but solid as bedrock.`;
  }

  /**
   * Security architecture review
   */
  async reviewSecurityArchitecture(
    architecture: string,
    complianceRequirements?: string[]
  ): Promise<{
    securityAssessment: string;
    threats: Array<{
      threat: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      mitigations: string[];
    }>;
    complianceGaps: string[];
    recommendations: string[];
  }> {
    const result = await this.execute(`
      Review security architecture:
      
      Architecture:
      ${architecture}
      
      ${complianceRequirements ? `Compliance requirements: ${complianceRequirements.join(', ')}` : ''}
      
      Assess:
      1. Overall security posture
      2. Potential threats (using STRIDE or similar framework)
      3. Compliance gaps
      4. Recommendations
    `);

    return {
      securityAssessment: result.data as string,
      threats: [],
      complianceGaps: [],
      recommendations: [],
    };
  }

  /**
   * Conduct penetration test
   */
  async conductPenetrationTest(
    target: string,
    scope: string[],
    testType: 'blackbox' | 'greybox' | 'whitebox' = 'blackbox'
  ): Promise<{
    executiveSummary: string;
    vulnerabilities: Array<{
      id: string;
      title: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      description: string;
      proofOfConcept: string;
      remediation: string;
    }>;
    riskRating: string;
    remediationTimeline: string;
  }> {
    const result = await this.execute(`
      Conduct ${testType} penetration test on:
      
      Target: ${target}
      Scope: ${scope.join(', ')}
      
      Perform tests for:
      1. Network vulnerabilities
      2. Application vulnerabilities (OWASP Top 10)
      3. Authentication weaknesses
      4. Business logic flaws
      
      Provide detailed findings with PoC.
    `);

    return {
      executiveSummary: result.data as string,
      vulnerabilities: [],
      riskRating: 'Medium',
      remediationTimeline: '',
    };
  }

  /**
   * Security code review
   */
  async reviewCodeSecurity(
    code: string,
    language: string,
    context?: string
  ): Promise<{
    findings: Array<{
      line?: number;
      issue: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      cwe: string;
      description: string;
      fix: string;
    }>;
    overallRating: string;
    securePatterns: string[];
  }> {
    const result = await this.execute(`
      Review this ${language} code for security issues:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      ${context ? `Context: ${context}` : ''}
      
      Check for:
      - Injection vulnerabilities
      - Authentication issues
      - Authorization flaws
      - Sensitive data exposure
      - Cryptographic weaknesses
      - XSS, CSRF, SSRF
      - Error handling leaks
      
      Provide findings with CWE codes and fixes.
    `);

    return {
      findings: [],
      overallRating: result.data as string,
      securePatterns: [],
    };
  }

  /**
   * Create threat model
   */
  async createThreatModel(
    application: string,
    architecture: string,
    trustBoundaries: string[]
  ): Promise<{
    dataFlowDiagram: string;
    trustBoundaries: string[];
    threats: Array<{
      asset: string;
      threat: string;
      threatAgent: string;
      attackVector: string;
      severity: string;
      countermeasures: string[];
    }>;
    riskMatrix: string;
  }> {
    const result = await this.execute(`
      Create a threat model for: ${application}
      
      Architecture overview:
      ${architecture}
      
      Trust boundaries:
      ${trustBoundaries.join('\n')}
      
      Use STRIDE or similar methodology:
      - Spoofing
      - Tampering
      - Repudiation
      - Information Disclosure
      - Denial of Service
      - Elevation of Privilege
    `);

    return {
      dataFlowDiagram: result.data as string,
      trustBoundaries: [],
      threats: [],
      riskMatrix: '',
    };
  }

  /**
   * Security requirements
   */
  async defineSecurityRequirements(
    feature: string,
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
  ): Promise<{
    requirements: Array<{
      id: string;
      requirement: string;
      priority: string;
      testingGuidance: string;
    }>;
    authenticationRequirements: string[];
    authorizationRequirements: string[];
    encryptionRequirements: string[];
    loggingRequirements: string[];
  }> {
    const result = await this.execute(`
      Define security requirements for: ${feature}
      
      Data classification: ${dataClassification}
      
      Include:
      1. Authentication requirements
      2. Authorization requirements
      3. Data protection requirements
      4. Logging and monitoring
      5. Compliance considerations
    `);

    return {
      requirements: [],
      authenticationRequirements: [],
      authorizationRequirements: [],
      encryptionRequirements: [],
      loggingRequirements: [],
    };
  }
}
