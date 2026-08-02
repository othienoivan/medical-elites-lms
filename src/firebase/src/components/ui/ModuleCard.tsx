import { CheckCircle2, Clock, Lock, LockOpen, PlayCircle, Trophy } from "lucide-react";

import type { Module } from "../../models/Module";
import Button from "./Button";
import Card from "./Card";

export type ModuleLearningState = "not-started" | "in-progress" | "completed";

type ModuleCardProps = {
  module: Module;
  isUnlocked: boolean;
  learningState?: ModuleLearningState;
  onStart: () => void;
  lessonCount?: number;
};

function actionLabel(state: ModuleLearningState): string {
  if (state === "completed") return "Review Module";
  if (state === "in-progress") return "Continue Learning";
  return "Start Module";
}

export default function ModuleCard({
  module,
  isUnlocked,
  learningState = "not-started",
  onStart,
  lessonCount,
}: ModuleCardProps) {
  const completed = learningState === "completed";

  return (
    <Card
      className={
        isUnlocked
          ? completed
            ? "border border-emerald-200"
            : "border border-blue-100"
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
              {module.duration} • {lessonCount ?? module.lessons ?? 0} lesson
              {(lessonCount ?? module.lessons ?? 0) !== 1 ? "s" : ""}
            </p>

            <p className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              Pass mark: {module.passMark}%
            </p>

            {completed && (
              <p className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={16} /> Module completed
              </p>
            )}
          </div>
        </div>

        <div className={`rounded-full p-3 ${completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
          {completed ? <CheckCircle2 size={22} /> : isUnlocked ? <LockOpen size={22} /> : <Lock size={22} />}
        </div>
      </div>

      <Button
        className="mt-6 w-full"
        variant={isUnlocked ? "primary" : "outline"}
        disabled={!isUnlocked}
        onClick={onStart}
      >
        {isUnlocked ? (
          <>
            <PlayCircle size={17} /> {actionLabel(learningState)}
          </>
        ) : (
          "Locked"
        )}
      </Button>
    </Card>
  );
}
