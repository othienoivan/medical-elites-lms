import PlatformCollectionPage from "../../components/platform/PlatformCollectionPage";
import {
  PlatformService,
  normalizeSlug,
  platformCollections,
  type PlatformTenant,
} from "../../domains/platform";
import { usePlatformRecords } from "../../domains/platform/presentation/usePlatformRecords";

export default function PlatformTutorsPage() {
  const state = usePlatformRecords(PlatformService.listTenants);
  const records = state.records.filter((item) => item.type === "independent_tutor");

  return (
    <PlatformCollectionPage<PlatformTenant>
      title="Independent Tutor Manager"
      subtitle="Onboard, license and supervise tutor-owned workspaces."
      records={records}
      loading={state.loading}
      error={state.error}
      onRefresh={state.refresh}
      createLabel="Add tutor workspace"
      emptyMessage="No independent tutor workspaces found."
      fields={[
        { key: "name", label: "Tutor or brand name", required: true },
        { key: "ownerUid", label: "Tutor user UID", required: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          required: true,
          defaultValue: "trial",
          options: [
            { label: "Trial", value: "trial" },
            { label: "Active", value: "active" },
            { label: "Suspended", value: "suspended" },
          ],
        },
        { key: "country", label: "Country", defaultValue: "Uganda" },
        { key: "currency", label: "Currency", defaultValue: "UGX" },
        { key: "planId", label: "Tutor plan ID", defaultValue: "tutor-free" },
      ]}
      onCreate={async (payload) => {
        await PlatformService.create(platformCollections.tenants, {
          ...payload,
          type: "independent_tutor",
          slug: normalizeSlug(String(payload.name)),
          branding: {},
        });
      }}
      onRemove={async (record) => {
        await PlatformService.remove(platformCollections.tenants, record.id);
      }}
      getTitle={(record) => record.name}
      getSubtitle={(record) => `${record.ownerUid || "No owner UID"} · ${record.planId || "Tutor Free"}`}
      getBadge={(record) => record.status}
    />
  );
}
