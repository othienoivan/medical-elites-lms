import { Layers, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function ModuleManagerPage() {
  const navigate = useNavigate();

  return (
    <TutorLayout
      title="Module Manager"
      subtitle="Manage modules under each course unit."
    >
      <div className="mb-6 flex justify-end">
        <Button className="gap-2">
          <Plus size={18} />
          New Module
        </Button>
      </div>

      <Card className="text-center">
        <Layers className="mx-auto text-slate-400" size={48} />

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Module management coming next
        </h2>

        <p className="mt-2 text-slate-600">
          Tutors will create, edit, publish, and arrange modules here.
        </p>

        <Button
          variant="outline"
          className="mt-6"
          onClick={() => navigate("/tutor")}
        >
          Back to Academic Portal
        </Button>
      </Card>
    </TutorLayout>
  );
}