import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Crown,
  Gauge,
  HardDrive,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";

import TutorLayout from "../components/layout/TutorLayout";
import useAuth from "../hooks/useAuth";
import useTenant from "../hooks/useTenant";
import useTutorPlanUsage from "../hooks/useTutorPlanUsage";
import { db } from "../config/firebase";
import type { Plan } from "../models/Plan";
import { TUTOR_FREE_PLAN } from "../models/defaultPlans";
import {
  cancelTutorSubscriptionAtPeriodEnd,
  createCommerceCheckout,
  reconcileCommercePayment,
  refreshTutorSubscriptionLifecycle,
} from "../domains/finance/infrastructure/commerceRepository";

function formatBytes(value: number): string {
  if (value < 0) return "Unlimited";
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.round(value / 1024 ** 2)} MB`;
}

function formatMoney(amount: number, currency: string): string {
  if (amount <= 0) return "Free";
  return `${currency} ${amount.toLocaleString()}`;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const candidate = value as { toDate?: () => Date };
    if (typeof candidate.toDate === "function") return candidate.toDate();
  }
  return null;
}

function formatDate(value: unknown): string {
  const date = toDate(value);
  return date ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Not available";
}

export default function TutorSubscriptionPage() {
  const { currentUser, userProfile } = useAuth();
  const { activePlan, activeSubscription, activeTenant, loading, refreshTenant } = useTenant();
  const { usage, loading: usageLoading } = useTutorPlanUsage();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");

  const plan = activePlan ?? TUTOR_FREE_PLAN;
  const isFree = plan.id === TUTOR_FREE_PLAN.id || plan.priceMinor === 0;
  const periodEnd = toDate(activeSubscription?.currentPeriodEnd);
  const renewWindowOpen = !isFree && periodEnd !== null && periodEnd.getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (!currentUser) return;
    void refreshTutorSubscriptionLifecycle()
      .then((result) => {
        if (result.status === "expired") {
  setMessage("Your previous paid subscription ended. Free Tutor access is now active and your account remains available.");
} else if (result.status === "active" && result.planId !== "tutor_free") {
  setMessage("Your paid subscription is active.");
}
        return refreshTenant();
      })
      .catch((error) => console.warn("Subscription lifecycle refresh was unavailable:", error));
    // Run once for the signed-in tutor. refreshTenant is intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  useEffect(() => {
    void getDocs(query(collection(db, "plans"), where("audience", "==", "tutor"), where("isActive", "==", true)))
      .then((snap) => setPlans(snap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Plan, "id">) }))))
      .catch((error) => {
        console.error("Failed to load tutor plans:", error);
        setMessage("Upgrade plans could not be loaded right now. Your current plan remains active.");
      })
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const params = new URLSearchParams(window.location.search);
    const status = (params.get("status") || "").toLowerCase();
    const transactionReference = params.get("tx_ref") || "";
    const transactionId = params.get("transaction_id") || "";
    if (!transactionReference || !transactionId || !["successful", "success", "completed"].includes(status)) return;

    setReconciling(true);
    setMessage("Verifying your subscription paymentâ€¦");
    void reconcileCommercePayment({ transactionReference, transactionId })
      .then(async () => {
        await refreshTutorSubscriptionLifecycle();
        await refreshTenant();
        setMessage("Payment verified. Your paid tutor plan is now active.");
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch((error) => {
        console.error("Subscription payment reconciliation failed:", error);
        setMessage(error instanceof Error ? error.message : "Payment completed, but the subscription could not be verified automatically. Please use Refresh subscription.");
      })
      .finally(() => setReconciling(false));
  }, [currentUser, refreshTenant]);

  const upgradePlans = useMemo(
    () => plans.filter((item) => item.id !== plan.id && item.priceMinor > 0).sort((a, b) => a.priceMinor - b.priceMinor),
    [plan.id, plans],
  );

  const storageLimit = plan.limits.storageBytes;
  const storageUsed = usage.storageBytes;
  const storageReserved = usage.storageReservedBytes;
  const storageCommitted = storageUsed + storageReserved;
  const storageUnlimited = storageLimit < 0;

  const storagePercent = storageUnlimited || storageLimit <= 0
    ? 0
    : Math.min(100, (storageCommitted / storageLimit) * 100);

  const storageAvailable = storageUnlimited
    ? -1
    : Math.max(0, storageLimit - storageCommitted);

  const limits = [
    { label: "Students", used: usage.students, value: plan.limits.maxStudents < 0 ? "Unlimited" : plan.limits.maxStudents.toLocaleString(), icon: Users },
    { label: "Course units", used: usage.courseUnits, value: plan.limits.maxCourseUnits < 0 ? "Unlimited" : plan.limits.maxCourseUnits.toLocaleString(), icon: BookOpen },
    { label: "Storage", used: usage.storageBytes, value: formatBytes(plan.limits.storageBytes), icon: HardDrive },
    { label: "Monthly AI credits", value: plan.limits.monthlyAiCredits < 0 ? "Unlimited" : plan.limits.monthlyAiCredits.toLocaleString(), icon: Sparkles },
  ];

  async function startPlanCheckout(target: Plan) {
    if (!currentUser) return;
    try {
      setCheckoutPlanId(target.id);
      setMessage("");
      const result = await createCommerceCheckout({
        purpose: "subscription",
        planId: target.id,
        billingCycle: target.billingInterval,
        fullName: userProfile?.fullName || currentUser.displayName || "Medical Elites Tutor",
        email: userProfile?.email || currentUser.email || "",
        paymentMethod: "card",
        returnUrl: `${window.location.origin}/tutor/subscription`,
        idempotencyKey: `sub-${currentUser.uid}-${target.id}-${Date.now()}`,
      });
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      console.error("Unable to start subscription checkout:", error);
      setMessage(error instanceof Error ? error.message : "Unable to start subscription checkout.");
    } finally {
      setCheckoutPlanId(null);
    }
  }

  async function refreshSubscription() {
    try {
      setMessage("Refreshing subscription statusâ€¦");
      const result = await refreshTutorSubscriptionLifecycle();
      await refreshTenant();
      setMessage(result.changed ? "Subscription lifecycle updated successfully." : "Subscription status is up to date.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to refresh the subscription right now.");
    }
  }

  async function cancelAtPeriodEnd() {
    if (!window.confirm("Keep the paid plan until the end of the current billing period, then return to Free Tutor?")) return;
    try {
      setCancelling(true);
      await cancelTutorSubscriptionAtPeriodEnd();
      await refreshTenant();
      setMessage("Cancellation scheduled. Your paid plan remains active until the end of the current billing period.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to schedule cancellation.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <TutorLayout title="Plan & Subscription" subtitle="Your account stays active independently of your subscription. Upgrade is optional and only needed when you want more capacity or advanced tools.">
      <div className="space-y-6">
        {message && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{message}</div>}

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">Current plan</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">{loading ? "Loadingâ€¦" : plan.name}</h2>
              <p className="mt-2 max-w-2xl text-slate-600">{plan.description ?? "Your Medical Elites tutor subscription."}</p>
              {activeTenant && <p className="mt-3 text-sm text-slate-500">Workspace: {activeTenant.name}</p>}
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black capitalize text-emerald-700">
              <CheckCircle2 size={18} /> {activeSubscription?.status ? activeSubscription.status.replaceAll("_", " ") : "Free access"}
            </span>
          </div>

          {!isFree && activeSubscription && (
            <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <div><p className="text-xs font-bold uppercase text-slate-500">Billing period ends</p><p className="mt-1 font-black text-slate-900">{formatDate(activeSubscription.currentPeriodEnd)}</p></div>
              <div><p className="text-xs font-bold uppercase text-slate-500">Renewal</p><p className="mt-1 font-black text-slate-900">{activeSubscription.cancelAtPeriodEnd ? "Cancels at period end" : "Manual renewal"}</p></div>
              <div><p className="text-xs font-bold uppercase text-slate-500">Last payment</p><p className="mt-1 truncate font-black text-slate-900">{activeSubscription.lastPaymentId || "Recorded"}</p></div>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {limits.map(({ label, value, used, icon: Icon }) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <Icon className="text-cyan-700" size={20} />
                <p className="mt-3 text-sm text-slate-500">{label}</p>
                <p className="text-xl font-black text-slate-950">{typeof used === "number" && !usageLoading ? `${used.toLocaleString()} / ${value}` : value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <HardDrive size={20} className="text-cyan-700" />
                  <h3 className="font-black text-slate-950">
                    Storage usage
                  </h3>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {formatBytes(storageUsed)} stored
                  {storageReserved > 0
                    ? ` + ${formatBytes(storageReserved)} reserved for uploads`
                    : ""}
                </p>
              </div>

              <div className="text-right">
                <p className="font-black text-slate-950">
                  {storageUnlimited
                    ? "Unlimited"
                    : `${storagePercent.toFixed(1)}% used`}
                </p>

                <p className="text-xs text-slate-500">
                  {usage.storageObjectCount.toLocaleString()} stored file{usage.storageObjectCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {!storageUnlimited && (
              <>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-cyan-600 transition-all"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-semibold text-slate-700">
                    {formatBytes(storageCommitted)} of {formatBytes(storageLimit)}
                  </span>

                  <span className="text-slate-600">
                    {formatBytes(storageAvailable)} available
                  </span>
                </div>

                {storagePercent >= 100 && (
                  <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
                    Storage is full. Remove files or upgrade your plan before uploading more content.
                  </p>
                )}

                {storagePercent >= 90 && storagePercent < 100 && (
                  <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
                    Your storage is almost full. Consider upgrading your plan or removing files you no longer need.
                  </p>
                )}

                {storagePercent >= 80 && storagePercent < 90 && (
                  <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                    You have used more than 80% of your storage allowance.
                  </p>
                )}
              </>
            )}

            {storageUnlimited && (
              <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                Your current plan has unlimited storage capacity.
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><Gauge className="text-cyan-700"/><h3 className="text-xl font-black">Included features</h3></div>
            <div className="mt-4 space-y-3">
              {plan.enabledEntitlements.length === 0
                ? <p className="text-slate-600">Core teaching tools are available. Advanced licensed features can be added with an upgrade.</p>
                : plan.enabledEntitlements.map((item) => <div key={item} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={17} className="text-emerald-600"/>{item.replaceAll("_", " ")}</div>)}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6">
            <div className="flex items-center gap-3"><Crown className="text-cyan-700"/><h3 className="text-xl font-black text-slate-950">{isFree ? "Need more capacity?" : "Manage your subscription"}</h3></div>
            <p className="mt-3 text-slate-700">{isFree
              ? "Keep using Free Tutor for as long as it meets your needs. When you reach a limit, your existing work remains accessible and the LMS will offer an upgrade instead of showing a permission error."
              : "Your paid plan controls feature access and usage limits, while your tutor account remains a separate active identity. Expiry returns the workspace to Free Tutor without deleting your work."}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => void refreshSubscription()} disabled={reconciling} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300 bg-white px-4 py-3 font-bold text-cyan-800 disabled:opacity-60"><RefreshCw size={17}/>{reconciling ? "Verifyingâ€¦" : "Refresh subscription"}</button>
              <Link to="/tutor/commerce" className="inline-flex items-center gap-2 rounded-xl border border-cyan-300 bg-white px-4 py-3 font-bold text-cyan-800"><Store size={18}/>Commerce Centre</Link>
              {!isFree && !activeSubscription?.cancelAtPeriodEnd && <button onClick={() => void cancelAtPeriodEnd()} disabled={cancelling} className="rounded-xl border border-rose-200 bg-white px-4 py-3 font-bold text-rose-700 disabled:opacity-60">{cancelling ? "Schedulingâ€¦" : "Cancel at period end"}</button>}
            </div>
          </div>
        </section>

        {!isFree && renewWindowOpen && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3"><CalendarClock className="mt-1 text-amber-700"/><div><h3 className="text-lg font-black text-slate-950">Renewal window is open</h3><p className="mt-1 text-sm text-slate-700">Your current period ends on {formatDate(activeSubscription?.currentPeriodEnd)}. Renewing now extends the same plan from the current period end.</p><button onClick={() => void startPlanCheckout(plan)} disabled={checkoutPlanId !== null} className="mt-4 rounded-xl bg-amber-700 px-4 py-3 font-bold text-white disabled:opacity-60">{checkoutPlanId === plan.id ? "Opening checkoutâ€¦" : `Renew ${plan.name}`}</button></div></div>
          </section>
        )}

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><ShoppingCart className="text-cyan-700"/><div><h3 className="text-xl font-black">Upgrade options</h3><p className="text-sm text-slate-600">Paid tutor plans configured by the platform appear here automatically.</p></div></div>
          {plansLoading
            ? <p className="mt-5 text-slate-500">Loading upgrade plansâ€¦</p>
            : upgradePlans.length === 0
              ? <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-slate-600">No paid tutor upgrade plan is currently published. Free Tutor remains available.</p>
              : <div className="mt-5 grid gap-4 lg:grid-cols-3">{upgradePlans.map((item) => <div key={item.id} className="rounded-2xl border p-5"><p className="text-sm font-bold uppercase tracking-wide text-cyan-700">{item.billingInterval}</p><h4 className="mt-2 text-xl font-black">{item.name}</h4><p className="mt-2 text-2xl font-black">{formatMoney(item.priceMinor, item.currency)}</p><p className="mt-2 text-sm text-slate-600">{item.description}</p><button disabled={checkoutPlanId !== null} onClick={() => void startPlanCheckout(item)} className="mt-5 w-full rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white disabled:opacity-60">{checkoutPlanId === item.id ? "Opening checkoutâ€¦" : `Upgrade to ${item.name}`}</button></div>)}</div>}
        </section>
      </div>
    </TutorLayout>
  );
}



