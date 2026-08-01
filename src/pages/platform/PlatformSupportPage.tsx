import PlatformCollectionPage from "../../components/platform/PlatformCollectionPage";
import {
  PlatformService,
  platformCollections,
  type SupportTicket,
} from "../../domains/platform";
import { usePlatformRecords } from "../../domains/platform/presentation/usePlatformRecords";

export default function PlatformSupportPage() {
  const state = usePlatformRecords(PlatformService.listTickets);

  return (
    <PlatformCollectionPage<SupportTicket>
      title="Support Centre"
      subtitle="Central ticket management for institutions, tutors and learners."
      records={state.records}
      loading={state.loading}
      error={state.error}
      onRefresh={state.refresh}
      createLabel="Create ticket"
      emptyMessage="No support tickets found."
      fields={[
        { key: "subject", label: "Subject", required: true },
        { key: "description", label: "Description", type: "textarea", required: true },
        { key: "requesterUid", label: "Requester UID", required: true },
        { key: "requesterName", label: "Requester name" },
        { key: "tenantId", label: "Tenant ID" },
        {
          key: "priority",
          label: "Priority",
          type: "select",
          defaultValue: "normal",
          options: [
            { label: "Low", value: "low" },
            { label: "Normal", value: "normal" },
            { label: "High", value: "high" },
            { label: "Urgent", value: "urgent" },
          ],
        },
      ]}
      onCreate={async (payload) => {
        await PlatformService.create(platformCollections.tickets, { ...payload, status: "open" });
      }}
      getTitle={(record) => record.subject}
      getSubtitle={(record) => `${record.requesterName || record.requesterUid} · ${record.priority}`}
      getBadge={(record) => record.status}
    />
  );
}
