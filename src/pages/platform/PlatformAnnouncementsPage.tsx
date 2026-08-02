import PlatformCollectionPage from "../../components/platform/PlatformCollectionPage";
import {
  PlatformService,
  platformCollections,
  type PlatformAnnouncement,
} from "../../domains/platform";
import { usePlatformRecords } from "../../domains/platform/presentation/usePlatformRecords";

export default function PlatformAnnouncementsPage() {
  const state = usePlatformRecords(PlatformService.listAnnouncements);

  return (
    <PlatformCollectionPage<PlatformAnnouncement>
      title="Platform Announcements"
      subtitle="Publish maintenance notices, releases and promotions."
      records={state.records}
      loading={state.loading}
      error={state.error}
      onRefresh={state.refresh}
      createLabel="New announcement"
      emptyMessage="No platform announcements found."
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "body", label: "Message", type: "textarea", required: true },
        {
          key: "audience",
          label: "Audience",
          type: "select",
          defaultValue: "all",
          options: [
            { label: "Everyone", value: "all" },
            { label: "Institutions", value: "institutions" },
            { label: "Tutors", value: "tutors" },
            { label: "Students", value: "students" },
          ],
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          defaultValue: "draft",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Archived", value: "archived" },
          ],
        },
      ]}
      onCreate={async (payload) => {
        await PlatformService.create(platformCollections.announcements, payload);
      }}
      onRemove={async (record) => {
        await PlatformService.remove(platformCollections.announcements, record.id);
      }}
      getTitle={(record) => record.title}
      getSubtitle={(record) => `${record.audience} · ${record.body.slice(0, 100)}`}
      getBadge={(record) => record.status}
    />
  );
}
