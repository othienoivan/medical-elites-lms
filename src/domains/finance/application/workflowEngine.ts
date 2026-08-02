export interface WorkflowContext { workflowId: string; data: Record<string, unknown>; }
export interface WorkflowStep { name: string; execute(context: WorkflowContext): Promise<void>; compensate?(context: WorkflowContext): Promise<void>; }
export class WorkflowEngine {
  async run(context: WorkflowContext, steps: readonly WorkflowStep[]): Promise<void> { const completed: WorkflowStep[] = []; try { for (const step of steps) { await step.execute(context); completed.push(step); } } catch (error) { for (const step of completed.reverse()) await step.compensate?.(context); throw error; } }
}
