import { Agent } from '@cursor/sdk';
import {
  AgentRole,
  AgentPersona,
  AgentConfig,
  AgentExecution,
  AgentResult,
  AGENT_PERSONAS,
} from '../types/index.js';
import { CursorAgentError } from '@cursor/sdk';

export abstract class BaseAgent {
  protected role: AgentRole;
  protected persona: AgentPersona;
  protected agent?: Awaited<ReturnType<typeof Agent.create>>;
  protected config: AgentConfig;
  protected executionHistory: AgentExecution[] = [];

  constructor(role: AgentRole, customConfig?: Partial<AgentConfig>) {
    this.role = role;
    this.persona = AGENT_PERSONAS[role];
    this.config = {
      apiKey: process.env.CURSOR_API_KEY,
      model: { id: 'composer-2' },
      local: { cwd: process.cwd() },
      ...customConfig,
    };
  }

  protected abstract getSystemPrompt(): string;

  async initialize(): Promise<void> {
    try {
      this.agent = await Agent.create({
        apiKey: this.config.apiKey,
        model: this.config.model,
        local: this.config.local,
      });
    } catch (error) {
      if (error instanceof CursorAgentError) {
        throw new Error(`Failed to initialize ${this.role}: ${error.message}`);
      }
      throw error;
    }
  }

  async execute(task: string): Promise<AgentResult> {
    const startTime = Date.now();
    const execution: AgentExecution = {
      agentId: this.persona.name,
      runId: '',
      role: this.role,
      status: 'running',
      startedAt: new Date(),
    };

    try {
      if (!this.agent) {
        await this.initialize();
      }

      const systemPrompt = this.getSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\n## Current Task\n${task}\n\nPlease complete this task following your role's responsibilities and expertise.`;

      const run = await this.agent!.send(fullPrompt);
      execution.runId = run.runId;
      
      const result = await run.wait();

      execution.status = result.status === 'finished' ? 'finished' : 'error';
      execution.completedAt = new Date();
      execution.result = result.result;

      this.executionHistory.push(execution);

      return {
        success: result.status === 'finished',
        data: result.result,
        agentId: this.persona.name,
        executionTime: Date.now() - startTime,
        ...(result.status !== 'finished' && { error: result.result }),
      };
    } catch (error) {
      execution.status = 'error';
      execution.completedAt = new Date();
      execution.error = error instanceof Error ? error.message : String(error);
      this.executionHistory.push(execution);

      return {
        success: false,
        error: execution.error,
        agentId: this.persona.name,
        executionTime: Date.now() - startTime,
      };
    }
  }

  async cleanup(): Promise<void> {
    if (this.agent) {
      await this.agent[Symbol.asyncDispose]();
      this.agent = undefined;
    }
  }

  getPersona(): AgentPersona {
    return this.persona;
  }

  getRole(): AgentRole {
    return this.role;
  }

  getHistory(): AgentExecution[] {
    return this.executionHistory;
  }
}
