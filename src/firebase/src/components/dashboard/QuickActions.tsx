import type { ElementType } from "react";

export type QuickAction = {
  label: string;
  description?: string;
  icon: ElementType;
  onClick: () => void;
};

export default function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="group flex min-h-20 items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="rounded-xl bg-white p-3 text-blue-700 shadow-sm transition group-hover:bg-blue-700 group-hover:text-white">
              <Icon size={21} />
            </span>
            <span>
              <span className="block font-bold text-slate-900">{action.label}</span>
              {action.description && <span className="mt-1 block text-xs text-slate-500">{action.description}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
