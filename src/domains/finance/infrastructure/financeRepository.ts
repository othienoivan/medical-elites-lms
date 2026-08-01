import { collection, getDocs, limit, orderBy, query, where, type QueryConstraint } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../../config/firebase";
import type { CommissionRule, CurrencyCode, Wallet, Withdrawal } from "../domain/finance";

export type FinanceCollection = "financePlans" | "subscriptions" | "wallets" | "ledgerAccounts" | "ledgerEntries" | "journals" | "invoices" | "payments" | "coupons" | "commissionRules" | "withdrawals" | "financeEvents" | "accountingPeriods";

export async function listFinanceRecords<T extends { id: string }>(name: FinanceCollection, maximum = 200, constraints: QueryConstraint[] = []): Promise<T[]> {
  let snapshot;
  try { snapshot = await getDocs(query(collection(db, name), ...constraints, orderBy("createdAt", "desc"), limit(maximum))); }
  catch { snapshot = await getDocs(query(collection(db, name), ...constraints, limit(maximum))); }
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T));
}
export const listOwnerWallets = (ownerId: string) => listFinanceRecords<Wallet>("wallets", 50, [where("ownerId", "==", ownerId)]);
export const listOwnerWithdrawals = (ownerId: string) => listFinanceRecords<Withdrawal>("withdrawals", 100, [where("ownerId", "==", ownerId)]);

type CallableResult<T> = { data: T };
async function callFinance<TInput extends object, TOutput>(name: string, input: TInput): Promise<TOutput> {
  const callable = httpsCallable<TInput, TOutput>(functions, name);
  const result = await callable(input) as CallableResult<TOutput>;
  return result.data;
}
export const createWallet = (input: { ownerType: "platform" | "institution" | "tutor"; ownerId: string; currency: CurrencyCode; idempotencyKey: string }) => callFinance<typeof input, { walletId: string; created: boolean }>("createFinanceWallet", input);
export const distributeRevenue = (input: { amount: number; currency: CurrencyCode; tutorId: string; institutionId?: string; courseId?: string; reference: string; idempotencyKey: string }) => callFinance<typeof input, { journalId: string; allocations: Record<string, number> }>("distributeFinanceRevenue", input);
export const requestWithdrawal = (input: { walletId: string; amount: number; currency: CurrencyCode; payoutMethod: string; payoutDestination: string; idempotencyKey: string }) => callFinance<typeof input, { withdrawalId: string }>("requestFinanceWithdrawal", input);
export const reviewWithdrawal = (input: { withdrawalId: string; decision: "approve" | "reject"; reason?: string; idempotencyKey: string }) => callFinance<typeof input, { status: string }>("reviewFinanceWithdrawal", input);
export const upsertCommissionRule = (input: { rule: Omit<CommissionRule, "id"> & { id?: string }; idempotencyKey: string }) => callFinance<typeof input, { ruleId: string }>("upsertFinanceCommissionRule", input);
