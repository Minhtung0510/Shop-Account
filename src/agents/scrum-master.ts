/**
 * ScrumMasterAgent - David Martinez
 * 12 years of experience as Scrum Master and Agile Coach
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - Facilitate Agile ceremonies (Planning, Daily, Review, Retro)
 * - Remove team impediments
 * - Coach team on Agile practices
 * - Protect team from distractions
 * - Sprint metrics and reporting
 * - Retrospective facilitation
 * 
 * ❌ DO NOT DO:
 * - Write code (Developers)
 * - Write business requirements (Product Manager)
 * - Design UI/UX (UX Designer)
 * - Write tests (QA)
 * - Setup infrastructure (DevOps)
 * - Security testing (Security Engineer)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole } from '../types/index.js';

export class ScrumMasterAgent extends BaseAgent {
  constructor() {
    super(AgentRole.SCRUM_MASTER);
  }

  protected getSystemPrompt(): string {
    return `You are **David Martinez**, a Senior Scrum Master with 12 years of experience in Agile transformation and team coaching.

## Your Profile
- **Name**: David Martinez
- **Experience**: 12 years as Scrum Master / Agile Coach
- **Expertise**: Scrum, Kanban, SAFe, Agile Coaching, Team Dynamics, Conflict Resolution, Retrospective Facilitation, Sprint Planning, Stakeholder Management

## Your Responsibilities
1. Facilitate all Agile ceremonies (Planning, Daily Standup, Review, Retrospective)
2. Remove impediments and blockers for the team
3. Coach team members on Agile principles and practices
4. Protect the team from external distractions and scope creep
5. Foster a culture of continuous improvement
6. Track and improve sprint metrics
7. Facilitate sprint retrospectives and implement improvements
8. Build collaborative team dynamics

## Your Work Style
- Servant leader
- Facilitator, not decision maker
- Impediment resolver
- Team protector
- Metrics focused but people-oriented
- Continuous improvement advocate

## Agile Ceremonies

### Sprint Planning
- Help team understand sprint goal
- Ensure all items are clarified
- Facilitate estimation
- Ensure commitment is realistic

### Daily Standup
- Keep it short (15 min max)
- Focus on blockers
- Enable ad-hoc collaboration

### Sprint Review
- Demo completed work
- Gather stakeholder feedback
- Celebrate achievements

### Retrospective
- Create safe space for honest feedback
- Use various retrospective formats
- Drive actionable improvements
- Follow up on previous improvements

## Metrics and KPIs

### Team Metrics
- Velocity (story points per sprint)
- Sprint goal completion rate
- Lead time (idea to production)
- Cycle time (in progress to done)
- Burndown/burnup charts

### Quality Metrics
- Defect density
- Escaped defects
- Technical debt ratio

### Team Health
- Team satisfaction surveys
- Retrospective action completion
- Knowledge sharing

## Conflict Resolution

When conflicts arise:
1. Acknowledge the conflict openly
2. Understand each party's perspective
3. Focus on interests, not positions
4. Collaborate on solutions
5. Follow up to ensure resolution

## Communication Style
- Meeting facilitator - keeps discussions on track
- Question asker - helps team find answers
- Impediment tracker - surfaces and resolves blockers
- Metrics communicator - shares team health openly
- Improvement champion - drives continuous growth

Remember: You have 12 years of experience. You know that being a Scrum Master is about serving the team, not commanding them. Your job is to make the team more effective, not to be the hero. The best Scrum Masters make themselves unnecessary over time.`;
  }

  /**
   * Facilitate sprint planning
   */
  async facilitateSprintPlanning(
    backlogItems: string[],
    sprintCapacity: number,
    historicalVelocity?: number
  ): Promise<{
    meetingAgenda: string[];
    facilitationNotes: string[];
    commitmentRationale: string;
    potentialImpediments: string[];
  }> {
    const result = await this.execute(`
      Facilitate sprint planning for this sprint.
      
      Backlog items:
      ${backlogItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}
      
      Sprint capacity: ${sprintCapacity} points
      ${historicalVelocity ? `Historical velocity: ${historicalVelocity} points` : ''}
      
      Provide:
      1. Meeting agenda and timing
      2. Facilitation notes
      3. How to help team commit appropriately
      4. Potential impediments to watch for
    `);

    return {
      meetingAgenda: [],
      facilitationNotes: [],
      commitmentRationale: result.data as string,
      potentialImpediments: [],
    };
  }

  /**
   * Run daily standup
   */
  async runDailyStandup(
    teamMembers: string[],
    yesterdayProgress: Record<string, string>,
    todayPlans: Record<string, string>,
    blockers: Record<string, string[]>
  ): Promise<{
    standupSummary: string;
    impedimentsToResolve: string[];
    parkingLotItems: string[];
    followUpNeeded: string[];
  }> {
    const result = await this.execute(`
      Run daily standup with:
      
      Team members: ${teamMembers.join(', ')}
      
      Yesterday:
      ${Object.entries(yesterdayProgress).map(([name, work]) => `- ${name}: ${work}`).join('\n')}
      
      Today:
      ${Object.entries(todayPlans).map(([name, plan]) => `- ${name}: ${plan}`).join('\n')}
      
      Blockers:
      ${Object.entries(blockers).map(([name, block]) => `- ${name}: ${block.join(', ')}`).join('\n')}
      
      Summarize and identify what needs follow-up.
    `);

    return {
      standupSummary: result.data as string,
      impedimentsToResolve: [],
      parkingLotItems: [],
      followUpNeeded: [],
    };
  }

  /**
   * Facilitate retrospective
   */
  async facilitateRetrospective(
    sprintNumber: number,
    whatWentWell: string[],
    whatCouldBeImproved: string[],
    actionItemsFromLastRetro?: string[]
  ): Promise<{
    retrospectiveFormat: string;
    actionItems: Array<{
      description: string;
      owner: string;
      dueDate: string;
    }>;
    improvementPlan: string;
    teamHealthScore: number;
  }> {
    const result = await this.execute(`
      Facilitate Sprint #${sprintNumber} retrospective.
      
      What went well:
      ${whatWentWell.map(item => `- ${item}`).join('\n')}
      
      What could be improved:
      ${whatCouldBeImproved.map(item => `- ${item}`).join('\n')}
      
      ${actionItemsFromLastRetro ? `Previous action items to check:\n${actionItemsFromLastRetro.map(item => `- ${item}`).join('\n')}` : ''}
      
      Provide:
      1. Recommended retrospective format
      2. Action items with owners
      3. Improvement plan
      4. Team health assessment
    `);

    return {
      retrospectiveFormat: result.data as string,
      actionItems: [],
      improvementPlan: '',
      teamHealthScore: 7,
    };
  }

  /**
   * Analyze sprint metrics
   */
  async analyzeSprintMetrics(
    sprintData: {
      plannedPoints: number;
      completedPoints: number;
      sprintGoalAchievement: number;
      defectsFound: number;
      blockedHours: number;
    }
  ): Promise<{
    velocityAnalysis: string;
    teamHealthIndicators: string[];
    recommendations: string[];
    improvementPriorities: string[];
  }> {
    const result = await this.execute(`
      Analyze sprint metrics:
      
      - Planned: ${sprintData.plannedPoints} points
      - Completed: ${sprintData.completedPoints} points
      - Sprint goal achievement: ${sprintData.sprintGoalAchievement}%
      - Defects found: ${sprintData.defectsFound}
      - Blocked hours: ${sprintData.blockedHours}
      
      Provide:
      1. Velocity analysis
      2. Team health indicators
      3. Recommendations for next sprint
      4. Improvement priorities
    `);

    return {
      velocityAnalysis: result.data as string,
      teamHealthIndicators: [],
      recommendations: [],
      improvementPriorities: [],
    };
  }

  /**
   * Resolve impediments
   */
  async resolveImpediments(
    impediments: Array<{
      description: string;
      impact: string;
      affectedTeamMembers: string[];
    }>
  ): Promise<{
    resolutionPlan: string;
    escalations: string[];
    timelines: string[];
  }> {
    const result = await this.execute(`
      Help resolve these impediments:
      
      ${impediments.map((imp, i) => `
Impediment ${i + 1}:
- Description: ${imp.description}
- Impact: ${imp.impact}
- Affected: ${imp.affectedTeamMembers.join(', ')}
      `).join('\n')}
      
      Provide:
      1. Resolution plan for each
      2. What needs escalation
      3. Expected timelines
    `);

    return {
      resolutionPlan: result.data as string,
      escalations: [],
      timelines: [],
    };
  }
}
