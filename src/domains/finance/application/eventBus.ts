export interface DomainEvent<T = Record<string, unknown>> { id: string; type: string; occurredAt: string; aggregateId: string; payload: T; }
export type EventHandler<T = Record<string, unknown>> = (event: DomainEvent<T>) => Promise<void> | void;
export class EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();
  subscribe(type: string, handler: EventHandler): () => void { const list = this.handlers.get(type) ?? []; list.push(handler); this.handlers.set(type, list); return () => this.handlers.set(type, (this.handlers.get(type) ?? []).filter((item) => item !== handler)); }
  async publish(event: DomainEvent): Promise<void> { for (const handler of this.handlers.get(event.type) ?? []) await handler(event); }
}
export const financeEventBus = new EventBus();
