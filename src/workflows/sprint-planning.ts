/**
 * Sprint Planning Workflow
 * Coordinates the sprint planning process between all team members
 */

import { TeamOrchestrator } from '../orchestrator/team-orchestrator.js';
import { AgentRole, Task, TaskType, TaskPriority } from '../types/index.js';

export interface PlanningConfig {
  sprintNumber: number;
  durationDays: number;
  teamCapacity: number; // story points per sprint
}

/**
 * Run Sprint Planning Meeting
 * This simulates a real sprint planning session with all team members
 */
export async function runSprintPlanningMeeting(
  team: TeamOrchestrator,
  backlogItems: string[],
  config: PlanningConfig
): Promise<{
  sprintGoal: string;
  selectedTasks: Task[];
  capacityUtilization: number;
  risks: string[];
}> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`              📋 SPRINT ${config.sprintNumber} PLANNING`);
  console.log(`              Duration: ${config.durationDays} days`);
  console.log(`              Team Capacity: ${config.teamCapacity} points`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Phase 1: Product Backlog Review
  console.log('📝 Phase 1: Product Backlog Review');
  console.log('---------------------------------------------------');
  
  const pm = team.getAgent(AgentRole.PRODUCT_MANAGER);
  if (pm) {
    const result = await pm.execute(`
      Review this product backlog and prioritize items:
      
      ${backlogItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}
      
      Consider: Business value, user impact, technical dependencies, sprint capacity.
      Provide prioritized list with justification.
    `);
    console.log('   ✓ Product Manager has reviewed the backlog\n');
  }

  // Phase 2: Technical Assessment
  console.log('🏗️ Phase 2: Technical Assessment');
  console.log('---------------------------------------------------');
  
  const tl = team.getAgent(AgentRole.TECH_LEAD);
  if (tl) {
    await tl.execute(`
      Assess technical complexity and dependencies for:
      
      ${backlogItems.join('\n')}
      
      Identify:
      1. Tasks that can be completed in this sprint
      2. Technical dependencies
      3. Risks and concerns
      4. Architecture decisions needed
    `);
    console.log('   ✓ Tech Lead has assessed technical complexity\n');
  }

  // Phase 3: Task Estimation
  console.log('📊 Phase 3: Task Estimation');
  console.log('---------------------------------------------------');
  
  const fe = team.getAgent(AgentRole.FRONTEND_DEVELOPER);
  const be = team.getAgent(AgentRole.BACKEND_DEVELOPER);
  const qa = team.getAgent(AgentRole.QA_ENGINEER);

  if (fe && be && qa) {
    // Estimate each backlog item
    const estimates: Record<string, number> = {};
    
    for (const item of backlogItems.slice(0, 5)) {
      const taskType = item.toLowerCase().includes('ui') || item.toLowerCase().includes('frontend')
        ? 'frontend'
        : item.toLowerCase().includes('api') || item.toLowerCase().includes('database')
          ? 'backend'
          : item.toLowerCase().includes('test')
            ? 'qa'
            : 'mixed';

      const estimate = taskType === 'frontend'
        ? await fe.execute(`Estimate effort for: ${item}`)
        : taskType === 'backend'
          ? await be.execute(`Estimate effort for: ${item}`)
          : await qa.execute(`Estimate effort for: ${item}`);

      estimates[item] = 3; // Default story points
    }
    console.log('   ✓ Team has estimated all tasks\n');
  }

  // Phase 4: Capacity Planning
  console.log('📈 Phase 4: Capacity Planning');
  console.log('---------------------------------------------------');
  
  // Select tasks based on capacity
  const selectedTasks = selectTasksByCapacity(backlogItems, config.teamCapacity);
  console.log(`   ✓ Selected ${selectedTasks.length} tasks for sprint`);
  console.log(`   ✓ Capacity utilization: ${Math.round((selectedTasks.length / config.teamCapacity) * 100)}%\n`);

  // Phase 5: Define Sprint Goal
  console.log('🎯 Phase 5: Define Sprint Goal');
  console.log('---------------------------------------------------');
  
  let sprintGoal = `Complete ${selectedTasks.length} high-priority items`;
  
  if (pm) {
    const goalResult = await (pm as any).defineSprintGoal(
      selectedTasks.map(t => t.title),
      config.sprintNumber
    );
    sprintGoal = typeof goalResult === 'string' ? goalResult : sprintGoal;
  }
  
  console.log(`   Sprint Goal: ${sprintGoal}\n`);

  // Phase 6: Risk Assessment
  console.log('⚠️ Phase 6: Risk Assessment');
  console.log('---------------------------------------------------');
  
  const risks = identifySprintRisks(selectedTasks);
  if (risks.length > 0) {
    console.log('   Key Risks:');
    risks.forEach(risk => console.log(`   • ${risk}`));
  } else {
    console.log('   ✓ No major risks identified\n');
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ SPRINT PLANNING COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  return {
    sprintGoal,
    selectedTasks,
    capacityUtilization: Math.round((selectedTasks.length / config.teamCapacity) * 100),
    risks,
  };
}

function selectTasksByCapacity(items: string[], capacity: number): Task[] {
  let currentPoints = 0;
  const selectedTasks: Task[] = [];

  for (const item of items) {
    const taskPoints = estimateStoryPoints(item);
    
    if (currentPoints + taskPoints <= capacity) {
      selectedTasks.push({
        id: `task-${selectedTasks.length + 1}`,
        title: item,
        description: `Implement: ${item}`,
        type: categorizeTask(item),
        priority: selectedTasks.length < 3 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
        status: 'pending',
        estimatedHours: taskPoints * 2,
        dependencies: [],
        acceptanceCriteria: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      currentPoints += taskPoints;
    }
  }

  return selectedTasks;
}

function estimateStoryPoints(item: string): number {
  // Simple estimation based on keywords
  const complexKeywords = ['payment', 'auth', 'search', 'admin', 'dashboard'];
  const mediumKeywords = ['cart', 'checkout', 'order', 'profile', 'notification'];
  
  if (complexKeywords.some(k => item.toLowerCase().includes(k))) return 8;
  if (mediumKeywords.some(k => item.toLowerCase().includes(k))) return 5;
  return 3;
}

function categorizeTask(item: string): TaskType {
  const lower = item.toLowerCase();
  if (lower.includes('test')) return TaskType.TESTING;
  if (lower.includes('deploy') || lower.includes('ci/cd') || lower.includes('infrastructure')) {
    return TaskType.INFRASTRUCTURE;
  }
  if (lower.includes('fix') || lower.includes('bug')) return TaskType.BUG_FIX;
  if (lower.includes('refactor')) return TaskType.REFACTOR;
  return TaskType.FEATURE;
}

function identifySprintRisks(tasks: Task[]): string[] {
  const risks: string[] = [];
  
  // Check for high complexity tasks
  const highPriorityCount = tasks.filter(t => t.priority === TaskPriority.HIGH).length;
  if (highPriorityCount > 3) {
    risks.push('High number of critical tasks may impact delivery');
  }

  // Check for dependencies
  const hasDependencies = tasks.some(t => t.dependencies.length > 0);
  if (hasDependencies) {
    risks.push('Tasks have dependencies - sequential execution may be required');
  }

  // Check for testing coverage
  const testingTasks = tasks.filter(t => t.type === TaskType.TESTING).length;
  const featureTasks = tasks.filter(t => t.type === TaskType.FEATURE).length;
  if (testingTasks < featureTasks / 2) {
    risks.push('Limited testing tasks may lead to quality issues');
  }

  return risks;
}
