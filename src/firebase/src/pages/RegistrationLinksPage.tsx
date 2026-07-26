import { Copy, Link2, Power, QrCode, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { createRegistrationLink, getMyRegistrationLinks, setRegistrationLinkStatus } from "../firebase/registrationLinks";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useModules from "../hooks/useModules";
import useProgrammes from "../hooks/useProgrammes";
import type { AcademicAllocationMode, RegistrationLink, RegistrationLinkType } from "../models/RegistrationLink";


function normalizeAcademicValue(value: unknown): string {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "";
  const roman: Record<string, string> = { i: "1", ii: "2", iii: "3", iv: "4", v: "5", vi: "6" };
  const cleaned = raw.replace(/academic|year of study|year|semester|sem|level/g, "").replace(/[^a-z0-9]/g, "");
  return roman[cleaned] ?? cleaned;
}

function isPublishedValue(value: unknown): boolean {
  return value === true || ["true", "published", "active", "1", "yes", "live"].includes(String(value ?? "").trim().toLowerCase());
}

function isPublishedCourseUnit(courseUnit: Record<string, unknown>, hasPublishedModule: boolean): boolean {
  return [courseUnit.published, courseUnit.isPublished, courseUnit.status, courseUnit.publicationStatus].some(isPublishedValue)
    || hasPublishedModule;
}

const linkTypes: { value: RegistrationLinkType; label: string }[] = [
  { value: "tutor", label: "Tutor link" },
  { value: "institution", label: "Institution link" },
  { value: "programme", label: "Programme-specific link" },
  { value: "class", label: "Class-specific link" },
  { value: "course-unit", label: "Course-unit link" },
];

export default function RegistrationLinksPage() {
  const { userProfile } = useAuth();
  const { programmes } = useProgrammes();
  const { courseUnits } = useCourseUnits(true);
  const { modules } = useModules();
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [name, setName] = useState("Student registration link");
  const [linkType, setLinkType] = useState<RegistrationLinkType>("class");
  const [programmeId, setProgrammeId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [semester, setSemester] = useState("");
  const [allocationMode, setAllocationMode] = useState<AcademicAllocationMode>("automatic");
  const [courseUnitIds, setCourseUnitIds] = useState<string[]>([]);
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [maximumRegistrations, setMaximumRegistrations] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const origin = useMemo(() => window.location.origin, []);
  const selectedProgramme = programmes.find((item) => item.id === programmeId);

  const requiresProgramme = linkType === "programme" || linkType === "class" || linkType === "course-unit";
  const requiresClassPlacement = linkType === "class";
  const requiresCourseUnits = linkType === "class" || linkType === "course-unit";

  const matchingCourseUnits = useMemo(() => courseUnits.filter((courseUnit) => {
    if (!programmeId || courseUnit.programmeId !== programmeId) return false;
    if (yearOfStudy && normalizeAcademicValue(courseUnit.yearOfStudy) !== normalizeAcademicValue(yearOfStudy)) return false;
    if (semester && normalizeAcademicValue(courseUnit.semester) !== normalizeAcademicValue(semester)) return false;
    return true;
  }), [courseUnits, programmeId, semester, yearOfStudy]);

  // Registration links must never assign draft curriculum. Legacy imports may
  // store publication state as a string, so normalise it before matching.
  const publishedModuleCourseUnitIds = useMemo(
    () => new Set(modules.map((module) => module.courseUnitId || module.courseId).filter(Boolean)),
    [modules]
  );

  const eligibleCourseUnits = useMemo(
    () => matchingCourseUnits.filter((courseUnit) =>
      isPublishedCourseUnit(
        courseUnit as unknown as Record<string, unknown>,
        publishedModuleCourseUnitIds.has(courseUnit.id)
      )
    ),
    [matchingCourseUnits, publishedModuleCourseUnitIds]
  );

  const unpublishedMatchingCount = matchingCourseUnits.length - eligibleCourseUnits.length;

  const validCourseUnitIds = useMemo(
    () => courseUnitIds.filter((id) => eligibleCourseUnits.some((unit) => unit.id === id)),
    [courseUnitIds, eligibleCourseUnits]
  );

  const eligibleModules = useMemo(() => modules.filter((module) => {
    const unitId = module.courseUnitId || module.courseId;
    return Boolean(unitId && validCourseUnitIds.includes(unitId));
  }), [modules, validCourseUnitIds]);

  const validModuleIds = useMemo(
    () => moduleIds.filter((id) => eligibleModules.some((module) => module.id === id)),
    [eligibleModules, moduleIds]
  );

  useEffect(() => {
    if (allocationMode !== "automatic") return;
    setCourseUnitIds(eligibleCourseUnits.map((unit) => unit.id));
  }, [allocationMode, eligibleCourseUnits]);

  useEffect(() => {
    if (allocationMode !== "automatic") return;
    setModuleIds(eligibleModules.map((module) => module.id));
  }, [allocationMode, eligibleModules]);

  useEffect(() => {
    if (linkType === "course-unit") setAllocationMode("manual");
    if (linkType === "class" || linkType === "programme") setAllocationMode("automatic");
    if (linkType === "tutor" || linkType === "institution") {
      setProgrammeId("");
      setYearOfStudy("");
      setSemester("");
      setCourseUnitIds([]);
      setModuleIds([]);
    }
  }, [linkType]);

  useEffect(() => {
    if (!userProfile) return;
    getMyRegistrationLinks(userProfile.uid).then(setLinks).catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load links."));
  }, [userProfile]);

  function toggleSelection(id: string, selected: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!userProfile) return;
    if (requiresProgramme && !programmeId) {
      setMessage("Select a programme before generating this type of link.");
      return;
    }
    if (requiresClassPlacement && (!yearOfStudy || !semester)) {
      setMessage("Select the student year of study and semester for a class-specific link.");
      return;
    }
    if (requiresCourseUnits && validCourseUnitIds.length === 0) {
      setMessage("Select at least one published course unit for this registration link.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const created = await createRegistrationLink(userProfile, {
        name: name.trim(),
        linkType,
        status: "active",
        institutionId: userProfile.institutionId,
        institutionName: userProfile.institutionName,
        programmeId: programmeId || undefined,
        programmeTitle: selectedProgramme?.title,
        academicYear: academicYear.trim() || undefined,
        yearOfStudy: yearOfStudy || undefined,
        semester: semester || undefined,
        allocationMode,
        courseUnitIds: requiresCourseUnits || programmeId ? validCourseUnitIds : [],
        moduleIds: requiresCourseUnits || programmeId ? validModuleIds : [],
        requiresApproval,
        maximumRegistrations: maximumRegistrations ? Number(maximumRegistrations) : undefined,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`) : null,
      });
      setLinks((current) => [created, ...current]);
      setMessage(`Registration link created successfully.${validCourseUnitIds.length ? ` ${validCourseUnitIds.length} course unit${validCourseUnitIds.length === 1 ? "" : "s"} and ${validModuleIds.length} module${validModuleIds.length === 1 ? "" : "s"} were assigned.` : " Students can now join using this link."}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create the link.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(link: RegistrationLink) {
    const status = link.status === "active" ? "disabled" : "active";
    await setRegistrationLinkStatus(link.code, status);
    setLinks((current) => current.map((item) => item.id === link.id ? { ...item, status } : item));
  }

  return (
    <TutorLayout title="Registration Links" subtitle="Assign students accurately by selecting the programme, class details, course units, and modules from your existing academic structure.">
      {message && <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">{message}</div>}
      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        <Card>
          <div className="flex items-center gap-3"><UserPlus className="text-blue-700" /><h2 className="text-xl font-bold">Generate a link</h2></div>
          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <label className="block"><span className="mb-1 block text-sm font-semibold">Link name</span><Input value={name} onChange={(e) => setName(e.target.value)} required /></label>
            <label className="block"><span className="mb-1 block text-sm font-semibold">Link type</span><select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3" value={linkType} onChange={(e) => setLinkType(e.target.value as RegistrationLinkType)}>{linkTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>

            {requiresProgramme && <label className="block"><span className="mb-1 block text-sm font-semibold">Programme</span><select required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3" value={programmeId} onChange={(e) => setProgrammeId(e.target.value)}><option value="">Select programme</option>{programmes.map((programme) => <option key={programme.id} value={programme.id}>{programme.code ? `${programme.code} — ` : ""}{programme.title}</option>)}</select></label>}

            {requiresProgramme && <div className="grid grid-cols-3 gap-3">
              <label><span className="mb-1 block text-xs font-semibold">Academic year</span><Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2026/2027" /></label>
              <label><span className="mb-1 block text-xs font-semibold">Year{requiresClassPlacement ? " *" : ""}</span><select required={requiresClassPlacement} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}><option value="">Any year</option>{[1,2,3,4,5,6].map((year) => <option key={year} value={String(year)}>Year {year}</option>)}</select></label>
              <label><span className="mb-1 block text-xs font-semibold">Semester{requiresClassPlacement ? " *" : ""}</span><select required={requiresClassPlacement} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3" value={semester} onChange={(e) => setSemester(e.target.value)}><option value="">Any semester</option><option value="1">Semester 1</option><option value="2">Semester 2</option><option value="3">Semester 3</option></select></label>
            </div>}

            {requiresProgramme && <>
            <fieldset className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
              <legend className="px-1 text-sm font-semibold text-blue-900">Course allocation method</legend>
              <div className="space-y-2 pt-1">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-white p-3">
                  <input type="radio" name="allocationMode" className="mt-1" checked={allocationMode === "automatic"} disabled={linkType === "course-unit"} onChange={() => setAllocationMode("automatic")} />
                  <span><strong className="block text-sm">Automatic — recommended</strong><span className="text-xs text-slate-600">Assign every published course unit matching the programme, year, and semester, together with its modules.</span></span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3">
                  <input type="radio" name="allocationMode" className="mt-1" checked={allocationMode === "manual"} onChange={() => setAllocationMode("manual")} />
                  <span><strong className="block text-sm">Manual exception</strong><span className="text-xs text-slate-600">Choose only selected units when a class should not receive the complete semester curriculum.</span></span>
                </label>
              </div>
              {programmeId && <p className="mt-2 text-xs text-blue-900">Matched {eligibleCourseUnits.length} published course unit{eligibleCourseUnits.length === 1 ? "" : "s"}.{unpublishedMatchingCount > 0 ? ` ${unpublishedMatchingCount} unpublished unit${unpublishedMatchingCount === 1 ? " was" : "s were"} excluded.` : ""}</p>}
            </fieldset>

            </>}

            {requiresProgramme && <>
              <SelectionList title="Course units" emptyText="No published course units match the selected programme, year, and semester." items={eligibleCourseUnits.map((unit) => ({ id: unit.id, label: `${unit.code ? `${unit.code} — ` : ""}${unit.title}` }))} selected={validCourseUnitIds} disabled={allocationMode === "automatic"} onToggle={(id) => toggleSelection(id, courseUnitIds, setCourseUnitIds)} />
              <SelectionList title="Modules" emptyText={validCourseUnitIds.length ? "No published modules are attached to the selected course units." : "Select course units first."} items={eligibleModules.map((module) => ({ id: module.id, label: `${module.code ? `${module.code} — ` : ""}${module.title}` }))} selected={validModuleIds} disabled={allocationMode === "automatic"} onToggle={(id) => toggleSelection(id, moduleIds, setModuleIds)} />
            </>}

            <div className="grid gap-3 sm:grid-cols-2"><label><span className="mb-1 block text-sm font-semibold">Maximum registrations</span><Input type="number" min="1" value={maximumRegistrations} onChange={(e) => setMaximumRegistrations(e.target.value)} /></label><label><span className="mb-1 block text-sm font-semibold">Expiry date</span><Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} /></label></div>
            <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} /><span className="text-sm font-medium">Require approval before access</span></label>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating..." : "Generate Registration Link"}</Button>
          </form>
        </Card>

        <div className="space-y-4">
          {links.length === 0 && <Card className="text-center"><Link2 className="mx-auto text-slate-400" size={40} /><p className="mt-3 font-semibold">No registration links yet.</p></Card>}
          {links.map((link) => {
            const url = `${origin}/join/${link.code}`;
            return <Card key={link.id}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold">{link.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${link.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>{link.status}</span></div><p className="mt-2 break-all text-sm text-blue-700">{url}</p><p className="mt-2 text-sm text-slate-600">{link.programmeTitle || "Programme not specified"} · {(link.allocationMode || "manual") === "automatic" ? "Automatic allocation" : "Manual allocation"} · Year {link.yearOfStudy || "Any"} · Semester {link.semester || "Any"} · {link.courseUnitIds?.length || 0} course units · {link.moduleIds?.length || 0} modules · {link.registrationCount || 0} registrations</p></div>
                <div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(url)}><Copy size={16} /> Copy</Button><Button type="button" variant="secondary" onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer")}><QrCode size={16} /> QR</Button><Button type="button" variant="secondary" onClick={() => toggle(link)}><Power size={16} /> {link.status === "active" ? "Disable" : "Enable"}</Button></div>
              </div>
            </Card>;
          })}
        </div>
      </div>
    </TutorLayout>
  );
}

function SelectionList({ title, emptyText, items, selected, disabled = false, onToggle }: { title: string; emptyText: string; items: { id: string; label: string }[]; selected: string[]; disabled?: boolean; onToggle: (id: string) => void }) {
  return <fieldset className="rounded-xl border border-slate-200 p-3"><legend className="px-1 text-sm font-semibold">{title} <span className="text-blue-700">({selected.length} selected)</span></legend>{items.length === 0 ? <p className="py-2 text-sm text-slate-500">{emptyText}</p> : <div className="max-h-48 space-y-2 overflow-y-auto pt-2">{items.map((item) => <label key={item.id} className={`flex items-start gap-3 rounded-lg p-2 ${disabled ? "cursor-default bg-slate-50" : "cursor-pointer hover:bg-slate-50"}`}><input type="checkbox" className="mt-1" disabled={disabled} checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} /><span className="text-sm">{item.label}</span></label>)}</div>}</fieldset>;
}
