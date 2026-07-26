import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import useProgrammes from "../../hooks/useProgrammes";
import useAuth from "../../hooks/useAuth";
import type {
  CurriculumComparisonSummary,
  CurriculumImportDecision,
  CurriculumImportDraft,
  CurriculumImportSummary,
  CurriculumValidationReport,
} from "../../models/CurriculumImport";
import { extractCurriculumText, parseCurriculumHeuristically } from "../../utils/curriculumParser";
import { analyseCurriculumWithAi } from "../../services/curriculumAi";
import { compareCurriculumDraft, importCurriculumDraft, validateCurriculumDraft } from "../../firebase/curriculumImport";

const uid = () => crypto.randomUUID();
const decisions: Array<{ value: CurriculumImportDecision; label: string }> = [
  { value: "create", label: "Create new" },
  { value: "merge", label: "Merge/update" },
  { value: "skip", label: "Skip" },
];

export default function CurriculumImportPanel() {
  const { programmes, loading: programmesLoading } = useProgrammes();
  const { currentUser, userProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [programmeId, setProgrammeId] = useState("");
  const [draft, setDraft] = useState<CurriculumImportDraft | null>(null);
  const [comparison, setComparison] = useState<CurriculumComparisonSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("Upload a curriculum to begin.");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [validation, setValidation] = useState<CurriculumValidationReport | null>(null);
  const [importSummary, setImportSummary] = useState<CurriculumImportSummary | null>(null);

  const selectedProgramme = useMemo(
    () => programmes.find((programme) => programme.id === programmeId) ?? null,
    [programmes, programmeId]
  );
  const lowConfidenceCount = useMemo(() => {
    if (!draft) return 0;
    return draft.courseUnits.reduce(
      (count, unit) => count + Number((unit.confidence ?? 0) < 80) + unit.modules.filter((module) => (module.confidence ?? 0) < 80).length,
      Number((draft.programme.confidence ?? 0) < 80)
    );
  }, [draft]);

  async function handleFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setComparison(null);
    setValidation(null);
    setImportSummary(null);
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error("The curriculum file must not exceed 20 MB.");
      setStage("Extracting readable curriculum text…");
      const text = await extractCurriculumText(file);
      if (text.length < 20) throw new Error("No readable curriculum text was found in this file.");

      let nextDraft: CurriculumImportDraft;
      try {
        setStage("Medi is identifying programmes, course units, modules, hours and credits…");
        nextDraft = await analyseCurriculumWithAi(file.name, text);
        if (!nextDraft.courseUnits.length) throw new Error("No course units were returned by Medi.");
      } catch (aiError) {
        console.error("AI curriculum analysis failed; using heuristic parser.", aiError);
        const detail = aiError instanceof Error ? aiError.message : "Unknown AI service error";
        nextDraft = parseCurriculumHeuristically(file.name, text);
        nextDraft.warnings = [
          `AI analysis was unavailable: ${detail}`,
          "The fallback parser was used. Review every detected field before importing.",
          ...nextDraft.warnings,
        ];
      }

      if (!currentUser || !userProfile || (userProfile.role !== "admin" && userProfile.role !== "tutor")) {
        throw new Error("Your tutor or administrator profile must be active before comparing curricula.");
      }
      setStage("Comparing the proposed curriculum with existing records…");
      const comparisonResult = await compareCurriculumDraft(nextDraft, {
        uid: currentUser.uid,
        email: currentUser.email || userProfile.email,
        fullName: userProfile.fullName,
        role: userProfile.role,
        institutionId: userProfile.institutionId,
      });
      setDraft(nextDraft);
      setComparison(comparisonResult);
      setValidation(null);
      setStage("Review and approve the extracted curriculum.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The curriculum could not be read.");
      setStage("Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function invalidateValidation() {
    setValidation(null);
    setResult(null);
  }

  function updateProgramme(field: string, value: string | number) {
    invalidateValidation();
    setDraft((current) => current ? { ...current, programme: { ...current.programme, [field]: value } } : current);
  }

  function updateCourseUnit(index: number, field: string, value: string | number | CurriculumImportDecision) {
    invalidateValidation();
    setDraft((current) => current ? {
      ...current,
      courseUnits: current.courseUnits.map((unit, unitIndex) => unitIndex === index ? { ...unit, [field]: value } : unit),
    } : current);
  }

  function updateModule(unitIndex: number, moduleIndex: number, field: string, value: string | number | CurriculumImportDecision) {
    invalidateValidation();
    setDraft((current) => current ? {
      ...current,
      courseUnits: current.courseUnits.map((unit, currentUnitIndex) => currentUnitIndex === unitIndex ? {
        ...unit,
        modules: unit.modules.map((module, currentModuleIndex) => currentModuleIndex === moduleIndex ? { ...module, [field]: value } : module),
      } : unit),
    } : current);
  }

  async function handleValidate() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setStage("Validating curriculum without writing data…");
    try {
      const report = await validateCurriculumDraft(draft, comparison);
      setValidation(report);
      setStage(report.valid ? "Validation passed. Review warnings, then import." : "Validation found errors that must be corrected.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Curriculum validation failed.");
      setStage("Validation failed.");
    } finally {
      setBusy(false);
    }
  }

  function downloadImportReport() {
    if (!importSummary || !draft) return;
    const payload = {
      generatedAt: new Date().toISOString(),
      sourceFileName: draft.sourceFileName,
      programme: draft.programme.title,
      analysisMethod: draft.analysisMethod,
      ...importSummary,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.programme.title || "curriculum"}-import-report.json`.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    if (!draft || !currentUser) return;
    if (!draft.programme.title.trim()) {
      setError("Programme title is required before importing.");
      return;
    }
    const validUnits = draft.courseUnits.filter((unit) => unit.title.trim() && unit.decision !== "skip");
    if (!validUnits.length) {
      setError("Keep at least one course unit before importing.");
      return;
    }
    setBusy(true);
    setError(null);
    setStage("Writing the approved curriculum to Firestore…");
    try {
      if (!validation?.valid) throw new Error("Validate the curriculum successfully before importing.");
      if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "tutor")) {
        throw new Error("Your user profile is not authorized to import curricula.");
      }
      await currentUser.getIdToken(true);
      const summary = await importCurriculumDraft(
        { ...draft, courseUnits: validUnits },
        selectedProgramme,
        {
          uid: currentUser.uid,
          email: currentUser.email || userProfile.email,
          fullName: userProfile.fullName,
          role: userProfile.role,
          institutionId: userProfile.institutionId,
        }
      );
      setImportSummary(summary);
      setResult(
        `${summary.programmeCreated ? "Programme created. " : ""}${summary.courseUnitsCreated} course unit(s) created, ${summary.courseUnitsMerged} updated, ${summary.modulesCreated} module(s) created and ${summary.modulesMerged} updated. ${summary.duplicatesSkipped} item(s) skipped.`
      );
      setStage("Import completed successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The curriculum import failed.");
      setStage("Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700"><Brain size={26} /></div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">AI Curriculum Import Wizard</h2>
                <p className="mt-1 text-slate-600">Upload an approved PDF, DOCX or TXT curriculum. Nothing is saved until you review and approve it.</p>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-violet-700">{stage}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
            <Button onClick={() => inputRef.current?.click()} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              Upload Curriculum
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Import destination</span>
            <select value={programmeId} onChange={(event) => setProgrammeId(event.target.value)} disabled={programmesLoading} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4">
              <option value="">Create or detect programme automatically</option>
              {programmes.map((programme) => <option key={programme.id} value={programme.id}>{programme.title}</option>)}
            </select>
          </label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            AI extracts programme details, years, semesters, course units, credit units, contact hours, learning outcomes, modules and topics. Low-confidence fields are highlighted for review.
          </div>
        </div>
      </Card>

      {error && <Card className="border border-red-200 bg-red-50 text-red-800"><div className="flex gap-3"><AlertTriangle className="shrink-0" /><p>{error}</p></div></Card>}
      {result && <Card className="border border-emerald-200 bg-emerald-50 text-emerald-800"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-3"><CheckCircle2 className="shrink-0" /><p>{result}</p></div>{importSummary && <Button variant="outline" className="gap-2" onClick={downloadImportReport}><Download size={17} /> Download report</Button>}</div></Card>}

      {comparison && draft && (
        <Card>
          <h2 className="text-xl font-bold text-slate-950">Curriculum comparison</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="New course units" value={comparison.newCourseUnits} />
            <Metric label="Matching units" value={comparison.matchingCourseUnits} />
            <Metric label="Changed units" value={comparison.changedCourseUnits} />
            <Metric label="New modules" value={comparison.newModules} />
            <Metric label="Matching modules" value={comparison.matchingModules} />
          </div>
          {lowConfidenceCount > 0 && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">{lowConfidenceCount} field group(s) have confidence below 80%. Review them carefully before import.</p>}
        </Card>
      )}

      {draft && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Human review</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className={`rounded-full px-3 py-1 font-bold ${draft.analysisMethod === "ai" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  Analysis method: {draft.analysisMethod === "ai" ? "AI" : "Heuristic fallback"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Provider: {draft.aiProvider || "Local parser"}</span>
                {draft.analysisDurationMs != null && <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Analysis time: {(draft.analysisDurationMs / 1000).toFixed(1)}s</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void handleValidate()} disabled={busy} className="gap-2"><CheckCircle2 size={18} /> Validate Curriculum</Button>
              <Button onClick={() => void handleImport()} disabled={busy || !validation?.valid} className="gap-2"><Sparkles size={18} /> Approve and Import</Button>
            </div>
          </div>

          {draft.warnings.length > 0 && <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{draft.warnings.map((warning) => <p key={warning}>• {warning}</p>)}</div>}

          {validation && (
            <section className={`mt-5 rounded-2xl border p-5 ${validation.valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-lg font-bold text-slate-950">Dry-run validation</h3><p className="text-sm text-slate-600">No data was written during this validation.</p></div>
                <span className={`rounded-full px-4 py-2 text-sm font-black ${validation.readinessScore >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>Readiness {validation.readinessScore}%</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Metric label="Course units" value={validation.courseUnitCount} />
                <Metric label="Modules" value={validation.moduleCount} />
                <Metric label="Learning outcomes" value={validation.learningOutcomeCount} />
                <Metric label="Duplicates" value={validation.duplicateCount} />
                <Metric label="Low confidence" value={validation.lowConfidenceCount} />
              </div>
              {validation.issues.length > 0 && <div className="mt-4 space-y-2 text-sm">{validation.issues.map((issue, index) => <p key={`${issue.code}-${index}`} className={issue.severity === "error" ? "font-semibold text-red-800" : "text-amber-900"}>• {issue.message}</p>)}</div>}
            </section>
          )}

          <CurriculumMap draft={draft} />

          <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold text-slate-950">Programme</h3><Confidence value={draft.programme.confidence} /></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Programme title" value={draft.programme.title} onChange={(value) => updateProgramme("title", value)} />
              <Field label="Code" value={draft.programme.code || ""} onChange={(value) => updateProgramme("code", value)} />
              <Field label="Award" value={draft.programme.award || ""} onChange={(value) => updateProgramme("award", value)} />
              <NumberField label="Duration (years)" value={draft.programme.durationYears} onChange={(value) => updateProgramme("durationYears", value)} />
              <Field label="Department" value={draft.programme.department || ""} onChange={(value) => updateProgramme("department", value)} />
            </div>
          </section>

          <div className="mt-6 space-y-5">
            {draft.courseUnits.map((unit, unitIndex) => (
              <section key={unit.tempId} className={`rounded-2xl border p-5 ${(unit.confidence ?? 0) < 80 ? "border-amber-300 bg-amber-50/40" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><FileText className="text-violet-700" /><h3 className="text-lg font-bold text-slate-950">Course Unit {unitIndex + 1}</h3><Confidence value={unit.confidence} /></div>
                  <DecisionSelect value={unit.decision || "create"} onChange={(value) => updateCourseUnit(unitIndex, "decision", value)} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Field label="Title" value={unit.title} onChange={(value) => updateCourseUnit(unitIndex, "title", value)} />
                  <Field label="Code" value={unit.code || ""} onChange={(value) => updateCourseUnit(unitIndex, "code", value)} />
                  <NumberField label="Year of study" value={unit.yearOfStudy} onChange={(value) => updateCourseUnit(unitIndex, "yearOfStudy", value)} />
                  <NumberField label="Semester" value={unit.semester} onChange={(value) => updateCourseUnit(unitIndex, "semester", value)} />
                  <NumberField label="Credit units" value={unit.creditUnits} onChange={(value) => updateCourseUnit(unitIndex, "creditUnits", value)} />
                  <NumberField label="Contact hours" value={unit.contactHours} onChange={(value) => updateCourseUnit(unitIndex, "contactHours", value)} />
                  <NumberField label="Lecture hours" value={unit.lectureHours} onChange={(value) => updateCourseUnit(unitIndex, "lectureHours", value)} />
                  <NumberField label="Tutorial hours" value={unit.tutorialHours} onChange={(value) => updateCourseUnit(unitIndex, "tutorialHours", value)} />
                  <NumberField label="Practical hours" value={unit.practicalHours} onChange={(value) => updateCourseUnit(unitIndex, "practicalHours", value)} />
                  <NumberField label="Clinical hours" value={unit.clinicalHours} onChange={(value) => updateCourseUnit(unitIndex, "clinicalHours", value)} />
                  <NumberField label="Assessment hours" value={unit.assessmentHours} onChange={(value) => updateCourseUnit(unitIndex, "assessmentHours", value)} />
                </div>
                <label className="mt-3 block"><span className="text-sm font-semibold text-slate-700">Description</span><textarea value={unit.description} onChange={(event) => updateCourseUnit(unitIndex, "description", event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border border-slate-300 bg-white p-3" /></label>
                <div className="mt-5 flex items-center justify-between"><h4 className="font-bold text-slate-800">Modules</h4><button type="button" onClick={() => setDraft((current) => current ? { ...current, courseUnits: current.courseUnits.map((currentUnit, index) => index === unitIndex ? { ...currentUnit, modules: [...currentUnit.modules, { tempId: uid(), title: "", description: "", confidence: 100, decision: "create" }] } : currentUnit) } : current)} className="flex items-center gap-1 text-sm font-semibold text-violet-700"><Plus size={16} /> Add module</button></div>
                <div className="mt-3 space-y-3">
                  {unit.modules.map((module, moduleIndex) => (
                    <div key={module.tempId} className={`grid gap-2 rounded-xl border bg-white p-3 lg:grid-cols-[120px_1fr_110px_140px_auto] ${(module.confidence ?? 0) < 80 ? "border-amber-300" : "border-slate-200"}`}>
                      <input placeholder="Code" value={module.code || ""} onChange={(event) => updateModule(unitIndex, moduleIndex, "code", event.target.value)} className="min-h-10 rounded-lg border border-slate-300 px-3" />
                      <input placeholder="Module title" value={module.title} onChange={(event) => updateModule(unitIndex, moduleIndex, "title", event.target.value)} className="min-h-10 rounded-lg border border-slate-300 px-3" />
                      <input type="number" min="0" placeholder="Hours" value={module.estimatedHours ?? ""} onChange={(event) => updateModule(unitIndex, moduleIndex, "estimatedHours", Number(event.target.value))} className="min-h-10 rounded-lg border border-slate-300 px-3" />
                      <DecisionSelect value={module.decision || "create"} onChange={(value) => updateModule(unitIndex, moduleIndex, "decision", value)} />
                      <button type="button" aria-label="Delete module" onClick={() => setDraft((current) => current ? { ...current, courseUnits: current.courseUnits.map((currentUnit, index) => index === unitIndex ? { ...currentUnit, modules: currentUnit.modules.filter((_, currentModuleIndex) => currentModuleIndex !== moduleIndex) } : currentUnit) } : current)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <Button variant="outline" className="gap-2" onClick={() => setDraft((current) => current ? { ...current, courseUnits: [...current.courseUnits, { tempId: uid(), title: "", description: "", modules: [], confidence: 100, decision: "create" }] } : current)}><Plus size={18} /> Add course unit</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function CurriculumMap({ draft }: { draft: CurriculumImportDraft }) {
  const groups = new Map<string, typeof draft.courseUnits>();
  draft.courseUnits.filter((unit) => unit.decision !== "skip").forEach((unit) => {
    const key = `Year ${unit.yearOfStudy || "?"} • Semester ${unit.semester || "?"}`;
    groups.set(key, [...(groups.get(key) || []), unit]);
  });
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-bold text-slate-950">Curriculum mapping preview</h3>
      <p className="mt-1 text-sm text-slate-600">Preview the proposed hierarchy before any records are written.</p>
      <div className="mt-4 space-y-4">
        <p className="font-black text-violet-800">{draft.programme.title || "Untitled programme"}</p>
        {[...groups.entries()].map(([group, units]) => (
          <div key={group} className="ml-4 border-l-2 border-violet-200 pl-4">
            <p className="font-bold text-slate-800">{group}</p>
            <div className="mt-2 space-y-2">{units.map((unit) => <div key={unit.tempId}><p className="font-semibold text-slate-700">{unit.code ? `${unit.code} — ` : ""}{unit.title}</p>{unit.modules.filter((module) => module.decision !== "skip").length > 0 && <p className="ml-4 text-sm text-slate-500">{unit.modules.filter((module) => module.decision !== "skip").map((module) => module.title).join(" • ")}</p>}</div>)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="space-y-2"><span className="text-sm font-semibold text-slate-700">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" /></label>;
}
function NumberField({ label, value, onChange }: { label: string; value?: number; onChange: (value: number) => void }) {
  return <label className="space-y-2"><span className="text-sm font-semibold text-slate-700">{label}</span><input type="number" min="0" value={value ?? ""} onChange={(event) => onChange(Number(event.target.value))} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" /></label>;
}
function DecisionSelect({ value, onChange }: { value: CurriculumImportDecision; onChange: (value: CurriculumImportDecision) => void }) {
  return <select value={value} onChange={(event) => onChange(event.target.value as CurriculumImportDecision)} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium">{decisions.map((decision) => <option key={decision.value} value={decision.value}>{decision.label}</option>)}</select>;
}
function Confidence({ value }: { value?: number }) {
  const score = Math.round(value ?? 0);
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${score >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{score}% confidence</span>;
}
function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p></div>;
}
