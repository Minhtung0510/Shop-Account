/**
 * FrontendDeveloperAgent - Emily Watson
 * 12 years of experience in Frontend Development
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - Write frontend code (React, Vue, etc.)
 * - Create UI components and responsive layouts
 * - Implement state management
 * - Optimize frontend performance
 * - Accessibility implementation
 * - Component testing
 * 
 * ❌ DO NOT DO:
 * - Write business requirements (Product Manager)
 * - Design UI/UX (UX Designer)
 * - Write backend code (Backend Developer)
 * - Setup infrastructure (DevOps)
 * - Security testing (Security Engineer)
 * - Mobile native development (Mobile Developer)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole } from '../types/index.js';

export class FrontendDeveloperAgent extends BaseAgent {
  constructor() {
    super(AgentRole.FRONTEND_DEVELOPER);
  }

  protected getSystemPrompt(): string {
    return `You are **Emily Watson**, a Senior Frontend Developer with 12 years of experience building web applications.

## Your Profile
- **Name**: Emily Watson
- **Experience**: 12 years in Frontend Development
- **Expertise**: React/Next.js, TypeScript, CSS/Styling Systems, State Management, Performance Optimization, Accessibility (a11y), Responsive Design, Component Architecture

## Your Responsibilities
1. Implement UI components following design specs
2. Create responsive layouts that work across all devices
3. Optimize frontend performance (Core Web Vitals)
4. Ensure accessibility compliance (WCAG 2.1 AA)
5. Write unit and integration tests for components
6. Collaborate closely with UI/UX designers
7. Implement and manage client-side state
8. Integrate with backend APIs

## Your Work Style
- Pixel-perfect attention to detail
- Component-driven architecture advocate
- Accessibility-first mindset
- Performance-conscious (lazy loading, code splitting, memoization)
- Prefers functional components with hooks
- DRY principle follower

## Technical Expertise

### React/Next.js
- Server Components vs Client Components
- App Router and Pages Router
- getServerSideProps, getStaticProps, ISR
- Dynamic imports and code splitting
- Middleware for auth and redirects

### State Management
- React Context + useReducer for local state
- TanStack Query (React Query) for server state
- Zustand/Jotai for global client state
- URL state for shareable filters

### CSS/Styling
- CSS Modules, Styled Components, Tailwind CSS
- Design Systems (Storybook, design tokens)
- Responsive breakpoints: 320px, 768px, 1024px, 1440px
- Dark mode implementation

### Performance
- Lighthouse optimization (aim for 90+ scores)
- Image optimization (WebP, AVIF, lazy loading)
- Bundle size optimization
- Critical CSS inlining
- Service workers for offline support

### Accessibility (WCAG 2.1 AA)
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Color contrast ratios (4.5:1 for text)
- Screen reader testing
- Focus management

## Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Component documentation (JSDoc)
- Storybook stories for all components
- Minimum 80% test coverage for components

## Communication Style
- Visual communicator - shares screenshots/code previews
- Discusses UX trade-offs openly
- Provides estimated effort for frontend tasks
- Flags design inconsistencies early
- Writes self-documenting code with clear naming

Remember: You have 12 years of experience. You know that great UI is invisible - users should just be able to accomplish their goals without thinking about the interface. Accessibility is not optional; it's a fundamental requirement.`;
  }

  /**
   * Implement a UI component
   */
  async implementComponent(
    componentSpec: string,
    techStack: 'react' | 'vue' | 'svelte' = 'react'
  ): Promise<{
    componentCode: string;
    tests: string;
    documentation: string;
    accessibilityNotes: string[];
  }> {
    const result = await this.execute(`
      Implement a ${techStack} component based on this specification:
      
      ${componentSpec}
      
      Provide:
      1. Component code with TypeScript
      2. Unit tests
      3. Component documentation
      4. Accessibility notes (ARIA, keyboard nav)
      5. Usage examples
    `);

    return {
      componentCode: result.data as string,
      tests: '',
      documentation: '',
      accessibilityNotes: [],
    };
  }

  /**
   * Create responsive layout
   */
  async createResponsiveLayout(
    layoutSpec: string,
    breakpoints?: { mobile: number; tablet: number; desktop: number }
  ): Promise<{
    layoutCode: string;
    responsiveStyles: string;
    accessibilityNotes: string[];
  }> {
    const result = await this.execute(`
      Create a responsive layout based on:
      
      ${layoutSpec}
      
      Breakpoints: ${JSON.stringify(breakpoints || { mobile: 768, tablet: 1024, desktop: 1440 })}
      
      Include:
      1. Grid/Flexbox layout
      2. Responsive styles with media queries
      3. Mobile-first approach
      4. Accessibility considerations
    `);

    return {
      layoutCode: result.data as string,
      responsiveStyles: '',
      accessibilityNotes: [],
    };
  }

  /**
   * Optimize frontend performance
   */
  async optimizePerformance(
    currentIssues: string
  ): Promise<{
    recommendations: string[];
    codeChanges: string[];
    expectedImprovements: Record<string, string>;
  }> {
    const result = await this.execute(`
      Analyze and optimize for frontend performance issues:
      
      Current issues:
      ${currentIssues}
      
      Focus on:
      1. Core Web Vitals (LCP, FID, CLS)
      2. Bundle size reduction
      3. Image optimization
      4. Code splitting
      5. Caching strategies
    `);

    return {
      recommendations: [],
      codeChanges: [],
      expectedImprovements: {},
    };
  }

  /**
   * Implement state management
   */
  async implementStateManagement(
    feature: string,
    dataFlow: string
  ): Promise<{
    stateStructure: object;
    hooks: string[];
    apiIntegration: string;
  }> {
    const result = await this.execute(`
      Design and implement state management for: ${feature}
      
      Data flow:
      ${dataFlow}
      
      Consider:
      1. Local vs global state
      2. Server state vs client state
      3. Optimistic updates
      4. Error handling
      5. Loading states
    `);

    return {
      stateStructure: {},
      hooks: [],
      apiIntegration: '',
    };
  }

  /**
   * Create API integration
   */
  async createAPIIntegration(
    endpoint: string,
    dataStructure: string
  ): Promise<{
    apiClient: string;
    types: string[];
    errorHandling: string;
  }> {
    const result = await this.execute(`
      Create API integration for: ${endpoint}
      
      Data structure:
      ${dataStructure}
      
      Include:
      1. API client with fetch/axios
      2. TypeScript types
      3. Error handling
      4. Loading states
      5. Retry logic
    `);

    return {
      apiClient: result.data as string,
      types: [],
      errorHandling: '',
    };
  }
}
