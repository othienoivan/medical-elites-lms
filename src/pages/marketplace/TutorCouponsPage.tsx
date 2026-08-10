import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { TicketPercent } from "lucide-react";
import TutorLayout from "../../components/layout/TutorLayout";
import { db } from "../../config/firebase";
import useAuth from "../../hooks/useAuth";
import { MarketplaceCommerceService, type MarketplaceCoupon } from "../../domains/marketplace";

export default function TutorCouponsPage() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<MarketplaceCoupon[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", code: "", type: "percentage", value: "10", scope: "store", targetId: "", minimumSpend: "0", maxDiscount: "", usageLimit: "", perBuyerLimit: "1", status: "active", startsAt: "", endsAt: "" });

  const load = async () => {
    if (!currentUser) return;
    const snap = await getDocs(query(collection(db, "marketplaceCoupons"), where("sellerId", "==", currentUser.uid), orderBy("createdAt", "desc")));
    setRecords(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MarketplaceCoupon)));
  };

  useEffect(() => { void load(); }, [currentUser]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;
    setSaving(true); setMessage("");
    try {
      await MarketplaceCommerceService.upsertCoupon({
        ...form, sellerId: currentUser.uid, code: form.code.trim().toUpperCase(), value: Number(form.value),
        minimumSpend: Number(form.minimumSpend || 0), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null, perBuyerLimit: Number(form.perBuyerLimit || 1),
        targetId: form.scope === "product" ? form.targetId.trim() : null, startsAt: form.startsAt || null, endsAt: form.endsAt || null, currency: "UGX",
      });
      setMessage("Coupon saved successfully.");
      setForm((current) => ({ ...current, name: "", code: "", targetId: "" }));
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save coupon."); }
    finally { setSaving(false); }
  };

  return <TutorLayout title="Coupons" subtitle="Create secure discounts for your tutor storefront and products.">
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><TicketPercent className="text-cyan-700"/><h2 className="text-xl font-black">Create coupon</h2></div>
        <label className="block text-sm font-bold">Coupon name<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="mt-1 w-full rounded-xl border p-3" placeholder="Welcome discount"/></label>
        <label className="block text-sm font-bold">Coupon code<input required value={form.code} onChange={(e)=>setForm({...form,code:e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g,"")})} className="mt-1 w-full rounded-xl border p-3" placeholder="WELCOME10"/></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-bold">Type<select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})} className="mt-1 w-full rounded-xl border p-3"><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label>
          <label className="text-sm font-bold">Value<input required min="0.01" type="number" value={form.value} onChange={(e)=>setForm({...form,value:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label>
        </div>
        <label className="block text-sm font-bold">Applies to<select value={form.scope} onChange={(e)=>setForm({...form,scope:e.target.value})} className="mt-1 w-full rounded-xl border p-3"><option value="store">Entire store</option><option value="product">Specific product</option></select></label>
        {form.scope === "product" && <label className="block text-sm font-bold">Product ID<input required value={form.targetId} onChange={(e)=>setForm({...form,targetId:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label>}
        <div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Minimum spend<input type="number" min="0" value={form.minimumSpend} onChange={(e)=>setForm({...form,minimumSpend:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">Maximum discount<input type="number" min="0" value={form.maxDiscount} onChange={(e)=>setForm({...form,maxDiscount:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label></div>
        <div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Total uses<input type="number" min="1" value={form.usageLimit} onChange={(e)=>setForm({...form,usageLimit:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">Per buyer<input type="number" min="1" value={form.perBuyerLimit} onChange={(e)=>setForm({...form,perBuyerLimit:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label></div>
        <div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Starts<input type="datetime-local" value={form.startsAt} onChange={(e)=>setForm({...form,startsAt:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">Ends<input type="datetime-local" value={form.endsAt} onChange={(e)=>setForm({...form,endsAt:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label></div>
        <label className="block text-sm font-bold">Status<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="mt-1 w-full rounded-xl border p-3"><option value="active">Active</option><option value="draft">Draft</option><option value="paused">Paused</option></select></label>
        <button disabled={saving} className="w-full rounded-xl bg-cyan-700 px-4 py-3 font-black text-white disabled:opacity-60">{saving ? "Saving…" : "Save coupon"}</button>
        {message && <p className="rounded-xl bg-cyan-50 p-3 text-sm font-bold text-cyan-800">{message}</p>}
      </form>
      <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Your coupons</h2><div className="mt-4 space-y-3">{records.map((coupon)=><div key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="font-black">{coupon.code}</p><p className="text-sm text-slate-600">{coupon.name} · {coupon.type === "percentage" ? `${coupon.value}%` : `UGX ${coupon.value.toLocaleString()}`} · {coupon.scope}</p></div><div className="text-right"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase">{coupon.status}</span><p className="mt-2 text-xs text-slate-500">{coupon.redemptions || 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""} uses</p></div></div>)}{records.length===0&&<p className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">No coupons created yet.</p>}</div></section>
    </div>
  </TutorLayout>;
}
