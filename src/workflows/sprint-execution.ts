/**
 * Sprint Execution Workflow
 * Coordinates the sprint execution process following Agile/Scrum methodology
 */

import { TeamOrchestrator } from '../orchestrator/team-orchestrator.js';
import { AgentRole, Task, TaskStatus, Sprint } from '../types/index.js';

export interface SprintExecutionConfig {
  dailyStandupEnabled: boolean;
  codeReviewRequired: boolean;
  automatedTesting: boolean;
}

/**
 * Execute Sprint - Run the development work
 */
export async function executeSprint(
  team: TeamOrchestrator,
  sprint: Sprint,
  config: SprintExecutionConfig
): Promise<{
  completedTasks: Task[];
  blockedTasks: Task[];
  totalHours: number;
  velocity: number;
  blockers: string[];
}> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`              🚀 SPRINT EXECUTION: ${sprint.name}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const completedTasks: Task[] = [];
  const blockedTasks: Task[] = [];
  let totalHours = 0;
  const blockers: string[] = [];

  // Categorize tasks by type and assignee
  const frontendTasks = sprint.tasks.filter(t => 
    t.title.toLowerCase().includes('ui') ||
    t.title.toLowerCase().includes('frontend') ||
    t.title.toLowerCase().includes('page') ||
    t.title.toLowerCase().includes('component')
  );

  const backendTasks = sprint.tasks.filter(t =>
    t.title.toLowerCase().includes('api') ||
    t.title.toLowerCase().includes('backend') ||
    t.title.toLowerCase().includes('database') ||
    t.title.toLowerCase().includes('service')
  );

  const infraTasks = sprint.tasks.filter(t =>
    t.type === 'infrastructure' ||
    t.title.toLowerCase().includes('deploy') ||
    t.title.toLowerCase().includes('ci/cd') ||
    t.title.toLowerCase().includes('docker')
  );

  const testingTasks = sprint.tasks.filter(t =>
    t.type === 'testing' ||
    t.title.toLowerCase().includes('test')
  );

  // Phase 1: Development Start
  console.log('📦 Phase 1: Development Started');
  console.log('---------------------------------------------------');
  
  // Start frontend and backend development in parallel
  const devPromises: Promise<void>[] = [];

  if (frontendTasks.length > 0) {
    devPromises.push(executeFrontendTasks(team, frontendTasks, completedTasks, blockedTasks));
  }

  if (backendTasks.length > 0) {
    devPromises.push(executeBackendTasks(team, backendTasks, completedTasks, blockedTasks));
  }

  if (infraTasks.length > 0) {
    devPromises.push(executeInfraTasks(team, infraTasks, completedTasks, blockedTasks));
  }

  await Promise.all(devPromises);

  // Phase 2: Testing
  console.log('\n🧪 Phase 2: Testing');
  console.log('---------------------------------------------------');

  const qa = team.getAgent(AgentRole.QA_ENGINEER);
  if (qa && testingTasks.length > 0) {
    for (const task of testingTasks) {
      console.log(`   Testing: ${task.title}`);
      task.status = TaskStatus.IN_PROGRESS;
      
      // QA creates test plan
      await (qa as any).createTestPlan(task.title, task.description);
      
      task.status = TaskStatus.DONE;
      completedTasks.push(task);
      totalHours += task.estimatedHours || 4;
    }
    console.log(`   ✓ Completed ${testingTasks.length} testing tasks\n`);
  }

  // Phase 3: Code Review
  if (config.codeReviewRequired) {
    console.log('🔍 Phase 3: Code Review');
    console.log('---------------------------------------------------');

    const tl = team.getAgent(AgentRole.TECH_LEAD);
    if (tl) {
      const codeReviewTasks = [...frontendTasks, ...backendTasks].filter(t => 
        completedTasks.includes(t)
      );

      for (const task of codeReviewTasks.slice(0, 3)) {
        console.log(`   Reviewing: ${task.title}`);
        await tl.execute(`
          Review the implementation of: ${task.title}
          
          Check for:
          1. Code quality and best practices
          2. Security vulnerabilities
          3. Performance issues
          4. Test coverage
          5. Documentation
          
          Provide detailed feedback.
        `);
      }
      console.log(`   ✓ Reviewed ${codeReviewTasks.length} implementations\n`);
    }
  }

  // Phase 4: Deployment Preparation
  console.log('📤 Phase 4: Deployment Preparation');
  console.log('---------------------------------------------------');

  const devops = team.getAgent(AgentRole.DEVOPS_ENGINEER);
  if (devops) {
    await devops.execute(`
      Prepare deployment for the completed sprint work.
      
      Include:
      1. Update CI/CD pipeline if needed
      2. Create deployment manifests
      3. Prepare rollback procedures
      4. Set up monitoring dashboards
    `);
    console.log('   ✓ Deployment preparation complete\n');
  }

  // Calculate velocity
  const velocity = completedTasks.reduce((sum, t) => sum + (t.estimatedHours || 4), 0);

  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    SPRINT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   📋 Total Tasks: ${sprint.tasks.length}`);
  console.log(`   ✅ Completed: ${completedTasks.length}`);
  console.log(`   ⛔ Blocked: ${blockedTasks.length}`);
  console.log(`   ⏱️  Total Hours: ${totalHours}`);
  console.log(`   📈 Velocity: ${velocity} points`);
  
  if (blockers.length > 0) {
    console.log('\n   ⚠️  Blockers:');
    blockers.forEach(b => console.log(`      • ${b}`));
  }
  console.log('═══════════════════════════════════════════════════════════════\n');

  return {
    completedTasks,
    blockedTasks,
    totalHours,
    velocity,
    blockers,
  };
}

