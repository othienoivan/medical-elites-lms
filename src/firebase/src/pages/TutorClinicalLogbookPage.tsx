import {
  Activity,
  CheckCircle2,
  Clock3,
  Search,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useTutorClinicalLogbook } from "../hooks/useClinicalLogbook";
import type {
  ClinicalEntryStatus,
  ClinicalLogbookEntry,
} from "../models/ClinicalLogbook";

export default function TutorClinicalLogbookPage() {
  const navigate = useNavigate();
  const { entries, loading, error } = useTutorClinicalLogbook();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ClinicalEntryStatus>("submitted");

  const filteredEntries = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      const matchesSearch = !keyword ||
        entry.studentName.toLowerCase().includes(keyword) ||
        entry.registrationNumber.toLowerCase().includes(keyword) ||
        entry.procedureName.toLowerCase().includes(keyword) ||
        entry.clinicalSite.toLowerCase().includes(keyword);
      return matchesStatus && matchesSearch;
    });
  }, [entries, search, statusFilter]);

  const count = (status: ClinicalEntryStatus) => entries.filter((entry) => entry.status === status).length;

  return (
    <TutorLayout
      title="Clinical Logbook Review"
      subtitle="Verify procedures, provide feedback and monitor clinical competency development."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <h2 className="text-3xl font-bold">Clinical Review Queue</h2>
        <p className="mt-2 max-w-3xl text-blue-100">Review submitted clinical encounters while protecting patient confidentiality.</p>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-5">
        <StatCard title="Total" value={entries.length} icon={Activity} />
        <StatCard title="Pending" value={count("submitted")} icon={Clock3} />
        <StatCard title="Approved" value={count("approved")} icon={CheckCircle2} />
        <StatCard title="Returned" value={count("returned")} icon={RotateCcw} />
        <StatCard title="Rejected" value={count("rejected")} icon={XCircle} />
      </section>

      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student, procedure or clinical site" className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | ClinicalEntryStatus)} className="rounded-xl border border-slate-300 px-4 py-3">
            <option value="all">All statuses</option>
            <option value="submitted">Pending review</option>
            <option value="approved">Approved</option>
            <option value="returned">Returned</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      {error && <Card className="mb-6 border border-red-200 text-red-700">{error}</Card>}

      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="p-10 text-center text-slate-600">Loading clinical entries...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-10 text-center text-slate-600">No clinical entries match the selected filter.</div>
        ) : (
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-100 text-left text-sm text-slate-600">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Procedure</th>
                <th className="px-5 py-4">Clinical Site</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <ReviewRow key={entry.id} entry={entry} onOpen={() => navigate(`/tutor/clinical-logbook/${entry.id}/review`)} />
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </TutorLayout>
  );
}

function ReviewRow({ entry, onOpen }: { entry: ClinicalLogbookEntry; onOpen: () => void }) {
  return (
    <tr className="border-t border-slate-200 align-top">
      <td className="px-5 py-4"><p className="font-bold text-slate-900">{entry.studentName}</p><p className="text-sm text-slate-500">{entry.registrationNumber}</p></td>
      <td className="px-5 py-4"><p className="font-semibold text-slate-900">{entry.procedureName}</p><p className="text-sm text-slate-500">{entry.procedureCategory}</p></td>
      <td className="px-5 py-4 text-slate-600">{entry.clinicalSite}<span className="block text-sm">{entry.department}</span></td>
      <td className="px-5 py-4 text-slate-600">{entry.procedureDate}</td>
      <td className="px-5 py-4"><StatusBadge status={entry.status} /></td>
      <td className="px-5 py-4"><Button size="sm" onClick={onOpen}>{entry.status === "submitted" ? "Review" : "Open"}</Button></td>
    </tr>
  );
}

function StatusBadge({ status }: { status: ClinicalEntryStatus }) {
  const classes: Record<ClinicalEntryStatus, string> = {
    draft: "bg-slate-100 text-slate-700", submitted: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-700", returned: "bg-blue-100 text-blue-700", rejected: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${classes[status]}`}>{status}</span>;
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) {
  return <Card><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div><Icon size={30} className="text-blue-700" /></div></Card>;
}
