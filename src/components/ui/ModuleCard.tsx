import { Lock, LockOpen, Trophy } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import type { CourseModule } from "../../models/Module";

type ModuleCardProps = {
  module: CourseModule;
  isUnlocked: boolean;
  onStart: () => void;
};

export default function ModuleCard({
  module,
  isUnlocked,
  onStart,
}: ModuleCardProps) {
  return (
    <Card className={isUnlocked ? "border border-blue-100" : "border border-slate-200 opacity-70"}>
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

          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Trophy size={16} className="text-amber-500" />
            Pass mark: {module.passMark}%
          </p>
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