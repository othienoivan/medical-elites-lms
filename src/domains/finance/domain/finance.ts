export type CurrencyCode = "UGX" | "USD" | "KES" | "TZS" | "RWF";
export type Money = Readonly<{ amount: number; currency: CurrencyCode }>;
export type BillingCycle = "monthly" | "quarterly" | "annual" | "custom";
export type SubscriptionStatus = "trial" | "active" | "grace" | "suspended" | "cancelled" | "expired";
export type InvoiceStatus = "draft" | "issued" | "paid" | "void" | "overdue" | "refunded";
export type WalletOwnerType = "platform" | "institution" | "tutor" | "affiliate";
export type LedgerDirection = "debit" | "credit";
export type PaymentStatus = "pending" | "successful" | "failed" | "refunded";
export type WalletStatus = "active" | "frozen" | "suspended" | "closed";
export type WithdrawalStatus = "requested" | "approved" | "processing" | "paid" | "rejected" | "cancelled";
export type AccountingPeriodStatus = "open" | "closed" | "locked";

export interface FinancePlan { id: string; name: string; audience: "institution" | "tutor" | "student"; price: Money; billingCycle: BillingCycle; entitlements: string[]; limits: Record<string, number>; commissionPercent: number; active: boolean; }
export interface Subscription { id: string; tenantId: string; planId: string; status: SubscriptionStatus; startedAt: string; currentPeriodStart: string; currentPeriodEnd: string; graceEndsAt?: string; autoRenew: boolean; }
export interface Wallet { id: string; ownerType: WalletOwnerType; ownerId: string; currency: CurrencyCode; status: WalletStatus; availableBalance?: number; pendingBalance?: number; frozenBalance?: number; lifetimeCredits?: number; lifetimeDebits?: number; createdAt?: unknown; updatedAt?: unknown; }
export interface LedgerAccount { id: string; code: string; name: string; type: "asset" | "liability" | "equity" | "revenue" | "expense"; ownerId?: string; currency: CurrencyCode; }
export interface JournalLine { accountId: string; walletId?: string; ownerId?: string; direction: LedgerDirection; amount: number; memo?: string; }
export interface Journal { id: string; reference: string; idempotencyKey: string; eventType: string; currency: CurrencyCode; accountingPeriod: string; lines: JournalLine[]; status: "pending" | "posted" | "reversed"; createdAt: string; }
export interface LedgerEntry extends JournalLine { id: string; journalId: string; reference: string; currency: CurrencyCode; accountingPeriod: string; createdAt?: unknown; }
export interface Invoice { id: string; tenantId: string; subscriptionId?: string; number: string; status: InvoiceStatus; subtotal: Money; discount: Money; tax: Money; total: Money; dueAt: string; issuedAt: string; }
export interface Payment { id: string; tenantId: string; invoiceId?: string; provider: string; providerReference: string; status: PaymentStatus; amount: Money; paidAt?: string; }
export interface Coupon { id: string; code: string; kind: "percentage" | "fixed"; value: number; currency?: CurrencyCode; active: boolean; usageLimit?: number; expiresAt?: string; }
export type CommissionScope = "global" | "institution" | "tutor" | "course";
export interface CommissionRule { id: string; name: string; scope?: CommissionScope; scopeId?: string; priority?: number; platformPercent: number; tutorPercent: number; institutionPercent: number; active: boolean; }
export interface RevenueAllocation { beneficiaryType: "platform" | "institution" | "tutor"; beneficiaryId: string; walletId: string; amount: Money; percent: number; }
export interface Withdrawal { id: string; walletId: string; ownerId: string; amount: Money; status: WithdrawalStatus; payoutMethod: string; payoutDestinationMasked?: string; requestedAt: string; reviewedAt?: string; reviewedBy?: string; rejectionReason?: string; }
export interface AccountingPeriod { id: string; label: string; startsAt: string; endsAt: string; status: AccountingPeriodStatus; }

export function assertMoney(amount: number): void {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Money amounts must be positive integers in the currency's smallest supported unit.");
}
export function accountingPeriodFor(value: Date | string = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid accounting date.");
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
export function assertBalancedJournal(lines: readonly JournalLine[]): void {
  const debit = lines.filter((line) => line.direction === "debit").reduce((sum, line) => sum + line.amount, 0);
  const credit = lines.filter((line) => line.direction === "credit").reduce((sum, line) => sum + line.amount, 0);
  if (lines.length < 2 || Math.abs(debit - credit) > 0.001) throw new Error("Journal entries must be balanced.");
}
export function splitRevenue(amount: number, rule: CommissionRule): { platform: number; tutor: number; institution: number } {
  assertMoney(amount);
  const total = rule.platformPercent + rule.tutorPercent + rule.institutionPercent;
  if (Math.abs(total - 100) > 0.001) throw new Error("Commission percentages must total 100%.");
  const platform = Math.round((amount * rule.platformPercent) / 100);
  const tutor = Math.round((amount * rule.tutorPercent) / 100);
  return { platform, tutor, institution: amount - platform - tutor };
}
export function selectCommissionRule(rules: readonly CommissionRule[], context: { courseId?: string; tutorId?: string; institutionId?: string }): CommissionRule | null {
  const ranks: Record<CommissionScope, number> = { global: 1, institution: 2, tutor: 3, course: 4 };
  return rules.filter((rule) => rule.active).filter((rule) => {
    const scope = rule.scope ?? "global";
    if (scope === "global") return true;
    if (scope === "institution") return rule.scopeId === context.institutionId;
    if (scope === "tutor") return rule.scopeId === context.tutorId;
    return rule.scopeId === context.courseId;
  }).sort((a,b) => ((b.priority ?? ranks[b.scope ?? "global"]) - (a.priority ?? ranks[a.scope ?? "global"])))[0] ?? null;
}
