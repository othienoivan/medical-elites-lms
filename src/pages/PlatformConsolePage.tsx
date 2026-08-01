import { Building2, CreditCard, Gauge, ShieldCheck, Users, WalletCards } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import useTenant from "../hooks/useTenant";

const cards = [
  { title: "Tenants", description: "Institutions and independent tutor workspaces.", icon: Building2 },
  { title: "Plans", description: "Subscription pricing, quotas and feature entitlements.", icon: CreditCard },
  { title: "Memberships", description: "Cross-tenant roles and active workspace assignments.", icon: Users },
  { title: "Wallets", description: "Platform commissions, tenant earnings and future payouts.", icon: WalletCards },
  { title: "Usage", description: "Student, storage and AI consumption metering foundation.", icon: Gauge },
  { title: "Security", description: "Tenant isolation, membership checks and audit readiness.", icon: ShieldCheck },
];

export default function PlatformConsolePage() {
  const { activeTenant, activePlan, memberships, error } = useTenant();
  return (
    <AdminLayout title="Platform Console" subtitle="SaaS operations foundation for Medical Elites Platform.">
      {error && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-sm text-slate-400">Active workspace</p><p className="mt-2 text-xl font-bold">{activeTenant?.name ?? "Legacy workspace"}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Active plan</p><p className="mt-2 text-xl font-bold text-slate-950">{activePlan?.name ?? "Legacy access"}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Your workspaces</p><p className="mt-2 text-xl font-bold text-slate-950">{memberships.length}</p></div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex rounded-xl bg-violet-100 p-3 text-violet-700"><Icon size={22}/></div>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </div>
    </AdminLayout>
  );
}