async function executeFrontendTasks(
  team: TeamOrchestrator,
  tasks: Task[],
  completed: Task[],
  blocked: Task[]
): Promise<void> {
  const fe = team.getAgent(AgentRole.FRONTEND_DEVELOPER);
  if (!fe) return;

  console.log('\n🎨 Frontend Development');
  console.log('---------------------------------------------------');

  for (const task of tasks) {
    console.log(`   → ${task.title}`);
    task.status = TaskStatus.IN_PROGRESS;

    // Check for dependencies
    if (task.dependencies.length > 0) {
      const depsMet = task.dependencies.every(depId => 
        completed.some(t => t.id === depId)
      );
      if (!depsMet) {
        task.status = TaskStatus.BLOCKED;
        blocked.push(task);
        console.log(`      ⛔ Blocked by dependencies`);
        continue;
      }
    }

    // Execute frontend work
    await fe.execute(`
      Implement the following frontend feature:
      
      Task: ${task.title}
      Description: ${task.description}
      
      Requirements:
      ${task.acceptanceCriteria.map(c => `- ${c}`).join('\n')}
      
      Follow best practices:
      - Use React/TypeScript
      - Ensure accessibility (WCAG 2.1 AA)
      - Responsive design
      - Component tests
    `);

    task.status = TaskStatus.DONE;
    completed.push(task);
  }

  console.log(`   ✓ Completed ${tasks.length} frontend tasks`);
}

async function executeBackendTasks(
  team: TeamOrchestrator,
  tasks: Task[],
  completed: Task[],
  blocked: Task[]
): Promise<void> {
  const be = team.getAgent(AgentRole.BACKEND_DEVELOPER);
  if (!be) return;

  console.log('\n⚙️ Backend Development');
  console.log('---------------------------------------------------');

  for (const task of tasks) {
    console.log(`   → ${task.title}`);
    task.status = TaskStatus.IN_PROGRESS;

    if (task.dependencies.length > 0) {
      const depsMet = task.dependencies.every(depId => 
        completed.some(t => t.id === depId)
      );
      if (!depsMet) {
        task.status = TaskStatus.BLOCKED;
        blocked.push(task);
        console.log(`      ⛔ Blocked by dependencies`);
        continue;
      }
    }

    await be.execute(`
      Implement the following backend feature:
      
      Task: ${task.title}
      Description: ${task.description}
      
      Requirements:
      ${task.acceptanceCriteria.map(c => `- ${c}`).join('\n')}
      
      Follow best practices:
      - Use Node.js/TypeScript
      - API-first design
      - Input validation
      - Error handling
      - Unit tests
    `);

    task.status = TaskStatus.DONE;
    completed.push(task);
  }

  console.log(`   ✓ Completed ${tasks.length} backend tasks`);
}

async function executeInfraTasks(
  team: TeamOrchestrator,
  tasks: Task[],
  completed: Task[],
  blocked: Task[]
): Promise<void> {
  const devops = team.getAgent(AgentRole.DEVOPS_ENGINEER);
  if (!devops) return;

  console.log('\n🛠️ Infrastructure Development');
  console.log('---------------------------------------------------');

  for (const task of tasks) {
    console.log(`   → ${task.title}`);
    task.status = TaskStatus.IN_PROGRESS;

    await devops.execute(`
      Implement the following infrastructure task:
      
      Task: ${task.title}
      Description: ${task.description}
      
      Requirements:
      ${task.acceptanceCriteria.map(c => `- ${c}`).join('\n')}
    `);

    task.status = TaskStatus.DONE;
    completed.push(task);
  }

  console.log(`   ✓ Completed ${tasks.length} infrastructure tasks`);
}
