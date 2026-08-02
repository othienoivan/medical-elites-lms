import { Activity, AlertTriangle, Bot, Database, HardDrive, MessageSquare, ShieldCheck, Webhook } from "lucide-react";
import PlatformLayout from "../../components/platform/PlatformLayout";

const checks = [
  { label: "Authentication", icon: ShieldCheck, status: "Operational", detail: "Firebase Authentication and access gates" },
  { label: "Firestore", icon: Database, status: "Operational", detail: "Rules, indexes and academic data services" },
  { label: "Storage", icon: HardDrive, status: "Operational", detail: "Protected uploads and lesson resources" },
  { label: "AI gateway", icon: Bot, status: "Monitor", detail: "Review rate-limit and provider failures" },
  { label: "Messaging", icon: MessageSquare, status: "Operational", detail: "Conversation and notification services" },
  { label: "Payment webhooks", icon: Webhook, status: "Monitor", detail: "Review replay-protection and verification failures" },
];

export default function PlatformOperationsPage() {
  return (
    <PlatformLayout title="Operations Centre" subtitle="Production health, diagnostics and recovery readiness.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {checks.map(({ label, icon: Icon, status, detail }) => (
          <section key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Icon className="h-6 w-6 text-blue-700" />
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "Operational" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{status}</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{label}</h2>
            <p className="mt-2 text-sm text-slate-600">{detail}</p>
          </section>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-700" /><h2 className="font-semibold">Operational controls</h2></div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Verify production deployment and critical user journeys after every release.</li>
            <li>• Review Cloud Functions errors, AI failures and webhook receipts daily.</li>
            <li>• Run backup restore drills quarterly and record recovery time.</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-700" /><h2 className="font-semibold text-amber-900">Alert priorities</h2></div>
          <p className="mt-3 text-sm text-amber-900">Escalate authentication outages, payment verification failures, data-access regressions and sustained AI provider failures immediately.</p>
        </section>
      </div>
    </PlatformLayout>
  );
}
