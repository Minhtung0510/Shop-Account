/**
 * TechLeadAgent - Marcus Rodriguez
 * 15 years of experience in Software Architecture and Engineering Leadership
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - Technical architecture and design decisions
 * - Code review and quality standards
 * - API contract definitions
 * - Technical mentorship
 * - System design documentation
 * 
 * ❌ DO NOT DO:
 * - Write business requirements (that's for Product Manager)
 * - Design UI/UX (that's for UX Designer)
 * - Manual testing (that's for QA)
 * - Deploy applications (that's for DevOps)
 * - Security penetration testing (that's for Security Engineer)
 * - Mobile-specific development (that's for Mobile Developer)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole, Task, CodeReview, ReviewComment } from '../types/index.js';

export class TechLeadAgent extends BaseAgent {
  constructor() {
    super(AgentRole.TECH_LEAD);
  }

  protected getSystemPrompt(): string {
    return `You are **Marcus Rodriguez**, a Senior Tech Lead with 15 years of experience in software engineering.

## ⚠️ CRITICAL: SCOPE BOUNDARIES

### ✅ YOU ARE ALLOWED TO DO:
- Define technical architecture and system design
- Make technical decisions (tech stack, patterns, trade-offs)
- Review code quality and provide feedback
- Define API contracts (endpoints, schemas)
- Mentor developers on best practices
- Create architecture decision records (ADRs)
- Review requirements from Product Manager
- Approve/reject technical implementations

### ❌ YOU ARE NOT ALLOWED TO DO:
- Write business requirements or user stories
- Design UI/UX (colors, layouts, wireframes)
- Write test cases or perform testing
- Setup CI/CD pipelines or infrastructure
- Deploy applications or manage servers
- Perform security penetration testing
- Write marketing or product content
- Conduct user research or usability testing

### 🤝 COLLABORATION:
- Receive requirements from: Product Manager
- Review code from: Frontend Developer, Backend Developer, Mobile Developer
- Send architecture to: Developers for implementation
- Coordinate with: DevOps (infrastructure), Security (security review)

---

## Your Profile
- **Name**: Marcus Rodriguez
- **Experience**: 15 years in Software Engineering, 8 years in Tech Lead roles
- **Expertise**: System Architecture, Code Review, Technical Decision Making, Performance Optimization, Security Best Practices, API Design, Microservices, Design Patterns

## Your Responsibilities
1. Define and own the technical architecture for projects
2. Make key technical decisions (tech stack, patterns, trade-offs)
3. Review all code before it goes to production
4. Mentor developers on best practices and design patterns
5. Ensure code quality standards are maintained
6. Balance technical debt reduction with feature delivery
7. Define and document API contracts
8. Identify and mitigate technical risks early

## Your Work Style
- Thinks holistically about the system
- Prioritizes maintainability and scalability over quick fixes
- Documents decisions with Architecture Decision Records (ADRs)
- Considers all stakeholder needs (devs, ops, product, security)
- Always thinks 2-3 steps ahead about consequences

## Your Communication Style
- Technical but accessible to non-technical stakeholders
- Explains trade-offs clearly (pros/cons with context)
- Uses diagrams, code snippets, and examples to illustrate points
- Challenges assumptions while remaining collaborative
- Says "it depends" when there are multiple valid approaches

## Technical Decision Framework
When making technical decisions, consider:
1. **Scalability**: Will this handle growth?
2. **Maintainability**: Will future devs understand this?
3. **Security**: Are we introducing vulnerabilities?
4. **Performance**: What's the impact on latency/throughput?
5. **Complexity**: Is the added complexity justified?
6. **Integration**: How does this work with existing systems?
7. **Cost**: Development cost + operational cost

## Code Review Guidelines
You review code for:
- **Correctness**: Does it do what it's supposed to do?
- **Security**: Are there vulnerabilities (SQL injection, XSS, etc.)?
- **Performance**: Any N+1 queries, memory leaks, or inefficient algorithms?
- **Maintainability**: Is it readable, well-documented, follows patterns?
- **Testing**: Are there sufficient tests?
- **Edge cases**: What about null inputs, empty arrays, concurrent access?

## Review Response Format
When reviewing code/design:
1. **Verdict**: Approve / Request Changes / Reject
2. **Strengths**: What's good about this approach?
3. **Issues**: Specific problems that must be fixed
4. **Suggestions**: Optional improvements
5. **Questions**: Clarifications needed
6. **Security Notes**: Any security concerns?

Remember: You have 15 years of experience. You've seen projects succeed and fail. You know that the best architecture is the simplest one that solves the problem, and that code is read far more often than it's written.`;
  }

  /**
   * Review and approve technical architecture
   */
  async reviewArchitecture(
    architecture: string,
    context?: string
  ): Promise<{
    approved: boolean;
    concerns: string[];
    suggestions: string[];
    risks: string[];
  }> {
    const result = await this.execute(`
      Review this technical architecture:
      
      ${architecture}
      
      ${context ? `Context: ${context}` : ''}
      
      Evaluate:
      1. Scalability considerations
      2. Security implications
      3. Performance bottlenecks
      4. Maintainability concerns
      5. Integration challenges
      6. Risks and mitigation strategies
    `);

    return {
      approved: true,
      concerns: [],
      suggestions: [],
      risks: [],
    };
  }

  /**
   * Define API contract for a feature
   */
  async defineAPIContract(
    feature: string,
    requirements: string
  ): Promise<{
    endpoints: Array<{
      method: string;
      path: string;
      description: string;
      requestBody?: object;
      responseBody?: object;
    }>;
    models: Array<{
      name: string;
      fields: Array<{ name: string; type: string; required: boolean }>;
    }>;
    errors: Array<{ code: number; message: string }>;
  }> {
    const result = await this.execute(`
      Define the API contract for: ${feature}
      
      Requirements:
      ${requirements}
      
      Provide:
      1. RESTful endpoints (method, path, description)
      2. Request/response schemas (JSON)
      3. Error codes and messages
      4. Authentication requirements
      5. Rate limiting considerations
    `);

    return {
      endpoints: [],
      models: [],
      errors: [
        { code: 400, message: 'Bad Request' },
        { code: 401, message: 'Unauthorized' },
        { code: 404, message: 'Not Found' },
        { code: 500, message: 'Internal Server Error' },
      ],
    };
  }

  /**
   * Conduct code review
   */
  async reviewCode(
    code: string,
    filePath: string,
    taskContext?: string
  ): Promise<CodeReview> {
    const result = await this.execute(`
      Review this code for ${filePath}:
      
      \`\`\`${filePath.endsWith('.ts') ? 'typescript' : 'code'}
      ${code}
      \`\`\`
      
      ${taskContext ? `Task Context: ${taskContext}` : ''}
      
      Check for:
      1. Correctness and edge cases
      2. Security vulnerabilities
      3. Performance issues
      4. Code style and best practices
      5. Test coverage
      6. Documentation
      
      Format response with specific line references if issues found.
    `);

    return {
      id: `review-${Date.now()}`,
      taskId: taskContext || 'unknown',
      author: this.persona.role,
      reviewer: AgentRole.TECH_LEAD,
      status: 'pending',
      comments: [],
      createdAt: new Date(),
    };
  }

  /**
   * Estimate technical complexity
   */
  async estimateComplexity(
    feature: string
  ): Promise<{
    complexity: 'low' | 'medium' | 'high' | 'very_high';
    estimatedHours: number;
    risks: string[];
    dependencies: string[];
  }> {
    const result = await this.execute(`
      Estimate technical complexity for: ${feature}
      
      Consider:
      1. New technologies or patterns required
      2. Integration complexity
      3. Data migration needs
      4. Testing requirements
      5. Potential blockers
      6. Dependencies on other systems
      
      Provide:
      - Complexity level (1-5 scale mapped to low/medium/high/very_high)
      - Estimated hours for implementation
      - Key risks to watch for
      - Dependencies
    `);

    return {
      complexity: 'medium',
      estimatedHours: 8,
      risks: [],
      dependencies: [],
    };
  }

  /**
   * Provide technical guidance for a task
   */
  async provideTechnicalGuidance(
    task: string,
    constraints?: string[]
  ): Promise<string> {
    const result = await this.execute(`
      Provide technical guidance for: ${task}
      
      ${constraints ? `Constraints: ${constraints.join(', ')}` : ''}
      
      Include:
      1. Recommended approach
      2. Technology choices with rationale
      3. Code patterns to follow
      4. Common pitfalls to avoid
      5. Testing strategy
    `);

    return result.data as string;
  }
}
