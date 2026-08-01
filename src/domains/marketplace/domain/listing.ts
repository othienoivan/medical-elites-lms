import type { EntityId, ISODateTime } from "../../shared";
import type { Money } from "../../billing";

export type ListingType = "course" | "question_bank" | "mock_exam" | "notes" | "osce_package";
export type ListingStatus = "draft" | "submitted" | "approved" | "published" | "suspended" | "archived";

export interface MarketplaceListing {
  readonly id: EntityId;
  readonly sellerTenantId: EntityId;
  readonly ownerUserId: EntityId;
  readonly type: ListingType;
  readonly status: ListingStatus;
  readonly title: string;
  readonly description: string;
  readonly price: Money;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}
