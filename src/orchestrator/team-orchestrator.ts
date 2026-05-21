/**
 * TeamOrchestrator
 * Main controller that coordinates all AI agents in the development team
 * 
 * This is the main entry point for interacting with the AI Dev Team
 */

import { Agent } from '@cursor/sdk';
import { Agent as CursorAgent } from '@cursor/sdk';
import { CursorAgentError } from '@cursor/sdk';
import {
  AgentRole,
  Task,
  Sprint,
  Project,
  TeamMessage,
  WorkflowEvent,
  ProductRequirement,
  AGENT_PERSONAS,
} from '../types/index.js';
import {
  ProductManagerAgent,
  TechLeadAgent,
  FrontendDeveloperAgent,
  BackendDeveloperAgent,
  QAEngineerAgent,
  DevOpsAgent,
  UXDesignerAgent,
  ScrumMasterAgent,
  SecurityEngineerAgent,
  MobileDeveloperAgent,
} from '../agents/index.js';

export interface TeamConfig {
  members: AgentRole[];
  projectPath: string;
  cursorApiKey?: string;
}

export interface SprintPlanningInput {
  projectName: string;
  projectDescription: string;
  requirements: string;
  sprintDurationDays: number;
}

export interface SprintPlanningOutput {
  sprintGoal: string;
  tasks: Task[];
  userStories: ProductRequirement['userStories'];
  architectureNotes: string;
  dependencies: string[];
}

export interface SprintExecutionInput {
  sprint: Sprint;
  tasks: Task[];
}

export interface SprintExecutionOutput {
  completedTasks: Task[];
  blockers: string[];
  codeReviews: number;
  testResults: Record<string, boolean>;
}

export class TeamOrchestrator {
  private agents: Map<AgentRole, BaseAgent> = new Map();
  private config: TeamConfig;
  private project: Project | null = null;
  private currentSprint: Sprint | null = null;
  private eventLog: WorkflowEvent[] = [];
  private messageLog: TeamMessage[] = [];

  constructor(config: TeamConfig) {
    this.config = config;
  }

