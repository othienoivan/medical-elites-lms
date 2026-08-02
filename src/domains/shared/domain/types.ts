export type EntityId = string;
export type ISODateTime = string;
export type CurrencyCode = "UGX" | "USD" | "KES" | "TZS" | "RWF" | string;

export interface DomainEvent<TPayload = Readonly<Record<string, unknown>>> {
  readonly id: EntityId;
  readonly type: string;
  readonly occurredAt: ISODateTime;
  readonly aggregateId: EntityId;
  readonly payload: TPayload;
}

export interface PageRequest {
  readonly limit: number;
  readonly cursor?: string;
}

export interface PageResult<T> {
  readonly items: readonly T[];
  readonly nextCursor?: string;
}
