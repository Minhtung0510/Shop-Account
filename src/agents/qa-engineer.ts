/**
 * QAEngineerAgent - Priya Sharma
 * 10 years of experience in Quality Assurance
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - Write test plans and test cases
 * - Write automated tests
 * - Perform exploratory testing
 * - Report and track bugs
 * - Verify bug fixes
 * - Performance testing
 * 
 * ❌ DO NOT DO:
 * - Write production code (Developers)
 * - Write business requirements (Product Manager)
 * - Design UI/UX (UX Designer)
 * - Setup infrastructure (DevOps)
 * - Security testing (Security Engineer)
 * - Deploy applications (DevOps)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole, Task, TaskStatus } from '../types/index.js';

export class QAEngineerAgent extends BaseAgent {
  constructor() {
    super(AgentRole.QA_ENGINEER);
  }

  protected getSystemPrompt(): string {
    return `You are **Priya Sharma**, a Senior QA Engineer with 10 years of experience in software testing and quality assurance.

## Your Profile
- **Name**: Priya Sharma
- **Experience**: 10 years in Quality Assurance Engineering
- **Expertise**: Test Automation, Manual Testing, Performance Testing, Security Testing, API Testing, Test Strategy, CI/CD Integration, Bug Tracking

## Your Responsibilities
1. Create comprehensive test plans and test cases
2. Automate regression tests to ensure quality
3. Perform exploratory testing for edge cases
4. Report and track bugs with clear reproduction steps
5. Verify bug fixes and ensure no regressions
6. Ensure adequate test coverage for all features
7. Conduct performance and load testing
8. Integrate testing into CI/CD pipelines

## Your Work Style
- Thorough - no stone left unturned
- Professional edge case finder
- Zero tolerance for "works on my machine" mentality
- Believes in "test until fear is gone"
- Prefers automation but knows when manual testing is needed
- Always thinks "what could possibly go wrong?"

## Testing Pyramid

- E2E Tests (Few, slow, expensive) - critical user journeys
- Integration Tests (Some, medium speed) - API contracts, DB interactions
- Unit Tests (Many, fast, cheap) - business logic, edge cases

## Technical Expertise

### Test Automation
- Playwright, Cypress, Selenium for E2E
- Jest, Vitest, Mocha for unit/integration
- REST Assured, Postman for API testing
- JUnit, pytest for backend testing
- React Testing Library for component testing

### API Testing
- Request/response validation
- Authentication flows
- Error handling
- Rate limiting
- Pagination
- File uploads/downloads

### Performance Testing
- k6, Gatling, JMeter for load testing
- Lighthouse for frontend performance
- Query performance analysis
- Memory leak detection

### Security Testing
- OWASP Top 10 vulnerabilities
- SQL injection testing
- XSS testing
- CSRF token validation
- Authentication bypass attempts

### Test Strategy
- Risk-based testing approach
- Boundary value analysis
- Equivalence partitioning
- State transition testing
- Error guessing

## Bug Reporting Format
Every bug report must include:
1. **Summary**: Clear, concise title
2. **Severity**: Critical / High / Medium / Low
3. **Priority**: P0 / P1 / P2 / P3
4. **Environment**: Browser, OS, device, version
5. **Steps to Reproduce**: Numbered, clear steps
6. **Expected Result**: What should happen
7. **Actual Result**: What actually happened
8. **Screenshots/Videos**: Visual evidence
9. **Logs**: Relevant error logs
10. **Reproducibility**: Always / Sometimes / Once

## Communication Style
- Detailed bug reports with steps to reproduce
- Loves checklists and test matrices
- QA metrics focused (coverage %, pass rate, MTTR)
- Provides test coverage reports
- Asks clarifying questions about acceptance criteria
- Celebrates when bugs are caught before production

Remember: You have 10 years of experience. You know that quality is everyone's responsibility, but QA is the last line of defense. You sleep well knowing thorough testing has been done. The best bug is the one that never reaches production.`;
  }

  /**
   * Create comprehensive test plan
   */
  async createTestPlan(
    feature: string,
    requirements: string
  ): Promise<{
    testPlan: string;
    testCases: Array<{
      id: string;
      title: string;
      steps: string[];
      expectedResult: string;
      priority: string;
    }>;
    riskAssessment: string;
  }> {
    const result = await this.execute(`
      Create a comprehensive test plan for: ${feature}
      
      Requirements:
      ${requirements}
      
      Include:
      1. Test scope and objectives
      2. Test types to perform (unit, integration, E2E, performance)
      3. Risk assessment
      4. Test environment requirements
      5. Test data requirements
      6. Detailed test cases with:
         - Test case ID
         - Title
         - Pre-conditions
         - Test steps
         - Expected results
         - Priority (P0-P3)
    `);

    return {
      testPlan: result.data as string,
      testCases: [],
      riskAssessment: '',
    };
  }

  /**
   * Automate test cases
   */
  async automateTests(
    testCases: string[],
    framework: 'playwright' | 'cypress' | 'jest' = 'playwright'
  ): Promise<{
    testCode: string;
    setupCode: string;
    pageObjects?: string;
  }> {
    const result = await this.execute(`
      Automate these test cases using ${framework}:
      
      ${testCases.map((tc, i) => `Test ${i + 1}: ${tc}`).join('\n')}
      
      Include:
      1. Test functions with proper assertions
      2. Page Object Model pattern
      3. Fixtures/test data
      4. Proper waits and retries
      5. Screenshots on failure
    `);

    return {
      testCode: result.data as string,
      setupCode: '',
    };
  }

  /**
   * Perform exploratory testing session
   */
  async planExploratorySession(
    feature: string,
    timeBoxMinutes: number = 60
  ): Promise<{
    charter: string;
    scenarios: string[];
    edgeCases: string[];
    areasOfFocus: string[];
  }> {
    const result = await this.execute(`
      Plan an exploratory testing session for: ${feature}
      
      Time box: ${timeBoxMinutes} minutes
      
      Create:
      1. Testing charter (mission statement)
      2. Test scenarios to explore
      3. Edge cases to investigate
      4. Areas of focus based on risk
      5. Bug reporting format for findings
    `);

    return {
      charter: result.data as string,
      scenarios: [],
      edgeCases: [],
      areasOfFocus: [],
    };
  }

  /**
   * Report a bug
   */
  async reportBug(
    bug: {
      summary: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      steps: string[];
      expected: string;
      actual: string;
      environment?: string;
    }
  ): Promise<{
    bugReport: string;
    jiraFormat?: string;
  }> {
    const result = await this.execute(`
      Create a detailed bug report:
      
      Summary: ${bug.summary}
      Severity: ${bug.severity}
      Steps to Reproduce:
      ${bug.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
      Expected: ${bug.expected}
      Actual: ${bug.actual}
      Environment: ${bug.environment || 'See environment section'}
      
      Include all required fields for a proper bug report.
    `);

    return {
      bugReport: result.data as string,
    };
  }

  /**
   * Review test coverage
   */
  async reviewTestCoverage(
    codebase: string,
    existingTests: string
  ): Promise<{
    coverageReport: string;
    gaps: string[];
    recommendations: string[];
  }> {
    const result = await this.execute(`
      Review test coverage for:
      
      Codebase overview:
      ${codebase}
      
      Existing tests:
      ${existingTests}
      
      Analyze:
      1. Current coverage percentage
      2. Missing test scenarios
      3. Edge cases not covered
      4. Integration points without tests
      5. Recommendations to improve coverage
    `);

    return {
      coverageReport: result.data as string,
      gaps: [],
      recommendations: [],
    };
  }

  /**
   * Perform API testing
   */
  async performAPITesting(
    endpoints: Array<{
      method: string;
      path: string;
      description: string;
    }>,
    auth?: string
  ): Promise<{
    testResults: Array<{
      endpoint: string;
      status: 'pass' | 'fail';
      issues: string[];
    }>;
    performanceMetrics?: string;
    securityFindings?: string[];
  }> {
    const result = await this.execute(`
      Perform comprehensive API testing on:
      
      ${endpoints.map(e => `${e.method} ${e.path} - ${e.description}`).join('\n')}
      
      ${auth ? `Authentication: ${auth}` : 'No authentication required'}
      
      Test scenarios:
      1. Happy path (valid inputs)
      2. Error handling (invalid inputs, missing fields)
      3. Authentication/authorization
      4. Rate limiting
      5. Edge cases (empty strings, max lengths, special characters)
      6. Performance (response times)
    `);

    return {
      testResults: [],
    };
  }
}
