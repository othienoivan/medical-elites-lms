import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { getProgrammeById, updateProgramme } from "../firebase/programmes";
import type { ProgrammeLevel } from "../models/Programme";

export default function EditProgrammePage() {
  const { programmeId = "" } = useParams();
  const navigate = useNavigate();
  const [title,setTitle]=useState(""); const [level,setLevel]=useState<ProgrammeLevel>("Diploma");
  const [faculty,setFaculty]=useState(""); const [department,setDepartment]=useState("");
  const [description,setDescription]=useState(""); const [duration,setDuration]=useState("");
  const [published,setPublished]=useState(false); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  useEffect(()=>{ void getProgrammeById(programmeId).then((p)=>{ if(!p) throw new Error("Programme not found"); setTitle(p.title);setLevel(p.level);setFaculty(p.faculty??"");setDepartment(p.department??"");setDescription(p.description);setDuration(p.duration);setPublished(p.published); }).catch((e)=>{alert(e instanceof Error?e.message:"Unable to load programme");navigate("/tutor/programmes");}).finally(()=>setLoading(false));},[programmeId,navigate]);
  const slug=(v:string)=>v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");
  async function submit(e:React.FormEvent){e.preventDefault();try{setSaving(true);await updateProgramme(programmeId,{title,slug:slug(title),level,faculty,department,description,duration,published});navigate("/tutor/programmes");}catch(err){alert(err instanceof Error?err.message:"Failed to update programme");}finally{setSaving(false)}}
  return <TutorLayout title="Edit Programme" subtitle="Update programme details and publication status."><Card className="mx-auto max-w-3xl">{loading?<p>Loading programme...</p>:<form onSubmit={submit} className="space-y-5">
    <label className="block font-semibold">Programme Title<Input value={title} onChange={e=>setTitle(e.target.value)} required/></label>
    <label className="block font-semibold">Level<select value={level} onChange={e=>setLevel(e.target.value as ProgrammeLevel)} className="mt-2 w-full rounded-xl border px-4 py-3"><option>Certificate</option><option>Diploma</option><option>Higher Diploma</option><option>Degree</option><option>Postgraduate Diploma</option><option>Master&apos;s</option><option>PhD</option><option>CPD</option></select></label>
    <label className="block font-semibold">Faculty / School<Input value={faculty} onChange={e=>setFaculty(e.target.value)}/></label>
    <label className="block font-semibold">Department<Input value={department} onChange={e=>setDepartment(e.target.value)}/></label>
    <label className="block font-semibold">Description<textarea value={description} onChange={e=>setDescription(e.target.value)} required className="mt-2 min-h-32 w-full rounded-xl border px-4 py-3"/></label>
    <label className="block font-semibold">Duration<Input value={duration} onChange={e=>setDuration(e.target.value)} required/></label>
    <label className="flex items-center gap-3"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/> Published and visible to students</label>
    <div className="flex gap-3"><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Changes"}</Button><Button type="button" variant="outline" onClick={()=>navigate("/tutor/programmes")}>Cancel</Button></div>
  </form>}</Card></TutorLayout>;
}
