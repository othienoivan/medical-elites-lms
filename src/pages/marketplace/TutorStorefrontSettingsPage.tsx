import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Save, Store } from "lucide-react";
import { Link } from "react-router-dom";
import TutorLayout from "../../components/layout/TutorLayout";
import useAuth from "../../hooks/useAuth";
import { MarketplaceService, normalizeMarketplaceSlug, type SellerProfile } from "../../domains/marketplace";

import FileUpload from "../../components/upload/FileUpload";
import { deleteFileFromStorage } from "../../firebase/storage";
const PUBLIC_ORIGIN = "https://medicalelites.org";

function csv(value?: string[]) { return (value ?? []).join(", "); }
function splitCsv(value: string) { return value.split(",").map((item) => item.trim()).filter(Boolean); }

export default function TutorStorefrontSettingsPage() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [specialties, setSpecialties] = useState("");
  const [languages, setLanguages] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    void MarketplaceService.getSeller(currentUser.uid).then((existing) => {
      const next: SellerProfile = existing ?? {
        id: currentUser.uid,
        ownerUid: currentUser.uid,
        slug: normalizeMarketplaceSlug(currentUser.displayName || `tutor-${currentUser.uid.slice(0, 8)}`),
        displayName: currentUser.displayName || "Tutor",
        bio: "",
        photoUrl: currentUser.photoURL || undefined,
        verified: false,
        status: "active",
        ratingAverage: 0,
        ratingCount: 0,
        followerCount: 0,
        productCount: 0,
      };
      setProfile(next);
      setSpecialties(csv(next.specialties));
      setLanguages(csv(next.languages));
    });
  }, [currentUser]);

  const storePath = useMemo(() => currentUser ? `/store/${currentUser.uid}` : "", [currentUser]);
  if (!profile) return <TutorLayout title="Storefront" subtitle="Loading your public tutor storeÃ¢â‚¬Â¦"><div className="rounded-2xl border bg-white p-8">LoadingÃ¢â‚¬Â¦</div></TutorLayout>;

  const update = (key: keyof SellerProfile, value: unknown) => setProfile((current) => current ? { ...current, [key]: value } : current);
  const save = async () => {
    if (!currentUser) return;
    setSaving(true); setMessage("");
    try {
      const slug = normalizeMarketplaceSlug(profile.slug || profile.displayName || currentUser.uid);
      if (!slug) throw new Error("Enter a valid store name or URL slug.");
      await MarketplaceService.upsertSeller({ ...profile, id: currentUser.uid, ownerUid: currentUser.uid, slug, specialties: splitCsv(specialties), languages: splitCsv(languages), status: "active" });
      setProfile((current) => current ? { ...current, slug } : current);
      setMessage("Storefront saved successfully.");
    } catch (error) {
      console.error(error); setMessage("The storefront could not be saved. Check the details and try again.");
    } finally { setSaving(false); }
  };

  return <TutorLayout title="Storefront" subtitle="Build and share your public Medical Elites tutor store.">
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-5">
        <div><h2 className="text-xl font-black text-slate-900">Public tutor storefront</h2><p className="text-sm text-slate-600">Your canonical store link is {PUBLIC_ORIGIN}{storePath}</p></div>
        <Link to={storePath} target="_blank" className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 font-bold text-cyan-800"><ExternalLink size={18}/> Preview store</Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4 rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-2"><Store className="text-cyan-700"/><h3 className="text-lg font-black">Identity & profile</h3></div>
          <label className="block text-sm font-bold">Display name<input className="mt-1 w-full rounded-xl border p-3 font-normal" value={profile.displayName} onChange={(e)=>update("displayName",e.target.value)}/></label>
          <label className="block text-sm font-bold">Store URL slug<div className="mt-1 flex rounded-xl border bg-white"><span className="self-center pl-3 text-sm text-slate-500">/store/</span><input className="min-w-0 flex-1 rounded-xl p-3 outline-none" value={profile.slug ?? ""} onChange={(e)=>update("slug",normalizeMarketplaceSlug(e.target.value))}/></div></label>
          <label className="block text-sm font-bold">Professional headline<input className="mt-1 w-full rounded-xl border p-3 font-normal" placeholder="Clinical Medicine Tutor Ã‚Â· Pharmacology Educator" value={profile.headline ?? ""} onChange={(e)=>update("headline",e.target.value)}/></label>
          <label className="block text-sm font-bold">Biography<textarea rows={5} className="mt-1 w-full rounded-xl border p-3 font-normal" value={profile.bio} onChange={(e)=>update("bio",e.target.value)}/></label>
          <label className="block text-sm font-bold">Qualifications<input className="mt-1 w-full rounded-xl border p-3 font-normal" value={profile.qualifications ?? ""} onChange={(e)=>update("qualifications",e.target.value)}/></label>
          <label className="block text-sm font-bold">Institution<input className="mt-1 w-full rounded-xl border p-3 font-normal" value={profile.institutionName ?? ""} onChange={(e)=>update("institutionName",e.target.value)}/></label>
          <label className="block text-sm font-bold">Specialties <span className="font-normal text-slate-500">(comma separated)</span><input className="mt-1 w-full rounded-xl border p-3 font-normal" value={specialties} onChange={(e)=>setSpecialties(e.target.value)}/></label>
          <label className="block text-sm font-bold">Languages <span className="font-normal text-slate-500">(comma separated)</span><input className="mt-1 w-full rounded-xl border p-3 font-normal" value={languages} onChange={(e)=>setLanguages(e.target.value)}/></label>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white p-6">
          <h3 className="text-lg font-black">Branding & contact</h3>
          <div>
  <span className="mb-2 block text-sm font-bold">Storefront profile photo</span>

  {profile.photoUrl && (
    <div className="mb-3 flex items-center gap-4 rounded-2xl border bg-slate-50 p-4">
      <img
        src={profile.photoUrl}
        alt={profile.displayName}
        className="h-24 w-24 rounded-2xl object-cover"
      />
      <button
        type="button"
        className="text-sm font-bold text-red-600"
        onClick={() => {
          const previousPath = profile.photoPath;

          update("photoUrl", undefined);
          update("photoPath", undefined);

          if (previousPath) {
            void deleteFileFromStorage(previousPath).catch((error) =>
              console.warn("Storefront photo could not be deleted.", error),
            );
          }
        }}
      >
        Remove photo
      </button>
    </div>
  )}

  <FileUpload
    folder="images"
    accept="image/jpeg,image/png,image/webp"
    label={profile.photoUrl ? "Replace Storefront Photo" : "Upload Storefront Photo"}
    customMetadata={{ imagePurpose: "storefront-photo" }}
    onUploaded={(file) => {
      const previousPath = profile.photoPath;

      update("photoUrl", file.downloadUrl);
      update("photoPath", file.filePath);

      if (previousPath && previousPath !== file.filePath) {
        void deleteFileFromStorage(previousPath).catch((error) =>
          console.warn("Old storefront photo could not be deleted.", error),
        );
      }
    }}
  />
