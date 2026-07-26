import Card from "../ui/Card";
import type { ExaminationSection } from "../../models/Examination";

export default function ExaminationBlueprint({sections,totalMarks}:{sections:ExaminationSection[];totalMarks:number}){
  const rows=sections.map(section=>({label:section.title,questions:section.questions.length,marks:section.totalMarks,percentage:totalMarks?Math.round(section.totalMarks/totalMarks*100):0}));
  return <Card><h2 className="text-xl font-bold text-slate-950">Examination Blueprint</h2><p className="mt-1 text-sm text-slate-600">Live distribution of questions and marks by section.</p><div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="py-2">Section</th><th>Questions</th><th>Marks</th><th>Weight</th></tr></thead><tbody>{rows.map(row=><tr key={row.label} className="border-b"><td className="py-3 font-medium">{row.label}</td><td>{row.questions}</td><td>{row.marks}</td><td>{row.percentage}%</td></tr>)}{rows.length===0&&<tr><td colSpan={4} className="py-6 text-center text-slate-500">Add sections to generate the blueprint.</td></tr>}</tbody></table></div></Card>
}
