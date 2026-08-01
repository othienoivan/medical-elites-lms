import type { EntityId, ISODateTime } from "../../shared";

export type AiCapability = "lesson" | "quiz" | "question_bank" | "exam" | "support";

export interface AiRequest {
  readonly id: EntityId;
  readonly tenantId: EntityId;
  readonly userId: EntityId;
  readonly capability: AiCapability;
  readonly promptVersion: string;
  readonly requestedAt: ISODateTime;
}

export interface AiUsageRecord {
  readonly requestId: EntityId;
  readonly tenantId: EntityId;
  readonly userId: EntityId;
  readonly capability: AiCapability;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly estimatedCostMinor: number;
  readonly completedAt: ISODateTime;
}
