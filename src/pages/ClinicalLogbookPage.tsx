import {
  Activity,
  CheckCircle2,
  Clock3,
  FilePlus2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { useStudentClinicalLogbook } from "../hooks/useClinicalLogbook";
import type {
  ClinicalEntryStatus,
  ClinicalLogbookEntry,
} from "../models/ClinicalLogbook";

export default function ClinicalLogbookPage() {
  const navigate = useNavigate();
  const { entries, loading, error } = useStudentClinicalLogbook();

  const stats = useMemo(() => {
    const count = (status: ClinicalEntryStatus) =>
      entries.filter((entry) => entry.status === status).length;

    const approvedEntries = entries.filter((entry) => entry.status === "approved");
    return {
      total: entries.length,
      approved: count("approved"),
      pending: count("submitted"),
      returned: count("returned"),
      rejected: count("rejected"),
      approvedHours: approvedEntries.reduce((sum, entry) => sum + (Number(entry.clinicalHours) || 0), 0),
      competent: approvedEntries.filter((entry) => entry.competencyLevel === "competent" || entry.competencyLevel === "proficient").length,
    };
  }, [entries]);

  return (
    <main className="min-h-screen bg-slate-100">
      <Container className="py-10">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Clinical Logbook</h1>
              <p className="mt-2 max-w-3xl text-blue-100">
                Record clinical encounters, submit procedures for verification,
                and monitor your competency progress.
              </p>
            </div>
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/clinical-logbook/new")}
            >
              <FilePlus2 size={18} /> New Clinical Entry
            </Button>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <StatCard title="Total" value={stats.total} icon={Activity} />
          <StatCard title="Approved" value={stats.approved} icon={CheckCircle2} />
          <StatCard title="Pending" value={stats.pending} icon={Clock3} />
          <StatCard title="Returned" value={stats.returned} icon={RotateCcw} />
          <StatCard title="Rejected" value={stats.rejected} icon={XCircle} /><StatCard title="Approved Hours" value={stats.approvedHours} icon={Clock3} /><StatCard title="Competent" value={stats.competent} icon={CheckCircle2} />
        </section>

        {error && (
          <Card className="mt-6 border border-red-200 text-red-700">{error}</Card>
        )}

        <Card className="mt-8 overflow-x-auto p-0">
          {loading ? (
            <div className="p-10 text-center text-slate-600">Loading clinical entries...</div>
          ) : entries.length === 0 ? (
            <div className="p-10 text-center">
              <Activity className="mx-auto text-slate-400" size={48} />
              <h2 className="mt-4 text-xl font-bold text-slate-900">No clinical entries yet</h2>
              <p className="mt-2 text-slate-600">Create your first procedure or patient encounter.</p>
            </div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-100 text-left text-sm text-slate-600">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Procedure</th>
                  <th className="px-5 py-4">Site / Department</th>
                  <th className="px-5 py-4">Supervisor</th><th className="px-5 py-4">Participation / Hours</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Tutor Comment</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </Container>
    </main>
  );
}

function EntryRow({ entry }: { entry: ClinicalLogbookEntry }) {
  return (
    <tr className="border-t border-slate-200 align-top">
      <td className="px-5 py-4 text-slate-600">{entry.procedureDate}</td>
      <td className="px-5 py-4">
        <p className="font-bold text-slate-900">{entry.procedureName}</p>
        <p className="mt-1 text-sm text-slate-500">{entry.procedureCategory}</p>
      </td>
      <td className="px-5 py-4 text-slate-600">
        {entry.clinicalSite}
        <span className="block text-sm">{entry.department}</span>
      </td>
      <td className="px-5 py-4 text-slate-600">{entry.supervisorName || "Not recorded"}</td><td className="px-5 py-4 text-slate-600 capitalize">{(entry.participationLevel || "not set").replaceAll("-", " ")}<span className="block text-sm">{entry.clinicalHours || 0} hour(s)</span></td>
      <td className="px-5 py-4"><StatusBadge status={entry.status} /><span className="mt-2 block text-xs capitalize text-slate-500">{(entry.competencyLevel || "not-assessed").replaceAll("-", " ")}</span></td>
      <td className="max-w-sm px-5 py-4 text-sm text-slate-600">
        {entry.tutorComment || "—"}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: ClinicalEntryStatus }) {
  const classes: Record<ClinicalEntryStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    submitted: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-700",
    returned: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${classes[status]}`}>{status}</span>;
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) {
  return (
    <Card>
      <Icon size={28} className="text-blue-700" />
      <p className="mt-3 text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </Card>
  );
}
