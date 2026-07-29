import { collection, getCountFromServer } from "firebase/firestore";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import TutorLayout from "../components/layout/TutorLayout";
import Card from "../components/ui/Card";
import { db } from "../config/firebase";

const metrics=[['Students','students'],['Course units','courseUnits'],['Attendance sessions','attendanceSessions'],['Clinical entries','clinicalLogbookEntries'],['OSCE/OSPE stations','osceStations'],['Examinations','examinations'],['Announcements','announcements'],['QA standards','qualityAssuranceItems']] as const;
export default function InstitutionalAnalyticsPage(){const [counts,setCounts]=useState<Record<string,number>>({}); useEffect(()=>{void Promise.all(metrics.map(async([label,col])=>[label,(await getCountFromServer(collection(db,col))).data().count] as const)).then(rows=>setCounts(Object.fromEntries(rows))).catch(console.error)},[]); return <TutorLayout title="Institutional Analytics" subtitle="Executive overview of academic and operational activity"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label])=><Card key={label} className="border border-slate-200"><BarChart3 className="mb-4 text-blue-700"/><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{counts[label]??'—'}</p></Card>)}</div><Card className="mt-6"><h2 className="text-lg font-bold">Analytics foundation</h2><p className="mt-2 text-sm leading-6 text-slate-600">This dashboard uses live Firestore aggregate counts and provides a single institutional view across learning, assessment, attendance, clinical training, communication and quality assurance.</p></Card></TutorLayout>}
