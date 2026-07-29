import { CheckCircle2 } from "lucide-react";

export type ActivityItem = {
  id: string;
  title: string;
  detail?: string;
};

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-500">No recent activity to show.</p>;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={19} />
          <div>
            <p className="font-semibold text-slate-900">{item.title}</p>
            {item.detail && <p className="mt-1 text-sm text-slate-500">{item.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