  /**
   * Initialize all team members
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing AI Development Team...\n');

    // Initialize Product Manager
    if (this.config.members.includes(AgentRole.PRODUCT_MANAGER)) {
      const pm = new ProductManagerAgent();
      await pm.initialize();
      this.agents.set(AgentRole.PRODUCT_MANAGER, pm);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.PRODUCT_MANAGER].name} (Product Manager) - Ready`);
    }

    // Initialize Tech Lead
    if (this.config.members.includes(AgentRole.TECH_LEAD)) {
      const tl = new TechLeadAgent();
      await tl.initialize();
      this.agents.set(AgentRole.TECH_LEAD, tl);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.TECH_LEAD].name} (Tech Lead) - Ready`);
    }

    // Initialize Frontend Developer
    if (this.config.members.includes(AgentRole.FRONTEND_DEVELOPER)) {
      const fe = new FrontendDeveloperAgent();
      await fe.initialize();
      this.agents.set(AgentRole.FRONTEND_DEVELOPER, fe);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.FRONTEND_DEVELOPER].name} (Frontend Dev) - Ready`);
    }

    // Initialize Backend Developer
    if (this.config.members.includes(AgentRole.BACKEND_DEVELOPER)) {
      const be = new BackendDeveloperAgent();
      await be.initialize();
      this.agents.set(AgentRole.BACKEND_DEVELOPER, be);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.BACKEND_DEVELOPER].name} (Backend Dev) - Ready`);
    }

    // Initialize QA Engineer
    if (this.config.members.includes(AgentRole.QA_ENGINEER)) {
      const qa = new QAEngineerAgent();
      await qa.initialize();
      this.agents.set(AgentRole.QA_ENGINEER, qa);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.QA_ENGINEER].name} (QA Engineer) - Ready`);
    }

    // Initialize DevOps Engineer
    if (this.config.members.includes(AgentRole.DEVOPS_ENGINEER)) {
      const devops = new DevOpsAgent();
      await devops.initialize();
      this.agents.set(AgentRole.DEVOPS_ENGINEER, devops);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.DEVOPS_ENGINEER].name} (DevOps) - Ready`);
    }

    // Initialize UX Designer
    if (this.config.members.includes(AgentRole.UX_DESIGNER)) {
      const ux = new UXDesignerAgent();
      await ux.initialize();
      this.agents.set(AgentRole.UX_DESIGNER, ux);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.UX_DESIGNER].name} (UX Designer) - Ready`);
    }

    // Initialize Scrum Master
    if (this.config.members.includes(AgentRole.SCRUM_MASTER)) {
      const sm = new ScrumMasterAgent();
      await sm.initialize();
      this.agents.set(AgentRole.SCRUM_MASTER, sm);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.SCRUM_MASTER].name} (Scrum Master) - Ready`);
    }

    // Initialize Security Engineer
    if (this.config.members.includes(AgentRole.SECURITY_ENGINEER)) {
      const sec = new SecurityEngineerAgent();
      await sec.initialize();
      this.agents.set(AgentRole.SECURITY_ENGINEER, sec);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.SECURITY_ENGINEER].name} (Security Engineer) - Ready`);
    }

    // Initialize Mobile Developer
    if (this.config.members.includes(AgentRole.MOBILE_DEVELOPER)) {
      const mobile = new MobileDeveloperAgent();
      await mobile.initialize();
      this.agents.set(AgentRole.MOBILE_DEVELOPER, mobile);
      console.log(`✓ ${AGENT_PERSONAS[AgentRole.MOBILE_DEVELOPER].name} (Mobile Developer) - Ready`);
    }

    console.log('\n✅ All team members initialized!\n');
  }

  /**
   * Run Sprint Planning - the core workflow
   */
  async runSprintPlanning(input: SprintPlanningInput): Promise<SprintPlanningOutput> {
    console.log('📋 Starting Sprint Planning...\n');

    const events: WorkflowEvent[] = [];

    // Step 1: Product Manager defines requirements
    console.log('📝 Step 1: Product Manager defines requirements...');
    const pm = this.agents.get(AgentRole.PRODUCT_MANAGER);
    let userStories: ProductRequirement['userStories'] = [];
    let requirementsOutput = '';

    if (pm) {
      const result = await pm.defineRequirements(
        input.projectDescription,
        `Project: ${input.projectName}`
      );
      requirementsOutput = result.data as string;
      console.log('   ✓ Requirements defined\n');
    }

    // Step 2: Tech Lead reviews architecture
    console.log('🏗️ Step 2: Tech Lead reviews architecture...');
    const tl = this.agents.get(AgentRole.TECH_LEAD);
    let architectureNotes = '';

    if (tl) {
      const result = await tl.reviewArchitecture(input.requirements);
      architectureNotes = result.data as string || 'Architecture reviewed';
      console.log('   ✓ Architecture reviewed\n');
    }

    // Step 3: Break down into tasks (PM + Tech Lead collaboration)
    console.log('📊 Step 3: Breaking down into tasks...');
    const sprintGoal = pm 
      ? await (pm as ProductManagerAgent).defineSprintGoal(
          input.requirements.split('\n'),
          1
        )
      : `Sprint 1 Goal for ${input.projectName}`;

    // Generate tasks from requirements
    const tasks = this.generateTasksFromRequirements(input.requirements);

    // Step 4: QA creates test plan
    console.log('🧪 Step 4: QA creates test plan...');
    const qa = this.agents.get(AgentRole.QA_ENGINEER);
    if (qa) {
      await (qa as QAEngineerAgent).createTestPlan(
        input.projectName,
        input.requirements
      );
      console.log('   ✓ Test plan created\n');
    }

    // Step 5: DevOps prepares infrastructure
    console.log('⚙️ Step 5: DevOps prepares infrastructure...');
    const devops = this.agents.get(AgentRole.DEVOPS_ENGINEER);
    if (devops) {
      await (devops as DevOpsAgent).designCICDPipeline(
        input.projectType || 'web',
        input.techStack || 'React + Node.js'
      );
      console.log('   ✓ CI/CD pipeline designed\n');
    }

    console.log('✅ Sprint Planning Complete!\n');
    console.log(`📌 Sprint Goal: ${sprintGoal}`);
    console.log(`📋 Total Tasks: ${tasks.length}\n`);

    return {
      sprintGoal,
      tasks,
      userStories,
      architectureNotes,
      dependencies: this.identifyDependencies(tasks),
    };
  }

