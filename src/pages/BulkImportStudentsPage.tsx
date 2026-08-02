import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileSpreadsheet, Upload, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useCourseUnits from "../hooks/useCourseUnits";
import useProgrammes from "../hooks/useProgrammes";
import useStudents from "../hooks/useStudents";
import { suggestedCourseUnitIds } from "../utils/academicPlacement";
import { downloadStudentImportTemplate, parseStudentImportFile, type StudentImportRow } from "../utils/studentImport";

export default function BulkImportStudentsPage() {
  const navigate = useNavigate();
  const { students, createStudent } = useStudents();
  const { programmes } = useProgrammes(true);
  const { courseUnits } = useCourseUnits(true);
  const [rows, setRows] = useState<StudentImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [results, setResults] = useState<Array<{ row: number; success: boolean; message: string }>>([]);

  const reviewedRows = useMemo(() => {
    const registrationNumbers = new Set(students.map((item) => item.registrationNumber.trim().toLowerCase()).filter(Boolean));
    const emails = new Set(students.map((item) => item.email.trim().toLowerCase()).filter(Boolean));
    const seenRegistrations = new Set<string>();
    const seenEmails = new Set<string>();

    return rows.map((row) => {
      const errors = [...row.errors];
      const reg = row.registrationNumber.trim().toLowerCase();
      const email = row.email.trim().toLowerCase();
      const programme = programmes.find((item) =>
        item.id === row.programme || item.title.trim().toLowerCase() === row.programme.trim().toLowerCase()
      );

      if (!programme) errors.push(`Programme “${row.programme}” was not found.`);
      if (reg && (registrationNumbers.has(reg) || seenRegistrations.has(reg))) errors.push("Registration number already exists or is duplicated in this file.");
      if (email && (emails.has(email) || seenEmails.has(email))) errors.push("Email already exists or is duplicated in this file.");
      if (reg) seenRegistrations.add(reg);
      if (email) seenEmails.add(email);

      return { ...row, errors, programmeId: programme?.id ?? "", programmeTitle: programme?.title ?? row.programme };
    });
  }, [rows, students, programmes]);

  const validRows = reviewedRows.filter((row) => row.errors.length === 0);

  async function handleFile(file?: File) {
    if (!file) return;
    try {
      setParsing(true);
      setResults([]);
      setFileName(file.name);
      setRows(await parseStudentImportFile(file));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to read the selected file.");
      setRows([]);
    } finally {
      setParsing(false);
    }
  }

  async function runImport() {
    if (validRows.length === 0) return;
    if (!window.confirm(`Import ${validRows.length} validated student record(s)? Invalid rows will be skipped.`)) return;

    setImporting(true);
    setResults([]);
    setProgress({ completed: 0, total: validRows.length });
    const nextResults: Array<{ row: number; success: boolean; message: string }> = [];

    for (const row of validRows) {
      try {
        await createStudent({
          fullName: row.fullName,
          gender: row.gender,
          dateOfBirth: row.dateOfBirth,
          nationalId: row.nationalId,
          registrationNumber: row.registrationNumber,
          studentNumber: row.studentNumber,
          programmeId: row.programmeId,
          programmeTitle: row.programmeTitle,
          academicYear: row.academicYear,
          intake: row.intake,
          yearOfStudy: row.yearOfStudy,
          semester: row.semester,
          email: row.email,
          phone: row.phone,
          guardianName: row.guardianName,
          guardianPhone: row.guardianPhone,
          emergencyContact: row.emergencyContact,
          sponsor: row.sponsor,
          admissionDate: row.admissionDate,
          status: row.status,
          assignedCourseUnitIds: suggestedCourseUnitIds(courseUnits, row.programmeId, row.yearOfStudy, row.semester),
          onboardingSource: "admin",
        });
        nextResults.push({ row: row.rowNumber, success: true, message: `${row.fullName} imported.` });
      } catch (error) {
        nextResults.push({ row: row.rowNumber, success: false, message: error instanceof Error ? error.message : "Import failed." });
      }
      setProgress((current) => ({ ...current, completed: current.completed + 1 }));
    }

    setResults(nextResults);
    setImporting(false);
  }

  return (
    <TutorLayout title="Bulk Import Students" subtitle="Validate and register multiple learners from Excel or CSV.">
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-3xl font-bold">Student Bulk Registration</h2><p className="mt-2 text-blue-100">Upload a standard spreadsheet, review validation errors and import clean records.</p></div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={downloadStudentImportTemplate}><Download size={18}/>Download Template</Button>
            <Button variant="outline" className="border-white text-white" onClick={() => navigate("/tutor/students")}><ArrowLeft size={18}/>Directory</Button>
          </div>
        </div>
      </section>

      <Card className="mb-6">
        <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center hover:border-blue-500">
          <FileSpreadsheet size={42} className="text-blue-700" />
          <span className="mt-3 font-bold text-slate-900">Choose an Excel or CSV file</span>
          <span className="mt-1 text-sm text-slate-500">Supported: .xlsx, .xls and .csv</span>
          <input type="file" className="hidden" accept=".xlsx,.xls,.csv" disabled={parsing || importing} onChange={(event) => void handleFile(event.target.files?.[0])}/>
        </label>
        {fileName && <p className="mt-3 text-sm text-slate-600">Selected: <strong>{fileName}</strong></p>}
      </Card>

      {rows.length > 0 && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Summary title="Rows" value={reviewedRows.length} icon={Users}/>
            <Summary title="Ready" value={validRows.length} icon={CheckCircle2}/>
            <Summary title="Needs correction" value={reviewedRows.length - validRows.length} icon={AlertTriangle}/>
          </div>

          <Card className="mb-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="border-b text-slate-600"><th className="p-3">Row</th><th className="p-3">Student</th><th className="p-3">Registration</th><th className="p-3">Programme</th><th className="p-3">Placement</th><th className="p-3">Validation</th></tr></thead>
              <tbody>{reviewedRows.map((row) => <tr key={row.rowNumber} className="border-b align-top"><td className="p-3">{row.rowNumber}</td><td className="p-3"><strong>{row.fullName || "—"}</strong><div className="text-slate-500">{row.email || "No email"}</div></td><td className="p-3">{row.registrationNumber || "—"}</td><td className="p-3">{row.programmeTitle || row.programme || "—"}</td><td className="p-3">{[row.yearOfStudy, row.semester].filter(Boolean).join(" · ") || "—"}</td><td className="p-3">{row.errors.length === 0 ? <span className="font-semibold text-emerald-700">Ready</span> : <ul className="space-y-1 text-red-700">{row.errors.map((error) => <li key={error}>{error}</li>)}</ul>}</td></tr>)}</tbody>
            </table>
          </Card>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-600">Only validated rows will be imported. This creates LMS student records; account invitations remain a separate administrator action.</p>
            <Button onClick={() => void runImport()} disabled={importing || validRows.length === 0}><Upload size={18}/>{importing ? `Importing ${progress.completed}/${progress.total}` : `Import ${validRows.length} Students`}</Button>
          </div>
        </>
      )}

      {results.length > 0 && <Card><h3 className="text-lg font-bold">Import Results</h3><div className="mt-4 space-y-2">{results.map((result) => <div key={`${result.row}-${result.message}`} className={result.success ? "text-emerald-700" : "text-red-700"}>Row {result.row}: {result.message}</div>)}</div></Card>}
    </TutorLayout>
  );
}

function Summary({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Users }) {
  return <Card><div className="flex items-center gap-3"><Icon className="text-blue-700"/><div><div className="text-sm text-slate-500">{title}</div><div className="text-2xl font-bold">{value}</div></div></div></Card>;
}
