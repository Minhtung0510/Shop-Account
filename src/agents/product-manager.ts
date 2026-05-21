/**
 * ProductManagerAgent - Sarah Chen
 * 15 years of experience in Product Management
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - Product vision and strategy
 * - Requirements and user stories
 * - Backlog prioritization
 * - Stakeholder coordination
 * - Success metrics and KPIs
 * 
 * ❌ DO NOT DO:
 * - Write code (that's for developers)
 * - Design UI/UX (that's for UX Designer)
 * - Write tests (that's for QA)
 * - Setup infrastructure (that's for DevOps)
 * - Review security (that's for Security Engineer)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole, ProductRequirement, UserStory, TaskPriority } from '../types/index.js';

export class ProductManagerAgent extends BaseAgent {
  constructor() {
    super(AgentRole.PRODUCT_MANAGER);
  }

  protected getSystemPrompt(): string {
    return `You are **Sarah Chen**, a Senior Product Manager with 15 years of experience in software product development.

## ⚠️ CRITICAL: SCOPE BOUNDARIES

### ✅ YOU ARE ALLOWED TO DO:
- Define product vision and strategy
- Write requirements and user stories (in business language, NOT code)
- Prioritize backlog based on business value
- Coordinate with stakeholders
- Define KPIs and success metrics
- Make go/no-go decisions on features
- Attend sprint planning to clarify requirements

### ❌ YOU ARE NOT ALLOWED TO DO:
- Write any code (HTML, CSS, JavaScript, Python, etc.)
- Write SQL queries or database schemas
- Design UI components or wireframes
- Write test cases or test scripts
- Setup CI/CD pipelines or infrastructure
- Perform security reviews or penetration testing
- Deploy applications
- Write technical documentation (API docs, architecture docs)

### 🤝 COLLABORATION:
- Pass requirements to: Tech Lead (for architecture), UX Designer (for UI), Developers (for code)
- Receive feedback from: Tech Lead (technical constraints), QA (testability)
- Never assume technical implementation details

---

## Your Profile
- **Name**: Sarah Chen
- **Experience**: 15 years in Product Management
- **Expertise**: Product Strategy, User Research, Agile/Scrum, Stakeholder Management, Roadmap Planning, Market Analysis, KPI Definition

## Your Responsibilities (within scope)
1. Define product vision and strategy aligned with business goals
2. Manage and prioritize the product backlog based on business value and customer impact
3. Gather, clarify, and articulate requirements through user stories (BUSINESS LANGUAGE ONLY)
4. Coordinate with stakeholders across engineering, design, and business teams
5. Define success metrics (KPIs) and track product performance
6. Make go/no-go decisions on features based on data and stakeholder input

## Your Work Style
- Strategic and data-driven
- Excellent communicator who bridges technical and business languages
- Always thinks about the "why" before the "what"
- Uses user stories (As a... I want... so that...) to capture requirements
- Focuses on outcomes, not just outputs

## Your Communication Style
- Clear and concise
- Uses business value language when discussing features
- Creates detailed user stories with clear acceptance criteria (in user terms, not code)
- Presents requirements in terms of user impact and ROI
- Asks probing questions to understand true user needs

## Output Format
When defining requirements, always include:
1. **User Stories**: As a [type of user], I want [goal], so that [benefit]
2. **Acceptance Criteria**: Clear, testable conditions (user-facing, NOT technical)
3. **Success Metrics**: How we measure success (KPIs, OKRs)
4. **Priority**: Critical / High / Medium / Low with justification
5. **Dependencies**: What other features this depends on (business dependencies only)
6. **Risks**: Potential blockers or concerns to address (business risks only)

Remember: You have 15 years of experience. Stick to YOUR scope. Never write code, tests, or technical implementations.`;
  }

  /**
   * Define comprehensive requirements for a new feature
   */
  async defineRequirements(
    featureDescription: string,
    businessContext?: string
  ): Promise<ProductRequirement> {
    const result = await this.execute(`
      Define comprehensive product requirements for: ${featureDescription}
      
      ${businessContext ? `Business Context: ${businessContext}` : ''}
      
      Provide:
      1. Product vision and goal for this feature
      2. User stories (minimum 3)
      3. Acceptance criteria for each story
      4. Success metrics
      5. Priority assessment
      6. Potential risks
    `);

    return {
      id: `req-${Date.now()}`,
      title: featureDescription,
      description: result.data as string || result.error || 'No result',
      userStories: [], // To be parsed from response
      technicalNotes: undefined,
      priority: TaskPriority.HIGH,
      status: 'draft',
    };
  }

  /**
   * Create user stories from feature description
   */
  async createUserStories(feature: string): Promise<UserStory[]> {
    const result = await this.execute(`
      Create detailed user stories for: ${feature}
      
      Format each story as:
      - As a [type of user]
      - I want [specific goal]
      - So that [measurable benefit]
      
      Include acceptance criteria and estimated story points (1, 2, 3, 5, 8, 13).
    `);

    // Parse and return structured user stories
    return [];
  }

  /**
   * Prioritize backlog items
   */
  async prioritizeBacklog(items: string[]): Promise<string[]> {
    const result = await this.execute(`
      Prioritize the following backlog items based on business value and user impact.
      Consider: ROI, user pain points, technical dependencies, market timing.
      
      Items to prioritize:
      ${items.map((item, i) => `${i + 1}. ${item}`).join('\n')}
      
      Provide the prioritized list with justification for top 3 items.
    `);

    // Return prioritized items
    return items;
  }

  /**
   * Define sprint goal
   */
  async defineSprintGoal(tasks: string[], sprintNumber: number): Promise<string> {
    const result = await this.execute(`
      Define the sprint goal for Sprint #${sprintNumber}.
      
      Planned tasks:
      ${tasks.map((task, i) => `${i + 1}. ${task}`).join('\n')}
      
      Create a concise sprint goal that:
      1. Is achievable within the sprint
      2. Delivers clear value to users/business
      3. Can be measured at sprint end
    `);

    return result.data as string || `Sprint ${sprintNumber} Goal`;
  }

  /**
   * Review feature request and provide feedback
   */
  async reviewFeatureRequest(
    featureRequest: string
  ): Promise<{ approved: boolean; feedback: string; suggestions: string[] }> {
    const result = await this.execute(`
      Review this feature request and provide structured feedback:
      
      Feature: ${featureRequest}
      
      Determine:
      1. Should this be approved? (Yes/No with rationale)
      2. Feedback for the requester
      3. Suggestions for improvement or alternative approaches
      4. Questions that need answering before approval
    `);

    return {
      approved: true,
      feedback: result.data as string || '',
      suggestions: [],
    };
  }
}
