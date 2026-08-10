import { CheckCircle2, LoaderCircle, PackageCheck, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { MarketplaceCommerceService, type MarketplaceOrder } from "../../domains/marketplace";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

type ReconciliationState = "idle" | "verifying" | "success" | "failed";

export default function MarketplaceOrdersPage() {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciliationState, setReconciliationState] = useState<ReconciliationState>("idle");
  const [reconciliationMessage, setReconciliationMessage] = useState<string | null>(null);
  const attemptedReference = useRef<string | null>(null);

  const transactionReference = useMemo(
    () => searchParams.get("tx_ref") || searchParams.get("transactionReference") || "",
    [searchParams],
  );
  const transactionId = useMemo(
    () => searchParams.get("transaction_id") || searchParams.get("transactionId") || "",
    [searchParams],
  );
  const paymentStatus = useMemo(() => (searchParams.get("status") || "").toLowerCase(), [searchParams]);

  const loadOrders = useCallback(async () => {
    if (!currentUser) return;
    const result = await MarketplaceCommerceService.listOrders(currentUser.uid);
    setOrders(result);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    void loadOrders().finally(() => setLoading(false));
  }, [currentUser, loadOrders]);

  useEffect(() => {
    if (!currentUser || !transactionReference || attemptedReference.current === transactionReference) return;
    attemptedReference.current = transactionReference;

    if (paymentStatus && !["successful", "completed"].includes(paymentStatus)) {
      setReconciliationState("failed");
      setReconciliationMessage(`Flutterwave returned payment status: ${paymentStatus}. No access was granted.`);
      return;
    }

    setReconciliationState("verifying");
    setReconciliationMessage("Verifying your completed Flutterwave payment…");

    void MarketplaceCommerceService.reconcilePayment({
      transactionReference,
      transactionId: transactionId || undefined,
      status: paymentStatus || undefined,
    })
      .then(async () => {
        setReconciliationState("success");
        setReconciliationMessage("Payment verified. Your purchase is now available.");
        await loadOrders();
        const next = new URLSearchParams(searchParams);
        next.delete("status");
        next.delete("tx_ref");
        next.delete("transaction_id");
        next.delete("transactionReference");
        next.delete("transactionId");
        next.set("payment", "verified");
        setSearchParams(next, { replace: true });
      })
      .catch((cause: unknown) => {
        console.error("Marketplace payment reconciliation failed", cause);
        setReconciliationState("failed");
        setReconciliationMessage(
          cause instanceof Error
            ? cause.message
            : "The payment was completed, but automatic verification failed. Please retry shortly.",
        );
      });
  }, [currentUser, transactionReference, transactionId, paymentStatus, loadOrders, searchParams, setSearchParams]);

  async function retryReconciliation() {
    if (!transactionReference) return;
    attemptedReference.current = null;
    setReconciliationState("idle");
    setReconciliationMessage(null);
    const next = new URLSearchParams(searchParams);
    next.set("tx_ref", transactionReference);
    if (transactionId) next.set("transaction_id", transactionId);
    if (paymentStatus) next.set("status", paymentStatus);
    setSearchParams(next, { replace: true });
  }

  if (loading) return <div className="p-12 text-center">Loading orders…</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center gap-3">
          <PackageCheck className="text-cyan-700" />
          <h1 className="text-3xl font-black">My marketplace orders</h1>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/student/library" className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">Open My Library</Link>
          <Link to="/student/marketplace" className="rounded-xl border bg-white px-4 py-2 text-sm font-bold text-slate-700">Browse Marketplace</Link>
        </div>

        {reconciliationState !== "idle" && (
          <section
            className={`mt-6 rounded-2xl border p-5 ${
              reconciliationState === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : reconciliationState === "failed"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-cyan-200 bg-cyan-50 text-cyan-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {reconciliationState === "verifying" && <LoaderCircle className="mt-0.5 animate-spin" />}
              {reconciliationState === "success" && <CheckCircle2 className="mt-0.5" />}
              {reconciliationState === "failed" && <TriangleAlert className="mt-0.5" />}
              <div>
                <h2 className="font-black">
                  {reconciliationState === "verifying"
                    ? "Verifying payment"
                    : reconciliationState === "success"
                      ? "Payment completed"
                      : "Payment verification needs attention"}
                </h2>
                {reconciliationMessage && <p className="mt-1 text-sm">{reconciliationMessage}</p>}
                {reconciliationState === "failed" && transactionReference && (
                  <button
                    type="button"
                    onClick={() => void retryReconciliation()}
                    className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white"
                  >
                    Retry verification
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="mt-8 space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center">No marketplace orders yet.</div>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="rounded-2xl border bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-black">{order.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.itemCount || order.productIds?.length || 1} item(s) · {order.transactionReference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black">{money(order.amount.amount, order.amount.currency)}</p>
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase">
                      {order.status}
                    </span>
                    {order.status === "fulfilled" && (
                      <div className="mt-3 flex justify-end gap-2">
                        <Link to="/student/library" className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white">Open Library</Link>
                        {order.productIds?.length === 1 && (
                          <Link to={`/marketplace/products/${order.productIds[0]}`} className="rounded-lg border px-3 py-2 text-xs font-bold text-slate-700">View Product</Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
