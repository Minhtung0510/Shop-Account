/**
 * AI Development Team - Main Entry Point
 * 
 * This file provides a simple interface to interact with the AI Dev Team.
 * Each agent simulates a team member with 10-15 years of experience.
 */

import * as dotenv from 'dotenv';
import { AgentRole } from './types/index.js';
import { TeamOrchestrator } from './orchestrator/team-orchestrator.js';

dotenv.config();

/**
 * Main function demonstrating the AI Dev Team
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('          🤖 AI DEVELOPMENT TEAM SYSTEM 🤖');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Check for API key
  if (!process.env.CURSOR_API_KEY) {
    console.error('❌ Error: CURSOR_API_KEY not found in environment');
    console.log('\nPlease create a .env file with your Cursor API key:');
    console.log('   cp .env.example .env');
    console.log('   # Edit .env and add: CURSOR_API_KEY=cursor_your_key_here\n');
    console.log('Get your API key from: https://cursor.com/dashboard/cloud-agents\n');
    process.exit(1);
  }

  // Create team configuration - Full team
  const teamConfig = {
    members: [
      AgentRole.PRODUCT_MANAGER,
      AgentRole.TECH_LEAD,
      AgentRole.FRONTEND_DEVELOPER,
      AgentRole.BACKEND_DEVELOPER,
      AgentRole.QA_ENGINEER,
      AgentRole.DEVOPS_ENGINEER,
      AgentRole.UX_DESIGNER,
      AgentRole.SCRUM_MASTER,
      AgentRole.SECURITY_ENGINEER,
      AgentRole.MOBILE_DEVELOPER,
    ],
    projectPath: process.cwd(),
    cursorApiKey: process.env.CURSOR_API_KEY,
  };

  // Initialize team
  const team = new TeamOrchestrator(teamConfig);
  
  try {
    // Initialize all agents
    await team.initialize();

    // Example: Run sprint planning
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                 📋 SPRINT PLANNING DEMO');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const sprintResult = await team.runSprintPlanning({
      projectName: 'E-Commerce Platform',
      projectDescription: 'Build a modern e-commerce platform with user authentication, product catalog, shopping cart, and checkout functionality.',
      requirements: `
1. User registration and login (JWT authentication)
2. Product catalog with search and filtering
3. Shopping cart functionality
4. Checkout process with payment integration
5. Order history and tracking
6. Admin dashboard for product management
      `.trim(),
      sprintDurationDays: 14,
      techStack: 'React + Node.js + PostgreSQL',
    });

    console.log('\n📊 Sprint Planning Results:');
    console.log('-------------------------------------');
    console.log(`🎯 Sprint Goal: ${sprintResult.sprintGoal}`);
    console.log(`📋 Total Tasks: ${sprintResult.tasks.length}`);
    console.log(`🔗 Dependencies: ${sprintResult.dependencies.length}`);

    if (sprintResult.dependencies.length > 0) {
      console.log('\n📌 Key Dependencies:');
      sprintResult.dependencies.forEach(dep => console.log(`   • ${dep}`));
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

    // Show team status
    const status = team.getTeamStatus();
    console.log('📊 Team Status:');
    console.log('-------------------------------------');
    console.log(`👥 Online Agents: ${status.onlineAgents.length}`);
    console.log(`📋 Tasks in Sprint: ${status.totalTasks}`);
    console.log(`✅ Completed: ${status.completedTasks}`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Error running team:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await team.cleanup();
  }
}

// Run if this is the main module
main().catch(console.error);

// Export for use as module
export { main };
