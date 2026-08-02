import PlatformCollectionPage from "../../components/platform/PlatformCollectionPage";
import {
  PlatformService,
  platformCollections,
  type LicenseGrant,
} from "../../domains/platform";
import { usePlatformRecords } from "../../domains/platform/presentation/usePlatformRecords";

export default function PlatformLicensesPage() {
  const state = usePlatformRecords(PlatformService.listLicenses);

  return (
    <PlatformCollectionPage<LicenseGrant>
      title="License & Activation Manager"
      subtitle="Grant trials, complimentary access and manual activations before RC4 billing."
      records={state.records}
      loading={state.loading}
      error={state.error}
      onRefresh={state.refresh}
      createLabel="Grant license"
      emptyMessage="No license grants found."
      fields={[
        { key: "tenantId", label: "Tenant ID", required: true },
        { key: "planId", label: "Plan ID", required: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          defaultValue: "active",
          options: [
            { label: "Active", value: "active" },
            { label: "Trial", value: "trial" },
            { label: "Suspended", value: "suspended" },
          ],
        },
        {
          key: "source",
          label: "Source",
          type: "select",
          defaultValue: "manual",
          options: [
            { label: "Manual", value: "manual" },
            { label: "Trial", value: "trial" },
            { label: "Promotion", value: "promotion" },
            { label: "Complimentary", value: "complimentary" },
            { label: "Subscription", value: "subscription" },
          ],
        },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
      onCreate={async (payload) => {
        await PlatformService.create(platformCollections.licenses, payload);
      }}
      onRemove={async (record) => {
        await PlatformService.remove(platformCollections.licenses, record.id);
      }}
      getTitle={(record) => `${record.tenantId} → ${record.planId}`}
      getSubtitle={(record) => `${record.source} · ${record.notes || "No notes"}`}
      getBadge={(record) => record.status}
    />
  );
}
