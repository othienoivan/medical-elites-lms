import PlatformCollectionPage from "../../components/platform/PlatformCollectionPage";
import { PlatformService, normalizeSlug, platformCollections, type PlatformTenant } from "../../domains/platform";
import { usePlatformRecords } from "../../domains/platform/presentation/usePlatformRecords";
export default function PlatformTenantsPage() {
  const state = usePlatformRecords(PlatformService.listTenants);
  return <PlatformCollectionPage<PlatformTenant> title="Tenant Manager" subtitle="Create institution and independent-tutor workspaces around the stable LMS." records={state.records} loading={state.loading} error={state.error} onRefresh={state.refresh} createLabel="Add tenant" emptyMessage="No tenant workspaces found." fields={[
    { key: "name", label: "Tenant name", required: true },
    { key: "type", label: "Tenant type", type: "select", required: true, options: [{label:"Institution",value:"institution"},{label:"Independent tutor",value:"independent_tutor"}] },
    { key: "status", label: "Status", type: "select", required: true, defaultValue: "trial", options: [{label:"Trial",value:"trial"},{label:"Active",value:"active"},{label:"Suspended",value:"suspended"}] },
    { key: "country", label: "Country", defaultValue: "Uganda" }, { key: "currency", label: "Currency", defaultValue: "UGX" }, { key: "planId", label: "Plan ID" },
  ]} onCreate={async (payload) => { await PlatformService.create(platformCollections.tenants, { ...payload, slug: normalizeSlug(String(payload.name)), branding: {} }); }} onRemove={async (record) => PlatformService.remove(platformCollections.tenants, record.id)} getTitle={(record) => record.name} getSubtitle={(record) => `${record.type.replaceAll("_"," ")} · ${record.country || "Country not set"} · ${record.planId || "No plan"}`} getBadge={(record) => record.status}/>;
}
