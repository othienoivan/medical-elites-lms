import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, Send, } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import TutorLayout from "../../components/layout/TutorLayout";
import useAuth from "../../hooks/useAuth";
import useAccessScope from "../../hooks/useAccessScope";
import useCourseUnits from "../../hooks/useCourseUnits";
import { MarketplaceService, marketplaceSku, normalizeMarketplaceSlug, type MarketplaceCategory, type MarketplaceProductType } from "../../domains/marketplace";

const TYPES: Array<{ value: MarketplaceProductType; label: string }> = [
  { value: "course_unit", label: "Course unit" },
  { value: "course", label: "Digital course" },
  { value: "document", label: "Notes or document" },
  { value: "question_bank", label: "Question bank" },
  { value: "exam_package", label: "Examination package" },
  { value: "clinical_skills", label: "Clinical skills package" },
  { value: "video_course", label: "Video course" },
  { value: "live_class", label: "Live class" },
  { value: "membership", label: "Tutor membership" },
  { value: "bundle", label: "Product bundle" },
];

export default function MarketplaceSellPage() {
  const { currentUser, userProfile } = useAuth();
  const scope = useAccessScope();
  const { courseUnits, loading: loadingCourseUnits } = useCourseUnits(true);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MarketplaceProductType>("course_unit");
  const [categoryId, setCategoryId] = useState("");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [amount, setAmount] = useState("0");
  const [currency, setCurrency] = useState<"UGX" | "USD" | "KES" | "TZS" | "RWF">("UGX");
  const [tags, setTags] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [accessType, setAccessType] = useState<"lifetime" | "fixed_term" | "subscription" | "institution_license" | "promotional">("lifetime");
  const [accessDays, setAccessDays] = useState("365");
  const [visibility, setVisibility] = useState<"public" | "institution_only" | "private_link">("public");
  const [allowReviews, setAllowReviews] = useState(true);
  const [certificateIncluded, setCertificateIncluded] = useState(false);
  const [downloadAllowed, setDownloadAllowed] = useState(false);

  useEffect(() => { void MarketplaceService.listCategories().then(setCategories); }, []);

  const categoryName = useMemo(() => categories.find((c) => c.id === categoryId)?.name || "Uncategorised", [categories, categoryId]);
  const selectedCourseUnit = useMemo(() => courseUnits.find((c) => c.id === courseUnitId), [courseUnitId, courseUnits]);

  async function submit(status: "draft" | "submitted") {
    if (!currentUser || !userProfile) return;
    if (!title.trim() || !description.trim()) { setError("Title and full description are required."); return; }
    if ((type === "course_unit" || type === "course") && !courseUnitId) { setError("Select the course unit that this product grants access to."); return; }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) { setError("Enter a valid price."); return; }

    setSaving(true);
    setError(null);
    try {
      const id = await MarketplaceService.createProduct({
        sku: marketplaceSku(type),
        slug: normalizeMarketplaceSlug(title),
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        learningOutcomes: outcomes.split("\n").map((v) => v.trim()).filter(Boolean),
        type,
        status,
        price: { amount: numericAmount, currency },
        categoryId,
        categoryName,
        tags: tags.split(",").map((v) => v.trim()).filter(Boolean),
        sellerId: currentUser.uid,
        ownerTutorUid: currentUser.uid,
        sellerName: userProfile.fullName || currentUser.email || "Tutor",
        sellerType: "tutor",
        tenantId: scope?.tenantId,
        institutionId: scope?.institutionId,
        courseUnitId: selectedCourseUnit?.id,
        courseUnitTitle: selectedCourseUnit?.title,
        programmeId: selectedCourseUnit?.programmeId,
        semester: selectedCourseUnit?.semester != null ? String(selectedCourseUnit.semester) : undefined,
        yearOfStudy: selectedCourseUnit?.yearOfStudy != null ? String(selectedCourseUnit.yearOfStudy) : undefined,
        thumbnailUrl: thumbnailUrl.trim(),
        linkedResourceIds: selectedCourseUnit ? [selectedCourseUnit.id] : [],
        accessType,
        accessDays: accessType === "fixed_term" ? Number(accessDays) || 365 : undefined,
        billingInterval: accessType === "subscription" ? "monthly" : "one_time",
        visibility,
        allowReviews,
        certificateIncluded,
        downloadAllowed,
        ratingAverage: 0,
        ratingCount: 0,
        salesCount: 0,
        featured: false,
      });
      navigate(`/marketplace/products/${id}`);
    } catch (cause) {
      console.error(cause);
      setError("The product could not be saved. Check your permissions and required fields.");
    } finally { setSaving(false); }
  }

  return (
    <TutorLayout title="Create Product" subtitle="Package your educational content and set how students access it.">
      <div className="mx-auto max-w-5xl space-y-5">
        <Link to="/tutor/commerce/products" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-800"><ArrowLeft size={17}/>Back to products</Link>
        <section className="grid gap-5 rounded-2xl border bg-white p-6 md:grid-cols-2">
          <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-wider text-cyan-700">1. Product identity</p></div>
          <label className="md:col-span-2"><span className="mb-2 block font-bold">Product title *</span><input className="w-full rounded-xl border px-4 py-3" value={title} onChange={(e)=>setTitle(e.target.value)}/></label>
          <label><span className="mb-2 block font-bold">Product type</span><select className="w-full rounded-xl border px-4 py-3" value={type} onChange={(e)=>setType(e.target.value as MarketplaceProductType)}>{TYPES.map((t)=><option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
          <label><span className="mb-2 block font-bold">Category</span><select className="w-full rounded-xl border px-4 py-3" value={categoryId} onChange={(e)=>setCategoryId(e.target.value)}><option value="">Uncategorised</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="md:col-span-2"><span className="mb-2 block font-bold">Short description</span><input className="w-full rounded-xl border px-4 py-3" value={shortDescription} onChange={(e)=>setShortDescription(e.target.value)} maxLength={180}/></label>
          <label className="md:col-span-2"><span className="mb-2 block font-bold">Full description *</span><textarea className="min-h-36 w-full rounded-xl border px-4 py-3" value={description} onChange={(e)=>setDescription(e.target.value)}/></label>
        </section>

        <section className="grid gap-5 rounded-2xl border bg-white p-6 md:grid-cols-2">
          <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-wider text-cyan-700">2. Academic content</p></div>
          <label className="md:col-span-2"><span className="mb-2 block font-bold">Linked course unit {(type === "course_unit" || type === "course") && "*"}</span><select disabled={loadingCourseUnits} className="w-full rounded-xl border px-4 py-3" value={courseUnitId} onChange={(e)=>setCourseUnitId(e.target.value)}><option value="">No linked course unit</option>{courseUnits.map((course)=><option key={course.id} value={course.id}>{course.code ? `${course.code} — ` : ""}{course.title}</option>)}</select><p className="mt-1 text-xs text-slate-500">A successful purchase can use this link to grant access automatically.</p></label>
          <label className="md:col-span-2"><span className="mb-2 block font-bold">Learning outcomes (one per line)</span><textarea className="min-h-28 w-full rounded-xl border px-4 py-3" value={outcomes} onChange={(e)=>setOutcomes(e.target.value)}/></label>
          <label className="md:col-span-2"><span className="mb-2 block font-bold">Tags (comma separated)</span><input className="w-full rounded-xl border px-4 py-3" value={tags} onChange={(e)=>setTags(e.target.value)}/></label>
        </section>

        <section className="grid gap-5 rounded-2xl border bg-white p-6 md:grid-cols-2">
          <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-wider text-cyan-700">3. Pricing and access</p></div>
          <label><span className="mb-2 block font-bold">Price</span><input type="number" min="0" className="w-full rounded-xl border px-4 py-3" value={amount} onChange={(e)=>setAmount(e.target.value)}/></label>
          <label><span className="mb-2 block font-bold">Currency</span><select className="w-full rounded-xl border px-4 py-3" value={currency} onChange={(e)=>setCurrency(e.target.value as typeof currency)}>{["UGX","USD","KES","TZS","RWF"].map((c)=><option key={c}>{c}</option>)}</select></label>
          <label><span className="mb-2 block font-bold">Access type</span><select className="w-full rounded-xl border px-4 py-3" value={accessType} onChange={(e)=>setAccessType(e.target.value as typeof accessType)}><option value="lifetime">Lifetime</option><option value="fixed_term">Fixed term</option><option value="subscription">Monthly membership</option><option value="institution_license">Institution licence</option><option value="promotional">Promotional</option></select></label>
          {accessType === "fixed_term" && <label><span className="mb-2 block font-bold">Access days</span><input type="number" className="w-full rounded-xl border px-4 py-3" value={accessDays} onChange={(e)=>setAccessDays(e.target.value)}/></label>}
          <label><span className="mb-2 block font-bold">Visibility</span><select className="w-full rounded-xl border px-4 py-3" value={visibility} onChange={(e)=>setVisibility(e.target.value as typeof visibility)}><option value="public">Public marketplace</option><option value="institution_only">Institution only</option><option value="private_link">Private link</option></select></label>
          <label><span className="mb-2 block font-bold">Thumbnail URL</span><input className="w-full rounded-xl border px-4 py-3" value={thumbnailUrl} onChange={(e)=>setThumbnailUrl(e.target.value)}/></label>
          <div className="md:col-span-2 grid gap-3 sm:grid-cols-3"><label className="flex items-center gap-2"><input type="checkbox" checked={allowReviews} onChange={(e)=>setAllowReviews(e.target.checked)}/>Allow reviews</label><label className="flex items-center gap-2"><input type="checkbox" checked={certificateIncluded} onChange={(e)=>setCertificateIncluded(e.target.checked)}/>Certificate included</label><label className="flex items-center gap-2"><input type="checkbox" checked={downloadAllowed} onChange={(e)=>setDownloadAllowed(e.target.checked)}/>Downloads allowed</label></div>
        </section>

        {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
        <div className="flex flex-wrap justify-end gap-3 rounded-2xl border bg-white p-5"><button disabled={saving} onClick={()=>void submit("draft")} className="flex items-center gap-2 rounded-xl border px-5 py-3 font-bold disabled:opacity-50"><Save size={18}/>Save draft</button><button disabled={saving} onClick={()=>void submit("submitted")} className="flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white disabled:opacity-50"><Send size={18}/>{saving ? "Saving…" : "Submit for review"}</button></div>
      </div>
    </TutorLayout>
  );
}
