import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../config/firebase";
import PlatformLayout from "../../components/platform/PlatformLayout";
import type { MarketplaceProduct } from "../../domains/marketplace";

type AiReviewResult = {
  deterministicEligible: boolean;
  moduleCount: number;
  lessonCount: number;
  hasThumbnail: boolean;
  aiScore: number;
  aiRecommendation: "approve" | "manual_review" | "reject";
  aiReason: string;
  autoApproved: false;
  status: MarketplaceProduct["status"];
};

type ManualDecisionResult = {
  status: MarketplaceProduct["status"];
  action: "start_review" | "approve" | "reject";
  overrodeAiDecision: boolean;
};

function formatTimestamp(value:unknown):string {
  if (!value) return "";
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as {toDate?:unknown}).toDate === "function") {
    return ((value as {toDate:()=>Date}).toDate()).toLocaleString();
  }
  if (value instanceof Date) return value.toLocaleString();
  return "";
}

export default function PlatformMarketplacePage(){
  const [items,setItems]=useState<MarketplaceProduct[]>([]);
  const [loading,setLoading]=useState(true);
  const [workingId,setWorkingId]=useState("");
  const [message,setMessage]=useState("");
  const [notes,setNotes]=useState<Record<string,string>>({});

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const snap=await getDocs(query(collection(db,"marketplaceProducts"),orderBy("updatedAt","desc")));
      setItems(snap.docs.map(s=>({id:s.id,...s.data()}) as MarketplaceProduct));
    }finally{setLoading(false)}
  },[]);
  useEffect(()=>{void load()},[load]);

  async function review(productId:string){
    try{
      setWorkingId(productId);setMessage("");
      const callable=httpsCallable<{productId:string},AiReviewResult>(functions,"reviewMarketplaceCourseUnitForApproval");
      const result=(await callable({productId})).data;
      setMessage(`AI review completed for human review. Recommendation: ${result.aiRecommendation.replaceAll("_"," ")}. Score ${result.aiScore}/100. ${result.aiReason}`);
      await load();
    }catch(error){setMessage(error instanceof Error?error.message:"Marketplace review could not be completed.")}finally{setWorkingId("")}
  }

  async function decide(productId:string,action:"start_review"|"approve"|"reject"){
    try{
      setWorkingId(productId);setMessage("");
      const reason=(notes[productId]||"").trim();
      const callable=httpsCallable<{productId:string;action:"start_review"|"approve"|"reject";reason:string},ManualDecisionResult>(functions,"decideMarketplaceProductApproval");
      const result=(await callable({productId,action,reason})).data;
      const label=action==="approve"?"approved":action==="reject"?"rejected":"moved to manual review";
      setMessage(`Product ${label}.${result.overrodeAiDecision?" The human decision overrode the AI recommendation.":""}`);
      setNotes(current=>({...current,[productId]:""}));
      await load();
    }catch(error){setMessage(error instanceof Error?error.message:"The manual moderation action could not be completed.")}finally{setWorkingId("")}
  }

  return <PlatformLayout title="Marketplace Operations" subtitle="Manual approval is mandatory. AI provides advice only and can never publish content automatically.">
    {message&&<p className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 font-semibold text-blue-900">{message}</p>}
    <div className="rounded-2xl border bg-white">
      <div className="border-b p-5">
        <h2 className="text-xl font-black">Product moderation queue</h2>
        <p className="mt-1 text-sm text-slate-600">Every submission requires a human decision. For course units, publication also requires at least one active module, one active lesson and a valid thumbnail. AI can flag concerns or recommend an outcome, but only an authorized reviewer can approve or reject.</p>
      </div>
      {loading?<div className="p-8 text-center">Loading products...</div>:items.length===0?<div className="p-8 text-center text-slate-600">No marketplace products found.</div>:<div className="divide-y">{items.map(item=>{
        const approval=item.approval;
        const aiFlagged=approval?.aiRecommendation==="manual_review"||approval?.aiRecommendation==="reject";
        return <div key={item.id} className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              {item.thumbnailUrl?<img src={item.thumbnailUrl} alt="" className="h-20 w-28 rounded-xl border object-cover"/>:<div className="h-20 w-28 rounded-xl bg-slate-100"/>}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black">{item.title}</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase">{item.status}</span>
                  {aiFlagged&&<span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase text-amber-900">AI flagged</span>}
                  {approval?.overrodeAiDecision&&<span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold uppercase text-violet-900">AI overridden</span>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.sellerName} - {item.type.replaceAll("_"," ")} - {item.price.currency} {item.price.amount.toLocaleString()}</p>
                {item.type==="course_unit"&&approval&&<div className="mt-3 rounded-xl border bg-slate-50 p-3 text-sm">
                  <p className="font-bold">AI advisory review</p>
                  <p className="mt-1">Recommendation: <span className="font-semibold">{approval.aiRecommendation?.replaceAll("_"," ")||"not yet reviewed"}</span>{typeof approval.aiScore==="number"?` · ${approval.aiScore}/100`:""}</p>
                  {approval.aiReason&&<p className="mt-1 text-slate-600">{approval.aiReason}</p>}
                  <p className="mt-1 text-xs text-slate-500">Structure: {approval.moduleCount??0} active module(s), {approval.lessonCount??0} active lesson(s), thumbnail {approval.hasThumbnail?"present":"missing"}.</p>
                </div>}
                {approval?.manualDecision&&<div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
                  <p className="font-bold">Latest human decision: {approval.manualDecision}</p>
                  <p className="mt-1">Reviewer: {approval.manuallyReviewedByName||approval.manuallyReviewedBy||"Recorded reviewer"}</p>
                  {formatTimestamp(approval.manuallyReviewedAt)&&<p className="mt-1">Decision time: {formatTimestamp(approval.manuallyReviewedAt)}</p>}
                  <p className="mt-1">Decision source: Human reviewer{approval.overrodeAiDecision?" (AI recommendation overridden)":""}</p>
                  {approval.manualDecisionReason&&<p className="mt-1">Reason: {approval.manualDecisionReason}</p>}
                </div>}
              </div>
            </div>
            <div className="w-full max-w-xl">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Reviewer note / reason</label>
              <textarea value={notes[item.id]||""} onChange={e=>setNotes(current=>({...current,[item.id]:e.target.value}))} rows={2} placeholder="Required when rejecting or overriding the AI recommendation; recommended for every decision." className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.type==="course_unit"&&<button disabled={workingId===item.id} onClick={()=>void review(item.id)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800 disabled:opacity-50">Run AI Review</button>}
                <button disabled={workingId===item.id} onClick={()=>void decide(item.id,"start_review")} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50">Start Manual Review</button>
                <button disabled={workingId===item.id} onClick={()=>void decide(item.id,"approve")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Approve & Publish</button>
                <button disabled={workingId===item.id} onClick={()=>void decide(item.id,"reject")} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Reject</button>
              </div>
            </div>
          </div>
        </div>
      })}</div>}
    </div>
  </PlatformLayout>
}
