import { Star, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import useAuth from "../../../hooks/useAuth";
import { MarketplaceIntelligenceService } from "../application/marketplace-intelligence-service";
import type { ProductReview } from "../domain/intelligence";

export default function MarketplaceReviews({ productId }: { productId: string }) {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  async function load() { setReviews(await MarketplaceIntelligenceService.listReviews(productId)); }
  useEffect(() => { void load(); }, [productId]);
  useEffect(() => { if (!currentUser) return; void getDocs(query(collection(db, "marketplacePurchases"), where("customerUid", "==", currentUser.uid), where("productId", "==", productId), where("status", "==", "active"), limit(1))).then((snap) => setPurchaseId(snap.docs[0]?.id ?? null)); }, [currentUser, productId]);
  async function submit() { if (!purchaseId) return; try { await MarketplaceIntelligenceService.submitReview({ productId, purchaseId, rating, title, body, difficulty: 3, valueForMoney: 4, wouldRecommend: true }); setMessage("Your verified review was published."); setBody(""); setTitle(""); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to submit review."); } }
  return <section className="mt-6 rounded-2xl border bg-white p-7">
    <div className="flex items-center justify-between"><h2 className="text-2xl font-black">Verified learner reviews</h2><span className="text-sm text-slate-500">{reviews.length} review(s)</span></div>
    {purchaseId && <div className="mt-5 rounded-xl bg-slate-50 p-5"><h3 className="font-black">Review your purchase</h3><div className="mt-3 flex gap-1">{[1,2,3,4,5].map((value)=><button key={value} onClick={()=>setRating(value)} aria-label={`${value} stars`}><Star size={22} className={value<=rating?"fill-amber-400 text-amber-400":"text-slate-300"}/></button>)}</div><input value={title} onChange={(event)=>setTitle(event.target.value)} placeholder="Review title" className="mt-3 w-full rounded-lg border px-3 py-2"/><textarea value={body} onChange={(event)=>setBody(event.target.value)} placeholder="Share your experience" rows={4} className="mt-3 w-full rounded-lg border px-3 py-2"/><button disabled={body.trim().length<10} onClick={()=>void submit()} className="mt-3 rounded-lg bg-cyan-700 px-4 py-2 font-bold text-white disabled:opacity-50">Publish verified review</button></div>}
    {message && <p className="mt-3 rounded-lg bg-cyan-50 p-3 text-sm font-semibold text-cyan-800">{message}</p>}
    <div className="mt-5 space-y-5">{reviews.length === 0 ? <p className="text-slate-600">No published reviews yet.</p> : reviews.map((review) => <article key={review.id} className="rounded-xl border p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{review.title || "Learner review"}</p><p className="text-sm text-slate-500">{review.reviewerName} · Verified purchase</p></div><div className="flex items-center gap-1 text-amber-500">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={17} className={index < review.rating ? "fill-current" : "text-slate-300"}/>)}</div></div><p className="mt-3 leading-7 text-slate-700">{review.body}</p><button disabled={!currentUser} onClick={async () => { try { await MarketplaceIntelligenceService.voteReview(review.id, true); setMessage("Thank you for your feedback."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to record vote."); } }} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50"><ThumbsUp size={16}/>Helpful ({review.helpfulCount ?? 0})</button></article>)}</div>
  </section>;
}
