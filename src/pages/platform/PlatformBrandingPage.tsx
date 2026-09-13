import { useState, type FormEvent } from "react";

import PlatformCard from "../../components/platform/PlatformCard";
import PlatformLayout from "../../components/platform/PlatformLayout";
import FileUpload from "../../components/upload/FileUpload";
import { PlatformService, platformCollections } from "../../domains/platform";
import { deleteFileFromStorage } from "../../firebase/storage";

export default function PlatformBrandingPage() {
  const [tenantId, setTenantId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPath, setLogoPath] = useState("");
  const [originalLogoPath, setOriginalLogoPath] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [faviconPath, setFaviconPath] = useState("");
  const [socialImageUrl, setSocialImageUrl] = useState("");
  const [socialImagePath, setSocialImagePath] = useState("");
  const [defaultCourseImageUrl, setDefaultCourseImageUrl] = useState("");
  const [defaultCourseImagePath, setDefaultCourseImagePath] = useState("");
  const [siteName, setSiteName] = useState("Medical Elites");
  const [tagline, setTagline] = useState("Medical Education & Learning Platform");
  const [seoTitle, setSeoTitle] = useState("Medical Elites | Medical Education & Learning Platform");
  const [seoDescription, setSeoDescription] = useState("Digital medical education, assessment, clinical training and AI in one platform.");
  const [primaryColor, setPrimaryColor] = useState("#0891b2");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");
  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [message, setMessage] = useState("");

  async function loadBranding() {
    if (!tenantId.trim()) {
      setMessage("Enter a Tenant ID first.");
      return;
    }

    setMessage("Loading...");

    try {
      if (logoPath && logoPath !== originalLogoPath) {
        await deleteFileFromStorage(logoPath).catch(() => undefined);
      }

      const tenant = await PlatformService.getTenant(tenantId.trim());

      if (!tenant) {
        setMessage("Tenant not found.");
        return;
      }

      const branding = tenant.branding ?? {};
      setLogoUrl(branding.logoUrl ?? "");
      setLogoPath(branding.logoPath ?? "");
      setOriginalLogoPath(branding.logoPath ?? "");
      setFaviconUrl(branding.faviconUrl ?? "");
      setFaviconPath(branding.faviconPath ?? "");
      setSocialImageUrl(branding.socialImageUrl ?? "");
      setSocialImagePath(branding.socialImagePath ?? "");
      setDefaultCourseImageUrl(branding.defaultCourseImageUrl ?? "");
      setDefaultCourseImagePath(branding.defaultCourseImagePath ?? "");
      setSiteName(branding.siteName ?? "Medical Elites");
      setTagline(branding.tagline ?? "Medical Education & Learning Platform");
      setSeoTitle(branding.seoTitle ?? "Medical Elites | Medical Education & Learning Platform");
      setSeoDescription(branding.seoDescription ?? "Digital medical education, assessment, clinical training and AI in one platform.");
      setPrimaryColor(branding.primaryColor ?? "#0891b2");
      setSecondaryColor(branding.secondaryColor ?? "#0f172a");
      setAccentColor(branding.accentColor ?? "#7c3aed");
      setMessage("Branding loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load branding.");
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("Saving...");

    try {
      await PlatformService.save(platformCollections.tenants, tenantId.trim(), {
        branding: {
          logoUrl,
          logoPath,
          faviconUrl,
          faviconPath,
          socialImageUrl,
          socialImagePath,
          defaultCourseImageUrl,
          defaultCourseImagePath,
          siteName: siteName.trim(),
          tagline: tagline.trim(),
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
          primaryColor,
          secondaryColor,
          accentColor,
        },
      });

      if (originalLogoPath && originalLogoPath !== logoPath) {
        await deleteFileFromStorage(originalLogoPath).catch((error) =>
          console.warn("Previous tenant logo could not be deleted.", error),
        );
      }

      setOriginalLogoPath(logoPath);
      setMessage("Branding saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to save branding.");
    }
  }

  return (
    <PlatformLayout title="Branding Engine" subtitle="Configure tenant branding without changing academic data or application code.">
      <div className="grid gap-6 lg:grid-cols-2">
        <PlatformCard title="Brand configuration">
          <form onSubmit={e => void submit(e)} className="space-y-4">
            <label>
              <span className="mb-1 block text-sm font-bold">Tenant ID</span>
              <div className="flex gap-2">
                <input required value={tenantId} onChange={e => setTenantId(e.target.value)} className="w-full rounded-xl border px-3 py-2.5"/>
                <button type="button" onClick={() => void loadBranding()} className="rounded-xl border px-4 py-2.5 font-bold">Load</button>
              </div>
            </label>

            <div>
              <span className="mb-2 block text-sm font-bold">Institution / Tenant Logo</span>
              {logoUrl && (
                <div className="mb-4 flex items-center gap-4 rounded-2xl border bg-slate-50 p-4">
                  <img src={logoUrl} alt="Tenant logo" className="h-24 w-24 rounded-2xl bg-white object-contain"/>
                  <button type="button" className="text-sm font-bold text-red-600" onClick={() => {
                    const pending = logoPath && logoPath !== originalLogoPath ? logoPath : "";
                    setLogoUrl("");
                    setLogoPath("");
                    if (pending) void deleteFileFromStorage(pending).catch((error) => console.warn("Unsaved branding logo could not be deleted.", error));
                  }}>Remove logo</button>
                </div>
              )}

              <FileUpload
                folder="images"
                accept="image/jpeg,image/png,image/webp"
                label={logoUrl ? "Replace Logo" : "Upload Logo"}
                customMetadata={{ imagePurpose: "tenant-branding-logo", brandingTenantId: tenantId.trim() }}
                onUploaded={(file) => {
                  const previousPending = logoPath && logoPath !== originalLogoPath ? logoPath : "";
                  setLogoUrl(file.downloadUrl);
                  setLogoPath(file.filePath);
                  if (previousPending && previousPending !== file.filePath) {
                    void deleteFileFromStorage(previousPending).catch((error) => console.warn("Previous unsaved logo could not be deleted.", error));
                  }
                }}
              />
            </div>


            <div className="grid gap-4 md:grid-cols-2">
              <label><span className="mb-1 block text-sm font-bold">Site name</span><input value={siteName} onChange={e=>setSiteName(e.target.value)} className="w-full rounded-xl border px-3 py-2.5" /></label>
              <label><span className="mb-1 block text-sm font-bold">Tagline</span><input value={tagline} onChange={e=>setTagline(e.target.value)} className="w-full rounded-xl border px-3 py-2.5" /></label>
            </div>
            <label><span className="mb-1 block text-sm font-bold">SEO page title</span><input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} maxLength={70} className="w-full rounded-xl border px-3 py-2.5" /></label>
            <label><span className="mb-1 block text-sm font-bold">SEO meta description</span><textarea value={seoDescription} onChange={e=>setSeoDescription(e.target.value)} maxLength={180} rows={3} className="w-full rounded-xl border px-3 py-2.5" /></label>

            <div className="grid gap-5 md:grid-cols-3">
              <div><span className="mb-2 block text-sm font-bold">Favicon</span>{faviconUrl&&<img src={faviconUrl} alt="Favicon preview" className="mb-2 h-16 w-16 rounded-xl border bg-white object-contain"/>}<FileUpload folder="images" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" label="Upload favicon" customMetadata={{imagePurpose:"tenant-favicon",brandingTenantId:tenantId.trim()}} onUploaded={file=>{setFaviconUrl(file.downloadUrl);setFaviconPath(file.filePath)}} /></div>
              <div><span className="mb-2 block text-sm font-bold">Social / SEO image</span>{socialImageUrl&&<img src={socialImageUrl} alt="Social preview" className="mb-2 h-16 w-28 rounded-xl border object-cover"/>}<FileUpload folder="images" accept="image/jpeg,image/png,image/webp" label="Upload social image" customMetadata={{imagePurpose:"tenant-social-image",brandingTenantId:tenantId.trim()}} onUploaded={file=>{setSocialImageUrl(file.downloadUrl);setSocialImagePath(file.filePath)}} /></div>
              <div><span className="mb-2 block text-sm font-bold">Default course image</span>{defaultCourseImageUrl&&<img src={defaultCourseImageUrl} alt="Default course" className="mb-2 h-16 w-28 rounded-xl border object-cover"/>}<FileUpload folder="images" accept="image/jpeg,image/png,image/webp" label="Upload default image" customMetadata={{imagePurpose:"tenant-default-course-image",brandingTenantId:tenantId.trim()}} onUploaded={file=>{setDefaultCourseImageUrl(file.downloadUrl);setDefaultCourseImagePath(file.filePath)}} /></div>
            </div>

            {[
              ["Primary", primaryColor, setPrimaryColor],
              ["Secondary", secondaryColor, setSecondaryColor],
              ["Accent", accentColor, setAccentColor],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="flex items-center justify-between rounded-xl border p-3">
                <span className="font-bold">{String(label)} colour</span>
                <input type="color" value={String(value)} onChange={e => (setter as (v: string) => void)(e.target.value)} className="h-10 w-20"/>
              </label>
            ))}

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{message}</span>
              <button className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white">Save branding</button>
            </div>
          </form>
        </PlatformCard>

        <PlatformCard title="Preview">
          <div className="overflow-hidden rounded-3xl border">
            <div className="p-6 text-white" style={{ background: primaryColor }}>
              <div className="flex items-center gap-3">
                {logoUrl ? <img src={logoUrl} alt="Tenant logo" className="h-12 w-12 rounded-xl bg-white object-contain"/> : <div className="h-12 w-12 rounded-xl bg-white/20"/>}
                <div><p className="text-lg font-black">{siteName || "Tenant learning portal"}</p><p className="text-sm opacity-80">{tagline || "Powered by Medical Elites"}</p></div>
              </div>
            </div>
            <div className="p-6" style={{ background: secondaryColor, color: "white" }}>
              <button className="rounded-xl px-4 py-2 font-bold text-white" style={{ background: accentColor }}>Continue learning</button>
            </div>
          </div>
        </PlatformCard>
      </div>
    </PlatformLayout>
  );
}