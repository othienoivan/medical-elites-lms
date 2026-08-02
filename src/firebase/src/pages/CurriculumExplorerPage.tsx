import { BookOpen, ChevronDown, ChevronRight, GraduationCap, Layers, Plus, Trash2, Merge } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { deleteCourseUnit, mergeCourseUnits } from "../firebase/courseUnits";
import useCourseUnits from "../hooks/useCourseUnits";
import useProgrammes from "../hooks/useProgrammes";
import useAccessScope from "../hooks/useAccessScope";

export default function CurriculumExplorerPage() {
  const navigate = useNavigate();
  const scope = useAccessScope();
  const { programmes, loading: programmesLoading } = useProgrammes(true);
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits(true);
  const [openProgrammeId, setOpenProgrammeId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const loading = programmesLoading || courseUnitsLoading;
  const byProgramme = useMemo(() => new Map(programmes.map(p => [p.id, courseUnits.filter(c => c.programmeId === p.id)])), [programmes, courseUnits]);

  async function remove(id:string,title:string){
    if(!confirm(`Delete course unit "${title}"? This is allowed only when it has no linked modules.`)) return;
    try{setBusyId(id);if(!scope) throw new Error("Your tutor profile is still loading.");await deleteCourseUnit(id,scope);location.reload();}catch(e){alert(e instanceof Error?e.message:"Failed to delete course unit");}finally{setBusyId(null)}
  }
  async function merge(sourceId:string,sourceTitle:string,programmeId:string){
    const options=courseUnits.filter(c=>c.id!==sourceId && c.programmeId===programmeId);
    if(!options.length){alert("Create another course unit in this programme before merging.");return;}
    const text=options.map((c,i)=>`${i+1}. ${c.title}`).join("\n");
    const selected=prompt(`Merge "${sourceTitle}" into which course unit?\n\n${text}\n\nEnter the number:`);
    if(!selected)return; const target=options[Number(selected)-1]; if(!target){alert("Invalid selection.");return;}
    if(!confirm(`Move linked modules and lessons from "${sourceTitle}" into "${target.title}", then delete the source course unit?`))return;
    try{setBusyId(sourceId);if(!scope) throw new Error("Your tutor profile is still loading.");await mergeCourseUnits(sourceId,target.id,scope);location.reload();}catch(e){alert(e instanceof Error?e.message:"Failed to merge course units");}finally{setBusyId(null)}
  }

  return <TutorLayout title="Curriculum Explorer" subtitle="Browse and manage programmes, course units, modules and lessons.">
    <div className="mb-6 flex flex-wrap gap-3"><Button onClick={()=>navigate("/tutor/programmes/new")}><Plus size={18}/>New Programme</Button><Button variant="outline" onClick={()=>navigate("/tutor/course-units/new")}><Plus size={18}/>New Course Unit</Button></div>
    <Card>{loading?<p>Loading curriculum...</p>:programmes.length===0?<div className="py-12 text-center"><GraduationCap className="mx-auto text-slate-400" size={48}/><h2 className="mt-4 text-xl font-bold">No programmes found</h2><Button className="mt-6" onClick={()=>navigate("/tutor/programmes/new")}>Create Programme</Button></div>:<div className="space-y-4">{programmes.map(programme=>{const isOpen=openProgrammeId===programme.id;const units=byProgramme.get(programme.id)??[];return <div key={programme.id} className="overflow-hidden rounded-2xl border"><button type="button" onClick={()=>setOpenProgrammeId(isOpen?null:programme.id)} className="flex w-full items-center justify-between bg-slate-50 p-5 text-left"><div className="flex items-center gap-4"><div className="rounded-xl bg-blue-100 p-3 text-blue-700"><GraduationCap size={24}/></div><div><p className="text-sm font-semibold text-blue-700">{programme.level}</p><h3 className="text-lg font-bold">{programme.title}</h3><p className="text-sm text-slate-500">{programme.duration} · {programme.published?"Published":"Draft"}</p></div></div>{isOpen?<ChevronDown/>:<ChevronRight/>}</button>{isOpen&&<div className="border-t bg-white p-5"><div className="mb-4 flex items-center justify-between"><h4 className="font-bold">Course Units</h4><Button variant="outline" onClick={()=>navigate("/tutor/course-units/new")}>Add Course Unit</Button></div>{units.length===0?<div className="rounded-xl border border-dashed p-6 text-center"><BookOpen className="mx-auto text-slate-400"/><p className="mt-3 font-semibold">No course units attached yet</p></div>:<div className="space-y-3">{units.map(unit=><div key={unit.id} className="rounded-xl border p-4"><div className="flex flex-col justify-between gap-4 lg:flex-row"><div className="flex gap-3"><BookOpen className="mt-1 text-green-700"/><div><h5 className="font-bold">{unit.title}</h5><p className="mt-1 text-sm text-slate-600">{unit.category} · {unit.duration} · {unit.published?"Published":"Draft"}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Layers size={16}/>Manage its modules or consolidate duplicate course units.</p></div></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>navigate(`/tutor/modules?courseUnitId=${encodeURIComponent(unit.id)}&programmeId=${encodeURIComponent(programme.id)}`)}>Manage Modules</Button><Button variant="outline" disabled={busyId===unit.id} onClick={()=>merge(unit.id,unit.title,programme.id)}><Merge size={16}/>Merge</Button><Button variant="outline" disabled={busyId===unit.id} onClick={()=>remove(unit.id,unit.title)}><Trash2 size={16}/>Delete</Button></div></div></div>)}</div>}</div>}</div>})}</div>}</Card>
  </TutorLayout>;
}
