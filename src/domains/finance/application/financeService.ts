import { accountingPeriodFor, assertBalancedJournal, selectCommissionRule, splitRevenue, type CommissionRule, type CurrencyCode, type JournalLine } from "../domain/finance";
import { completeWithdrawal, createWallet, distributeRevenue, listFinanceRecords, listOwnerLedgerEntries, listOwnerWallets, listOwnerWithdrawals, reconcileTutorMarketplaceRevenue, requestWithdrawal, reviewWithdrawal, upsertCommissionRule, type FinanceCollection } from "../infrastructure/financeRepository";
export const FinanceService = {
  list: <T extends { id: string }>(collection: FinanceCollection) => listFinanceRecords<T>(collection),
  listOwnerWallets,
  listOwnerWithdrawals,
  listOwnerLedgerEntries,
  reconcileTutorMarketplaceRevenue,
  createWallet,
  distributeRevenue,
  requestWithdrawal,
  reviewWithdrawal,
  completeWithdrawal,
  upsertCommissionRule,
  validateJournal: (lines: JournalLine[]) => assertBalancedJournal(lines),
  calculateSplit: (amount: number, rule: CommissionRule) => splitRevenue(amount, rule),
  selectCommissionRule,
  accountingPeriodFor,
  makeIdempotencyKey: (prefix: string) => `${prefix}_${crypto.randomUUID()}`,
  supportedCurrencies: ["UGX", "USD", "KES", "TZS", "RWF"] as readonly CurrencyCode[],
};
