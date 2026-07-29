import { CalendarClock, MapPin } from "lucide-react";

export type MyDayItem = {
  id: string;
  time: string;
  title: string;
  meta?: string;
};

export default function MyDay({ items }: { items: MyDayItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
        <CalendarClock className="mx-auto text-slate-400" size={34} />
        <p className="mt-3 font-semibold text-slate-800">No scheduled activities today</p>
        <p className="mt-1 text-sm text-slate-500">Use this time for revision, planning, or clinical reflection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="min-w-16 rounded-xl bg-blue-100 px-3 py-2 text-center text-sm font-bold text-blue-700">{item.time}</div>
          <div>
            <p className="font-bold text-slate-900">{item.title}</p>
            {item.meta && <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} /> {item.meta}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
