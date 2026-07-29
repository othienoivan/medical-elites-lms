import { Activity, BarChart3, BookOpen, GraduationCap } from "lucide-react";
import StatWidget from "../dashboard/StatWidget";
import WidgetGrid from "../dashboard/WidgetGrid";
import type { AnalyticsKpi } from "../../services/analytics";

const icons = [GraduationCap, Activity, BookOpen, BarChart3];

export default function AnalyticsKpiGrid({ kpis }: { kpis: AnalyticsKpi[] }) {
  return (
    <WidgetGrid>
      {kpis.map((kpi, index) => (
        <StatWidget key={kpi.id} title={kpi.label} value={kpi.value} helper={kpi.helper} icon={icons[index % icons.length]} tone={kpi.tone} />
      ))}
    </WidgetGrid>
  );
}
