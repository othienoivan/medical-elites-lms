import type { EntityId, ISODateTime } from "../../shared";

export type TicketStatus = "open" | "in_progress" | "waiting_on_customer" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export interface SupportTicket {
  readonly id: EntityId;
  readonly tenantId?: EntityId;
  readonly requesterUserId: EntityId;
  readonly assigneeUserId?: EntityId;
  readonly subject: string;
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}
