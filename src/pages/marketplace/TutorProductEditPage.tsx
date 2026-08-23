import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TutorLayout from "../../components/layout/TutorLayout";
import useAuth from "../../hooks/useAuth";
import useCourseUnits from "../../hooks/useCourseUnits";
import { MarketplaceService, type MarketplaceCurrency, type MarketplaceProduct, type MarketplaceProductStatus, type MarketplaceProductType } from "../../domains/marketplace";

import FileUpload from "../../components/upload/FileUpload";
import { deleteFileFromStorage } from "../../firebase/storage";
const TYPES: Array<{ value: MarketplaceProductType; label: string }> = [
  { value: "course_unit", label: "Course unit" }, { value: "course", label: "Digital course" },
  { value: "document", label: "Notes or document" }, { value: "question_bank", label: "Question bank" },
  { value: "exam_package", label: "Examination package" }, { value: "clinical_skills", label: "Clinical skills package" },
  { value: "video_course", label: "Video course" }, { value: "live_class", label: "Live class" },
  { value: "membership", label: "Tutor membership" }, { value: "bundle", label: "Product bundle" },
];

export default function TutorProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const { currentUser } = useAuth();
  const { courseUnits } = useCourseUnits(true);
  const navigate = useNavigate();
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId || !currentUser) return;
    void MarketplaceService.getProduct(productId).then((item) => {
      if (!item || (item.sellerId !== currentUser.uid && item.ownerTutorUid !== currentUser.uid)) {
        setError("You do not have permission to edit this product.");
        setProduct(null);
      } else setProduct(item);
    }).catch(() => setError("The product could not be loaded.")).finally(() => setLoading(false));
  }, [currentUser, productId]);

  const selectedCourseUnit = useMemo(() => courseUnits.find((c) => c.id === product?.courseUnitId), [courseUnits, product?.courseUnitId]);
  const set = <K extends keyof MarketplaceProduct>(key: K, value: MarketplaceProduct[K]) => setProduct((current) => current ? { ...current, [key]: value } : current);

  async function save() {
    if (!productId || !product || !currentUser) return;
    if (!product.title.trim() || !product.description.trim()) { setError("Title and full description are required."); return; }
    if (!Number.isFinite(product.price.amount) || product.price.amount < 0) { setError("Enter a valid price."); return; }
    setSaving(true); setError(null);
    try {
      await MarketplaceService.updateProduct(productId, {
        title: product.title.trim(), shortDescription: product.shortDescription.trim(), description: product.description.trim(),
        type: product.type, categoryId: product.categoryId, categoryName: product.categoryName, tags: product.tags,
        learningOutcomes: product.learningOutcomes, price: product.price, status: product.status,
        courseUnitId: selectedCourseUnit?.id, courseUnitTitle: selectedCourseUnit?.title,
        programmeId: selectedCourseUnit?.programmeId, semester: selectedCourseUnit?.semester != null ? String(selectedCourseUnit.semester) : undefined,
        yearOfStudy: selectedCourseUnit?.yearOfStudy != null ? String(selectedCourseUnit.yearOfStudy) : undefined,
        linkedResourceIds: selectedCourseUnit ? [selectedCourseUnit.id] : [],
        thumbnailUrl: product.thumbnailUrl?.trim(),
        thumbnailPath: product.thumbnailPath,
        accessType: product.accessType, accessDays: product.accessDays, billingInterval: product.billingInterval,
        visibility: product.visibility, allowReviews: product.allowReviews, certificateIncluded: product.certificateIncluded,
        downloadAllowed: product.downloadAllowed, sellerId: currentUser.uid, ownerTutorUid: currentUser.uid,
      });
      navigate(`/marketplace/products/${productId}`);
    } catch (cause) {
      console.error(cause); setError("The product could not be updated. Check your permissions and required fields.");
    } finally { setSaving(false); }
  }

  if (loading) return <TutorLayout title="Edit Product"><p className="p-6">Loading productÃ¢â‚¬Â¦</p></TutorLayout>;
  if (!product) return <TutorLayout title="Edit Product"><div className="rounded-2xl border bg-white p-8"><p className="font-bold text-red-700">{error ?? "Product unavailable."}</p><Link to="/tutor/commerce/products" className="mt-4 inline-block text-cyan-700">Return to My Products</Link></div></TutorLayout>;

  return <TutorLayout title="Edit Product" subtitle="Update pricing, content links, visibility and publication status.">
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/tutor/commerce/products" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-800"><ArrowLeft size={17}/>Back to products</Link>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      <section className="grid gap-5 rounded-2xl border bg-white p-6 md:grid-cols-2">
        <label className="md:col-span-2"><span className="mb-2 block font-bold">Product title *</span><input className="w-full rounded-xl border px-4 py-3" value={product.title} onChange={(e)=>set("title",e.target.value)}/></label>
        <label><span className="mb-2 block font-bold">Product type</span><select className="w-full rounded-xl border px-4 py-3" value={product.type} onChange={(e)=>set("type",e.target.value as MarketplaceProductType)}>{TYPES.map((t)=><option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
        <label><span className="mb-2 block font-bold">Status</span><select className="w-full rounded-xl border px-4 py-3" value={product.status} onChange={(e)=>set("status",e.target.value as MarketplaceProductStatus)}><option value="draft">Draft</option><option value="submitted">Submit for review</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label className="md:col-span-2"><span className="mb-2 block font-bold">Short description</span><input className="w-full rounded-xl border px-4 py-3" value={product.shortDescription} onChange={(e)=>set("shortDescription",e.target.value)}/></label>
        <label className="md:col-span-2"><span className="mb-2 block font-bold">Full description *</span><textarea className="min-h-36 w-full rounded-xl border px-4 py-3" value={product.description} onChange={(e)=>set("description",e.target.value)}/></label>
        <label className="md:col-span-2"><span className="mb-2 block font-bold">Linked course unit</span><select className="w-full rounded-xl border px-4 py-3" value={product.courseUnitId ?? ""} onChange={(e)=>set("courseUnitId",e.target.value || undefined)}><option value="">No linked course unit</option>{courseUnits.map((c)=><option key={c.id} value={c.id}>{c.code ? `${c.code} Ã¢â‚¬â€ ` : ""}{c.title}</option>)}</select></label>
        <label><span className="mb-2 block font-bold">Price</span><input type="number" min="0" className="w-full rounded-xl border px-4 py-3" value={product.price.amount} onChange={(e)=>set("price",{...product.price,amount:Number(e.target.value)})}/></label>
        <label><span className="mb-2 block font-bold">Currency</span><select className="w-full rounded-xl border px-4 py-3" value={product.price.currency} onChange={(e)=>set("price",{...product.price,currency:e.target.value as MarketplaceCurrency})}>{["UGX","USD","KES","TZS","RWF"].map((c)=><option key={c}>{c}</option>)}</select></label>
        <div className="md:col-span-2">
  <span className="mb-2 block font-bold">Product thumbnail</span>

  {product.thumbnailUrl && (
    <div className="mb-3 overflow-hidden rounded-2xl border bg-slate-50">
      <img
        src={product.thumbnailUrl}
        alt={product.title}
        className="aspect-video w-full object-cover"
      />
      <div className="p-3">
        <button
          type="button"
          className="text-sm font-bold text-red-600"
          onClick={() => {
          const previousPath = product.thumbnailPath;

          set("thumbnailUrl", undefined);
          set("thumbnailPath", undefined);

          if (previousPath) {
            void deleteFileFromStorage(previousPath).catch((error) =>
              console.warn("Product thumbnail could not be deleted.", error),
            );
          }
        }}
        >
          Remove thumbnail
        </button>
      </div>
    </div>
  )}

  <FileUpload
    folder="images"
    accept="image/jpeg,image/png,image/webp"
    label={product.thumbnailUrl ? "Replace Thumbnail" : "Upload Thumbnail"}
    customMetadata={{
      imagePurpose: "marketplace-thumbnail",
      productId: product.id,
    }}
    onUploaded={(file) => {
      const previousPath = product.thumbnailPath;

      set("thumbnailUrl", file.downloadUrl);
      set("thumbnailPath", file.filePath);

      if (previousPath && previousPath !== file.filePath) {
        void deleteFileFromStorage(previousPath).catch((error) =>
          console.warn("Old product thumbnail could not be deleted.", error),
        );
      }
    }}
  />
</div>
      </section>
      <div className="flex justify-end"><button type="button" disabled={saving} onClick={()=>void save()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 font-black text-white disabled:opacity-60"><Save size={18}/>{saving ? "SavingÃ¢â‚¬Â¦" : "Save changes"}</button></div>
    </div>
  </TutorLayout>;
}