</div>
          <div>
  <span className="mb-2 block text-sm font-bold">Storefront banner</span>

  {profile.bannerUrl && (
    <div className="mb-3 overflow-hidden rounded-2xl border bg-slate-50">
      <img
        src={profile.bannerUrl}
        alt="Storefront banner"
        className="aspect-[16/5] w-full object-cover"
      />
      <div className="p-3">
        <button
          type="button"
          className="text-sm font-bold text-red-600"
          onClick={() => {
          const previousPath = profile.bannerPath;

          update("bannerUrl", undefined);
          update("bannerPath", undefined);

          if (previousPath) {
            void deleteFileFromStorage(previousPath).catch((error) =>
              console.warn("Storefront banner could not be deleted.", error),
            );
          }
        }}
        >
          Remove banner
        </button>
      </div>
    </div>
  )}

  <FileUpload
    folder="images"
    accept="image/jpeg,image/png,image/webp"
    label={profile.bannerUrl ? "Replace Banner" : "Upload Banner"}
    customMetadata={{ imagePurpose: "storefront-banner" }}
    onUploaded={(file) => {
      const previousPath = profile.bannerPath;

      update("bannerUrl", file.downloadUrl);
      update("bannerPath", file.filePath);

      if (previousPath && previousPath !== file.filePath) {
        void deleteFileFromStorage(previousPath).catch((error) =>
          console.warn("Old storefront banner could not be deleted.", error),
        );
      }
    }}
  />
</div>
          <label className="block text-sm font-bold">Welcome message<textarea rows={3} className="mt-1 w-full rounded-xl border p-3 font-normal" value={profile.welcomeMessage ?? ""} onChange={(e)=>update("welcomeMessage",e.target.value)}/></label>
          <label className="block text-sm font-bold">Public contact email<input type="email" className="mt-1 w-full rounded-xl border p-3 font-normal" value={profile.contactEmail ?? ""} onChange={(e)=>update("contactEmail",e.target.value)}/></label>
          <label className="block text-sm font-bold">WhatsApp number<input className="mt-1 w-full rounded-xl border p-3 font-normal" placeholder="+256Ã¢â‚¬Â¦" value={profile.whatsappNumber ?? ""} onChange={(e)=>update("whatsappNumber",e.target.value)}/></label>
          <label className="block text-sm font-bold">Website<input className="mt-1 w-full rounded-xl border p-3 font-normal" value={profile.websiteUrl ?? ""} onChange={(e)=>update("websiteUrl",e.target.value)}/></label>
          <label className="block text-sm font-bold">Teaching experience (years)<input type="number" min="0" className="mt-1 w-full rounded-xl border p-3 font-normal" value={profile.teachingExperienceYears ?? ""} onChange={(e)=>update("teachingExperienceYears",e.target.value ? Number(e.target.value) : undefined)}/></label>
        </section>
      </div>
      {message && <p className="rounded-xl border bg-white p-4 font-bold text-slate-700">{message}</p>}
      <button type="button" disabled={saving} onClick={()=>void save()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white disabled:opacity-60"><Save size={18}/>{saving ? "SavingÃ¢â‚¬Â¦" : "Save storefront"}</button>
    </div>
  </TutorLayout>;
}



