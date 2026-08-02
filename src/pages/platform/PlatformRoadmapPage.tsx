import PlatformCollectionPage from "../../components/platform/PlatformCollectionPage";
import {
  PlatformService,
  platformCollections,
  type RoadmapItem,
} from "../../domains/platform";
import { usePlatformRecords } from "../../domains/platform/presentation/usePlatformRecords";

export default function PlatformRoadmapPage() {
  const state = usePlatformRecords(PlatformService.listRoadmap);

  return (
    <PlatformCollectionPage<RoadmapItem>
      title="Product Roadmap"
      subtitle="Track planned capabilities and institution demand."
      records={state.records}
      loading={state.loading}
      error={state.error}
      onRefresh={state.refresh}
      createLabel="Add roadmap item"
      emptyMessage="No roadmap items found."
      fields={[
        { key: "title", label: "Feature title", required: true },
        { key: "description", label: "Description", type: "textarea", required: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          defaultValue: "planned",
          options: [
            { label: "Planned", value: "planned" },
            { label: "In progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
          ],
        },
        { key: "targetRelease", label: "Target release" },
      ]}
      onCreate={async (payload) => {
        await PlatformService.create(platformCollections.roadmap, { ...payload, votes: 0 });
      }}
      onRemove={async (record) => {
        await PlatformService.remove(platformCollections.roadmap, record.id);
      }}
      getTitle={(record) => record.title}
      getSubtitle={(record) => `${record.votes || 0} votes · ${record.targetRelease || "No release target"}`}
      getBadge={(record) => record.status}
    />
  );
}
