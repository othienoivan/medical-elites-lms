import { Clock, Lock, LockOpen, Trophy } from "lucide-react";

import type { Module } from "../../models/Module";
import Button from "./Button";
import Card from "./Card";

type ModuleCardProps = {
  module: Module;
  isUnlocked: boolean;
  onStart: () => void;
};

export default function ModuleCard({
  module,
  isUnlocked,
  onStart,
}: ModuleCardProps) {
  return (
    <Card
      className={
        isUnlocked
          ? "border border-blue-100"
          : "border border-slate-200 opacity-70"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-700">
            Module {module.order}
          </p>

          <h3 className="mt-2 text-xl font-bold text-slate-950">
            {module.title}
          </h3>

          <p className="mt-3 leading-7 text-slate-600">
            {module.description}
          </p>

          <div className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
            <p className="flex items-center gap-2">
              <Clock size={16} className="text-blue-700" />
              {module.duration} • {module.lessons} lesson
              {module.lessons > 1 ? "s" : ""}
            </p>

            <p className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              Pass mark: {module.passMark}%
            </p>
          </div>
        </div>

        <div className="rounded-full bg-slate-100 p-3 text-slate-600">
          {isUnlocked ? <LockOpen size={22} /> : <Lock size={22} />}
        </div>
      </div>

      <Button
        className="mt-6 w-full"
        variant={isUnlocked ? "primary" : "outline"}
        disabled={!isUnlocked}
        onClick={onStart}
      >
        {isUnlocked ? "Start Module" : "Locked"}
      </Button>
    </Card>
  );
}