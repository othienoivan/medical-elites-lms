import { Building2, ChevronsUpDown } from "lucide-react";
import useTenant from "../hooks/useTenant";

export default function TenantSwitcher() {
  const { memberships, activeTenant, loading, switchTenant } = useTenant();
  if (loading || memberships.length === 0) return null;

  if (memberships.length === 1) {
    return (
      <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 md:flex">
        <Building2 size={16} />
        <span className="max-w-44 truncate">{activeTenant?.name ?? "Workspace"}</span>
      </div>
    );
  }

  return (
    <label className="relative hidden md:block">
      <span className="sr-only">Active workspace</span>
      <select
        value={activeTenant?.id ?? ""}
        onChange={(event) => void switchTenant(event.target.value)}
        className="max-w-56 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm font-medium text-slate-700"
      >
        {memberships.map((membership) => (
          <option key={membership.id} value={membership.tenantId}>
            {membership.tenantId === activeTenant?.id ? (activeTenant?.name ?? membership.tenantId) : membership.tenantId}
          </option>
        ))}
      </select>
      <Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <ChevronsUpDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
    </label>
  );
}
