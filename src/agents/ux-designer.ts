/**
 * UXDesignerAgent - Lisa Park
 * 12 years of experience in User Experience Design
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - User research and personas
 * - Wireframes and prototypes
 * - Design systems and component libraries
 * - Usability testing
 * - Information architecture
 * - Visual design (colors, typography, layouts)
 * 
 * ❌ DO NOT DO:
 * - Write code (Developers)
 * - Write business requirements (Product Manager)
 * - Write tests (QA)
 * - Setup infrastructure (DevOps)
 * - Security testing (Security Engineer)
 * - Mobile development (Mobile Developer)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole } from '../types/index.js';

export class UXDesignerAgent extends BaseAgent {
  constructor() {
    super(AgentRole.UX_DESIGNER);
  }

  protected getSystemPrompt(): string {
    return `You are **Lisa Park**, a Senior UX/UI Designer with 12 years of experience creating exceptional user experiences.

## Your Profile
- **Name**: Lisa Park
- **Experience**: 12 years in UX/UI Design
- **Expertise**: User Research, Wireframing, Prototyping, Design Systems, Usability Testing, Accessibility (a11y), Visual Design, Information Architecture

## Your Responsibilities
1. Conduct user research and create personas
2. Design wireframes and interactive prototypes
3. Create and maintain design systems
4. Conduct usability testing and A/B testing
5. Collaborate with developers to ensure design implementation
6. Ensure accessibility compliance (WCAG 2.1 AA)
7. Define interaction patterns and micro-interactions
8. Create high-fidelity mockups

## Your Work Style
- User-centered design advocate
- Data-informed (uses analytics and user feedback)
- Design system thinking
- Mobile-first approach
- Iterative design process
- Collaborative with developers

## Technical Expertise

### Design Tools
- Figma (primary), Sketch, Adobe XD
- Principle, Framer for prototypes
- Photoshop, Illustrator for assets
- Hotjar, Maze for user testing

### Design Systems
- Component libraries
- Design tokens (colors, typography, spacing)
- Icon systems
- Animation guidelines
- Documentation

### User Research Methods
- User interviews
- Surveys
- Card sorting
- Tree testing
- Heatmaps and analytics
- A/B testing

### Accessibility (WCAG 2.1 AA)
- Color contrast ratios
- Focus indicators
- Screen reader compatibility
- Keyboard navigation
- Touch target sizes

## Design Deliverables

### Phase 1: Discovery
1. User personas
2. User journey maps
3. Competitive analysis
4. Information architecture

### Phase 2: Design
1. Sitemap
2. Wireframes (low-fidelity)
3. Prototypes (interactive)
4. High-fidelity mockups
5. Design system components

### Phase 3: Validation
1. Usability test plans
2. Test findings
3. Iteration recommendations
4. Handoff documentation

## Communication Style
- Visual communicator - shares designs, prototypes, user flows
- User research findings with data
- Design rationale and trade-offs
- Collaborative feedback sessions
- Design critiques
- Developer-friendly handoffs

Remember: You have 12 years of experience. You know that great design is invisible - users should accomplish their goals effortlessly. You bridge the gap between user needs and business goals.`;
  }

  /**
   * Conduct user research
   */
  async conductUserResearch(
    feature: string,
    researchMethods: string[] = ['interviews', 'surveys']
  ): Promise<{
    personas: Array<{
      name: string;
      demographics: string;
      goals: string[];
      painPoints: string[];
      behaviors: string[];
    }>;
    journeyMap: string;
    insights: string[];
  }> {
    const result = await this.execute(`
      Conduct user research for: ${feature}
      
      Research methods: ${researchMethods.join(', ')}
      
      Deliverables:
      1. User personas (2-3 primary personas)
      2. User journey map
      3. Key insights and findings
      4. Recommendations
    `);

    return {
      personas: [],
      journeyMap: result.data as string,
      insights: [],
    };
  }

  /**
   * Create wireframes
   */
  async createWireframes(
    page: string,
    requirements: string,
    platform: 'web' | 'mobile' | 'both' = 'web'
  ): Promise<{
    wireframeDescription: string;
    componentList: string[];
    userFlows: string[];
    accessibilityNotes: string[];
  }> {
    const result = await this.execute(`
      Create wireframes for: ${page}
      
      Requirements:
      ${requirements}
      
      Platform: ${platform}
      
      Provide:
      1. Wireframe description (ASCII or structured)
      2. Component list
      3. User flows
      4. Accessibility notes
    `);

    return {
      wireframeDescription: result.data as string,
      componentList: [],
      userFlows: [],
      accessibilityNotes: [],
    };
  }

  /**
   * Design component system
   */
  async designComponentSystem(
    designSystem: string,
    brandGuidelines?: string
  ): Promise<{
    tokens: {
      colors: Record<string, string>;
      typography: Record<string, string>;
      spacing: Record<string, string>;
    };
    components: Array<{
      name: string;
      states: string[];
      props: string[];
    }>;
    usageGuidelines: string;
  }> {
    const result = await this.execute(`
      Design a component system for: ${designSystem}
      
      ${brandGuidelines ? `Brand Guidelines: ${brandGuidelines}` : ''}
      
      Include:
      1. Design tokens (colors, typography, spacing)
      2. Component library
      3. Usage guidelines
      4. Accessibility requirements
    `);

    return {
      tokens: {
        colors: {},
        typography: {},
        spacing: {},
      },
      components: [],
      usageGuidelines: result.data as string,
    };
  }

  /**
   * Create prototype
   */
  async createPrototype(
    feature: string,
    interactionFlow: string
  ): Promise<{
    prototypeSpec: string;
    screens: string[];
    interactions: string[];
    microAnimations: string[];
  }> {
    const result = await this.execute(`
      Design a prototype for: ${feature}
      
      Interaction flow:
      ${interactionFlow}
      
      Include:
      1. Screen specifications
      2. User interactions
      3. Micro-animations
      4. Transitions
    `);

    return {
      prototypeSpec: result.data as string,
      screens: [],
      interactions: [],
      microAnimations: [],
    };
  }

  /**
   * Usability testing plan
   */
  async createUsabilityTestPlan(
    feature: string,
    testType: 'moderated' | 'unmoderated' = 'unmoderated'
  ): Promise<{
    testPlan: string;
    tasks: Array<{
      id: string;
      description: string;
      successCriteria: string;
    }>;
    metrics: string[];
    participantCount: number;
  }> {
    const result = await this.execute(`
      Create a usability test plan for: ${feature}
      
      Test type: ${testType}
      
      Include:
      1. Test objectives
      2. Task scenarios
      3. Success metrics
      4. Participant criteria
      5. Discussion guide
    `);

    return {
      testPlan: result.data as string,
      tasks: [],
      metrics: [],
      participantCount: 5,
    };
  }
}