  /**
   * Execute Sprint - run development tasks
   */
  async executeSprint(input: SprintExecutionInput): Promise<SprintExecutionOutput> {
    console.log('🚀 Starting Sprint Execution...\n');

    const completedTasks: Task[] = [];
    const blockers: string[] = [];
    const codeReviews: number = 0;
    const testResults: Record<string, boolean> = {};

    // Categorize tasks by type
    const frontendTasks = input.tasks.filter(t => 
      t.type === 'feature' && t.title.toLowerCase().includes('ui')
    );
    const backendTasks = input.tasks.filter(t =>
      t.type === 'feature' && (
        t.title.toLowerCase().includes('api') ||
        t.title.toLowerCase().includes('database') ||
        t.title.toLowerCase().includes('backend')
      )
    );
    const infraTasks = input.tasks.filter(t => t.type === 'infrastructure');
    const testingTasks = input.tasks.filter(t => t.type === 'testing');

    // Execute frontend tasks
    if (frontendTasks.length > 0) {
      console.log('🎨 Working on Frontend tasks...');
      const fe = this.agents.get(AgentRole.FRONTEND_DEVELOPER);
      if (fe) {
        for (const task of frontendTasks) {
          console.log(`   → ${task.title}`);
          task.status = 'in_progress';
          // In real implementation, this would execute the actual work
        }
      }
    }

    // Execute backend tasks
    if (backendTasks.length > 0) {
      console.log('⚙️ Working on Backend tasks...');
      const be = this.agents.get(AgentRole.BACKEND_DEVELOPER);
      if (be) {
        for (const task of backendTasks) {
          console.log(`   → ${task.title}`);
          task.status = 'in_progress';
        }
      }
    }

    // Execute infrastructure tasks
    if (infraTasks.length > 0) {
      console.log('🛠️ Working on Infrastructure tasks...');
      const devops = this.agents.get(AgentRole.DEVOPS_ENGINEER);
      if (devops) {
        for (const task of infraTasks) {
          console.log(`   → ${task.title}`);
          task.status = 'in_progress';
        }
      }
    }

    // Execute testing tasks
    if (testingTasks.length > 0) {
      console.log('🧪 Working on Testing tasks...');
      const qa = this.agents.get(AgentRole.QA_ENGINEER);
      if (qa) {
        for (const task of testingTasks) {
          console.log(`   → ${task.title}`);
          task.status = 'in_progress';
          testResults[task.id] = true; // Simulated
        }
      }
    }

    console.log('\n✅ Sprint Execution Complete!\n');

    return {
      completedTasks,
      blockers,
      codeReviews,
      testResults,
    };
  }

  /**
   * Get a specific agent by role
   */
  getAgent(role: AgentRole): BaseAgent | undefined {
    return this.agents.get(role);
  }

  /**
   * Get team status
   */
  getTeamStatus(): {
    onlineAgents: AgentRole[];
    totalTasks: number;
    completedTasks: number;
    currentSprint: string | null;
  } {
    return {
      onlineAgents: Array.from(this.agents.keys()),
      totalTasks: this.currentSprint?.tasks.length || 0,
      completedTasks: this.currentSprint?.tasks.filter(t => t.status === 'done').length || 0,
      currentSprint: this.currentSprint?.name || null,
    };
  }

  /**
   * Send message between agents
   */
  async sendMessage(
    from: AgentRole,
    to: AgentRole,
    content: string,
    priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    const message: TeamMessage = {
      id: `msg-${Date.now()}`,
      from,
      to,
      subject: 'Team Communication',
      content,
      timestamp: new Date(),
      priority,
    };
    this.messageLog.push(message);
  }

  /**
   * Get event log
   */
  getEventLog(): WorkflowEvent[] {
    return this.eventLog;
  }

  /**
   * Cleanup all agents
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up team members...\n');
    for (const [, agent] of this.agents) {
      await agent.cleanup();
    }
    this.agents.clear();
    console.log('✅ All agents cleaned up!\n');
  }

  // Helper methods

  private generateTasksFromRequirements(requirements: string): Task[] {
    const taskLines = requirements.split('\n').filter(line => line.trim());
    return taskLines.map((line, index) => ({
      id: `task-${index + 1}`,
      title: line.trim(),
      description: `Implement: ${line.trim()}`,
      type: 'feature' as const,
      priority: index < 3 ? 'high' : 'medium',
      status: 'pending' as const,
      estimatedHours: 4 + Math.floor(Math.random() * 8),
      dependencies: [],
      acceptanceCriteria: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  private identifyDependencies(tasks: Task[]): string[] {
    const dependencies: string[] = [];
    // Simple dependency analysis - in real implementation, this would be more sophisticated
    if (tasks.length > 3) {
      dependencies.push('Backend API must be ready before frontend integration');
      dependencies.push('Database schema must be designed before backend implementation');
      dependencies.push('CI/CD must be configured before deployment tasks');
    }
    return dependencies;
  }
}

// Import BaseAgent for type
import { BaseAgent } from '../agents/base-agent.js';
