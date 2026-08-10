import { Banknote, LoaderCircle, RefreshCw, WalletCards } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import WalletSummaryCard from "../components/finance/WalletSummaryCard";
import { FinanceService, type CurrencyCode, type LedgerEntry, type Wallet, type Withdrawal } from "../domains/finance";
import useAuth from "../hooks/useAuth";

function money(value = 0, currency: CurrencyCode = "UGX") {
  return `${currency} ${Math.round(value).toLocaleString()}`;
}

export default function TutorWalletPage() {
  const { currentUser } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState("mobile_money");
  const [payoutDestination, setPayoutDestination] = useState("");

  const wallet = wallets.find((item) => item.currency === "UGX") ?? wallets[0] ?? null;
  const availableBalance = wallet?.availableBalance ?? 0;

  const loadWallet = useCallback(async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    setError("");
    try {
      // Backfill any fulfilled marketplace orders that pre-date automatic
      // revenue allocation. The backend operation is idempotent.
      await FinanceService.reconcileTutorMarketplaceRevenue();

      const [walletRecords, withdrawalRecords, ledgerRecords] = await Promise.all([
        FinanceService.listOwnerWallets(currentUser.uid),
        FinanceService.listOwnerWithdrawals(currentUser.uid),
        FinanceService.listOwnerLedgerEntries(currentUser.uid),
      ]);
      setWallets(walletRecords);
      setWithdrawals(withdrawalRecords);
      setLedgerEntries(ledgerRecords);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load your wallet.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  const pendingPayout = useMemo(
    () => withdrawals.find((item) => ["requested", "approved", "processing"].includes(item.status)),
    [withdrawals],
  );

  async function handleCreateWallet() {
    if (!currentUser?.uid || saving) return;
    try {
      setSaving(true);
      setError("");
      await FinanceService.createWallet({
        ownerType: "tutor",
        ownerId: currentUser.uid,
        currency: "UGX",
        idempotencyKey: `tutor-wallet_${currentUser.uid}_UGX`,
      });
      await loadWallet();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create your wallet.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestPayout() {
    if (!wallet || saving) return;
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setError("Enter a valid payout amount in UGX.");
      return;
    }
    if (amount > availableBalance) {
      setError("The payout amount cannot exceed your available wallet balance.");
      return;
    }
    if (!payoutDestination.trim()) {
      setError("Enter the Mobile Money number or bank account destination.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await FinanceService.requestWithdrawal({
        walletId: wallet.id,
        amount,
        currency: wallet.currency,
        payoutMethod,
        payoutDestination: payoutDestination.trim(),
        idempotencyKey: FinanceService.makeIdempotencyKey("tutor-payout"),
      });
      setAmount(0);
      setPayoutDestination("");
      await loadWallet();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to request the payout.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <TutorLayout
      title="My Wallet"
      subtitle="View your earnings, available balance and payout history."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-700 p-8 text-white">
        <WalletCards className="h-10 w-10" />
        <h2 className="mt-5 text-3xl font-bold">Tutor Wallet</h2>
        <p className="mt-2 max-w-3xl text-emerald-100">
          Your wallet is private to your tutor account. Institution billing and student fee management are handled separately by administrators.
        </p>
      </section>

      {error && <Card className="mb-6 border border-red-200 bg-red-50 text-red-700">{error}</Card>}

      <div className="mb-6 flex justify-end">
        <Button variant="outline" onClick={() => void loadWallet()} disabled={loading || saving}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <Card className="flex items-center gap-3 text-slate-600">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Loading your wallet…
        </Card>
      ) : !wallet ? (
        <Card className="max-w-2xl">
          <WalletCards className="h-12 w-12 text-emerald-700" />
          <h3 className="mt-4 text-2xl font-bold">Create your tutor wallet</h3>
          <p className="mt-2 text-slate-600">
            Create a UGX wallet to receive your revenue share and request payouts. Only one wallet is created for this tutor account and currency.
          </p>
          <Button className="mt-6" loading={saving} onClick={handleCreateWallet}>
            Create Wallet
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <WalletSummaryCard wallet={wallet} />

            <Card>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold">Recent earnings activity</h3>
                <span className="text-sm text-slate-500">{ledgerEntries.length} entr{ledgerEntries.length === 1 ? "y" : "ies"}</span>
              </div>
              <div className="mt-4 space-y-3">
                {ledgerEntries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                    <div>
                      <p className="font-bold">{entry.reference || "Marketplace revenue"}</p>
                      <p className="text-sm text-slate-500">{entry.accountingPeriod || "Current period"}</p>
                    </div>
                    <span className={`font-black ${entry.direction === "credit" ? "text-emerald-700" : "text-slate-700"}`}>
                      {entry.direction === "credit" ? "+" : "-"}{money(entry.amount, entry.currency)}
                    </span>
                  </div>
                ))}
                {ledgerEntries.length === 0 && <p className="text-slate-500">Revenue credits and completed payout entries will appear here.</p>}
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold">Payout history</h3>
              <div className="mt-4 space-y-3">
                {withdrawals.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                    <div>
                      <p className="font-bold">{money(item.amount.amount, item.amount.currency)}</p>
                      <p className="text-sm text-slate-500">{item.payoutMethod} · {item.payoutDestinationMasked ?? "Destination protected"}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">{item.status}</span>
                  </div>
                ))}
                {withdrawals.length === 0 && <p className="text-slate-500">No payout requests yet.</p>}
              </div>
            </Card>
          </div>

          <Card>
            <Banknote className="h-9 w-9 text-emerald-700" />
            <h3 className="mt-4 text-xl font-bold">Request payout</h3>
            <p className="mt-2 text-sm text-slate-600">Available: <strong>{money(availableBalance, wallet.currency)}</strong></p>

            {pendingPayout ? (
              <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-amber-800">
                You already have a payout request with status <strong>{pendingPayout.status}</strong>. Complete or resolve it before creating another request.
              </div>
            ) : (
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Amount (UGX)
                  <input className="input" type="number" min="1" max={availableBalance} value={amount || ""} onChange={(event) => setAmount(Number(event.target.value))} />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Payout method
                  <select className="input" value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value)}>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank transfer</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Mobile Money number or bank account
                  <input className="input" value={payoutDestination} onChange={(event) => setPayoutDestination(event.target.value)} placeholder="e.g. 2567XXXXXXXX" />
                </label>
                <Button loading={saving} disabled={availableBalance <= 0} onClick={handleRequestPayout}>
                  Request Payout
                </Button>
                {availableBalance <= 0 && <p className="text-sm text-slate-500">A payout can be requested after revenue has been credited to your wallet.</p>}
              </div>
            )}
          </Card>
        </div>
      )}
    </TutorLayout>
  );
}
