param([switch]$SkipValidation)
$ErrorActionPreference = "Stop"
if (-not (Test-Path ".\package.json")) { throw "Run this script from the Medical Elites LMS project root." }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = ".\public-marketplace-branding-navigation-backup-$stamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Project-Path([string]$Path) {
  $relative = $Path
  if ($relative.StartsWith(".\")) { $relative = $relative.Substring(2) }
  return Join-Path (Get-Location).Path $relative
}
function Save-NoBom([string]$Path,[string]$Content) {
  $full = Project-Path $Path
  $dir = Split-Path $full -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($full,$Content.TrimStart([char]0xFEFF),$utf8NoBom)
}
function Backup-One([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  $relative=$Path; if($relative.StartsWith(".\")){$relative=$relative.Substring(2)}
  $target=Join-Path $backupRoot $relative; $dir=Split-Path $target -Parent
  if($dir){New-Item -ItemType Directory -Path $dir -Force|Out-Null}
  Copy-Item $Path $target -Force
}

@(
  ".\functions\src\index.ts",
  ".\src\pages\platform\PlatformMarketplacePage.tsx",
  ".\src\components\platform\PlatformAccessGate.tsx",
  ".\src\routes\AppRouter.tsx",
  ".\src\pages\CourseUnitPage.tsx",
  ".\src\components\home\FeaturedCourses.tsx",
  ".\index.html"
) | ForEach-Object { Backup-One $_ }
Write-Host "Backups created at $backupRoot" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 1. Unified marketplace-approved public course catalogue.
# ---------------------------------------------------------------------------
$functionsPath = ".\functions\src\index.ts"
$functions = Get-Content $functionsPath -Raw
$marker = "/** Public, server-enriched course-unit catalogue used by public and student course cards. */"
$start = $functions.IndexOf($marker)
if ($start -lt 0) { throw "STOP: public catalogue anchor not found." }
$fnStart = $functions.IndexOf("export const getPublicCourseCatalogueSnapshot",$start)
$end = $functions.IndexOf("`n);",$fnStart)
if ($end -lt 0) { throw "STOP: public catalogue function end not found." }
$end += 3
$newCatalogue = @'
/** Public marketplace-approved course-unit catalogue used by homepage and /courses. */
export const getPublicCourseCatalogueSnapshot = onCall(
  { region: "us-central1", timeoutSeconds: 60, memory: "512MiB", enforceAppCheck: false },
  async () => {
    const productSnapshot = await db
      .collection("marketplaceProducts")
      .where("status", "==", "published")
      .where("type", "==", "course_unit")
      .limit(100)
      .get();

    const rows = await Promise.all(productSnapshot.docs.map(async (productDoc) => {
      const product = productDoc.data();
      const courseUnitId = financeText(
        product.courseUnitId ?? (Array.isArray(product.linkedResourceIds) ? product.linkedResourceIds[0] : ""),
        180,
      );
      if (!courseUnitId) return null;

      const courseDoc = await db.collection("courses").doc(courseUnitId).get();
      if (!courseDoc.exists || courseDoc.get("published") === false) return null;
      const course = courseDoc.data() ?? {};

      const [byUnit, byCourse] = await Promise.all([
        db.collection("modules").where("courseUnitId", "==", courseUnitId).get(),
        db.collection("modules").where("courseId", "==", courseUnitId).get(),
      ]);
      const moduleMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
      [...byUnit.docs, ...byCourse.docs].forEach((item) => moduleMap.set(item.id, item));
      const activeModules = [...moduleMap.values()].filter((item) => item.get("published") !== false);
      if (activeModules.length < 1) return null;

      const lessonResults = await Promise.allSettled(
        activeModules.map((moduleDoc) => db.collection("lessons").where("moduleId", "==", moduleDoc.id).get()),
      );
      const lessonMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
      lessonResults.forEach((result) => {
        if (result.status !== "fulfilled") return;
        result.value.docs.forEach((item) => {
          const row = item.data();
          const active = row.published !== false && row.isPublished !== false && String(row.status ?? "active").toLowerCase() !== "archived";
          if (active) lessonMap.set(item.id, item);
        });
      });
      if (lessonMap.size < 1) return null;

      const image = financeText(product.thumbnailUrl, 1200)
        || financeText(course.image ?? course.imageUrl ?? course.thumbnailUrl, 1200)
        || "/images/course-placeholder.svg";

      return {
        id: courseDoc.id,
        slug: financeText(course.slug, 180) || courseDoc.id,
        title: financeText(product.title ?? course.title, 240) || "Untitled course unit",
        category: financeText(product.categoryName ?? course.category, 120) || "Health Sciences",
        description: financeText(product.shortDescription ?? product.description ?? course.description, 2000) || "Explore this Medical Elites course unit.",
        programmeId: financeText(product.programmeId ?? course.programmeId, 180),
        programmeTitle: financeText(product.programmeTitle ?? course.programmeTitle, 240) || "Health Sciences",
        image,
        imagePath: financeText(course.imagePath, 1200) || undefined,
        tutor: financeText(product.sellerName ?? course.tutor ?? course.tutorName, 160) || "Medical Elites Tutor",
        duration: financeText(course.duration, 80) || "Self-paced",
        modules: activeModules.length,
        lessons: lessonMap.size,
        level: financeText(course.level, 80) || "Diploma",
        rating: Math.max(0, finiteNumber(product.ratingAverage ?? course.rating ?? course.ratingAverage, 0)),
        students: String(Math.max(0, finiteNumber(product.salesCount ?? course.students, 0))),
        certificate: product.certificateIncluded === true || course.certificate !== false,
        isFeatured: product.featured === true,
        isNew: course.isNew === true,
        published: true,
        marketplaceProductId: productDoc.id,
        marketplaceApproved: true,
        marketplaceStatus: "published",
      };
    }));

    return { courseUnits: rows.filter((row): row is NonNullable<typeof row> => row !== null) };
  },
);
'@
$functions = $functions.Substring(0,$start) + $newCatalogue + $functions.Substring($end)

# ---------------------------------------------------------------------------
# 2. AI-assisted course-unit marketplace review callable.
# ---------------------------------------------------------------------------
if ($functions -notmatch "reviewMarketplaceCourseUnitForApproval") {
$functions += @'

/** AI-assisted marketplace course-unit quality review with optional automatic approval. */
export const reviewMarketplaceCourseUnitForApproval = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: [OPENAI_API_KEY],
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Please sign in.");

    const profile = await db.collection("users").doc(request.auth.uid).get();
    const role = String(profile.get("role") ?? "");
    const platformRole = String(profile.get("platformRole") ?? "");
    const allowedRoles = new Set(["super_admin", "platform_admin", "platform_support", "platform_finance"]);
    if (role !== "admin" || !allowedRoles.has(platformRole)) {
      throw new HttpsError("permission-denied", "Platform marketplace approval requires a platform administrator account.");
    }

    const input = (request.data ?? {}) as { productId?: unknown; autoApprove?: unknown };
    const productId = financeText(input.productId, 180);
    const autoApprove = input.autoApprove === true;
    if (!productId) throw new HttpsError("invalid-argument", "A marketplace product ID is required.");

    const productRef = db.collection("marketplaceProducts").doc(productId);
    const productDoc = await productRef.get();
    if (!productDoc.exists) throw new HttpsError("not-found", "Marketplace product not found.");
    const product = productDoc.data() ?? {};
    if (String(product.type ?? "") !== "course_unit") {
      throw new HttpsError("failed-precondition", "AI course approval applies only to course-unit products.");
    }

    const courseUnitId = financeText(product.courseUnitId ?? (Array.isArray(product.linkedResourceIds) ? product.linkedResourceIds[0] : ""),180);
    if (!courseUnitId) throw new HttpsError("failed-precondition", "This product is not linked to a course unit.");
    const courseDoc = await db.collection("courses").doc(courseUnitId).get();
    if (!courseDoc.exists) throw new HttpsError("failed-precondition", "Linked course unit not found.");
    const course = courseDoc.data() ?? {};

    const [byUnit, byCourse] = await Promise.all([
      db.collection("modules").where("courseUnitId", "==", courseUnitId).get(),
      db.collection("modules").where("courseId", "==", courseUnitId).get(),
    ]);
    const moduleMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
    [...byUnit.docs, ...byCourse.docs].forEach((item) => moduleMap.set(item.id,item));
    const activeModules = [...moduleMap.values()].filter((item) => item.get("published") !== false);

    const lessonResults = await Promise.allSettled(activeModules.map((moduleDoc) =>
      db.collection("lessons").where("moduleId", "==", moduleDoc.id).get(),
    ));
    let lessonCount = 0;
    lessonResults.forEach((result) => {
      if (result.status !== "fulfilled") return;
      result.value.docs.forEach((item) => {
        const row = item.data();
        if (row.published !== false && row.isPublished !== false && String(row.status ?? "active").toLowerCase() !== "archived") lessonCount += 1;
      });
    });

    const deterministicEligible = courseDoc.get("published") !== false && activeModules.length >= 1 && lessonCount >= 1;
    let aiScore = deterministicEligible ? 75 : 0;
    let aiRecommendation: "approve" | "manual_review" | "reject" = deterministicEligible ? "manual_review" : "reject";
    let aiReason = deterministicEligible
      ? "Minimum structure is satisfied."
      : "Course unit requires at least one active module and one active lesson.";

    if (deterministicEligible) {
      try {
        const apiKey = OPENAI_API_KEY.value();
        if (apiKey) {
          const { default: OpenAI } = await import("openai");
          const client = new OpenAI({ apiKey });
          const completion = await client.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
              { role: "system", content: "Review this health-sciences marketplace course unit for publication quality. Assess learner clarity, metadata completeness, educational coherence, presentation quality, and obvious safety concerns. Return JSON only." },
              { role: "user", content: JSON.stringify({
                title: financeText(product.title ?? course.title,240),
                description: financeText(product.description ?? product.shortDescription ?? course.description,4000),
                moduleCount: activeModules.length,
                lessonCount,
                hasThumbnail: Boolean(financeText(product.thumbnailUrl ?? course.image,1200)),
                programmeTitle: financeText(product.programmeTitle ?? course.programmeTitle,240),
              }) },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "marketplace_course_review",
                strict: true,
                schema: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    score: { type: "number", minimum: 0, maximum: 100 },
                    recommendation: { type: "string", enum: ["approve", "manual_review", "reject"] },
                    reason: { type: "string" },
                  },
                  required: ["score", "recommendation", "reason"],
                },
              },
            },
            max_completion_tokens: 1200,
          });
          const text = completion.choices[0]?.message?.content;
          if (text) {
            const parsed = JSON.parse(text) as { score?: number; recommendation?: "approve" | "manual_review" | "reject"; reason?: string };
            aiScore = Math.max(0,Math.min(100,Number(parsed.score ?? aiScore)));
            aiRecommendation = parsed.recommendation ?? aiRecommendation;
            aiReason = financeText(parsed.reason,1200) || aiReason;
          }
        }
      } catch (error) {
        console.warn("AI marketplace review failed; manual review remains available.",error);
      }
    }

    const canAutoApprove = deterministicEligible && aiRecommendation === "approve" && aiScore >= 75;
    const status = autoApprove && canAutoApprove ? "published" : deterministicEligible ? "review" : "submitted";
    await productRef.set({
      status,
      approval: {
        deterministicEligible,
        moduleCount: activeModules.length,
        lessonCount,
        aiScore,
        aiRecommendation,
        aiReason,
        reviewedBy: request.auth.uid,
        reviewedAt: FieldValue.serverTimestamp(),
        autoApproved: autoApprove && canAutoApprove,
      },
      ...(status === "published" ? { publishedAt: FieldValue.serverTimestamp() } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    },{merge:true});

    return { productId,courseUnitId,deterministicEligible,moduleCount:activeModules.length,lessonCount,aiScore,aiRecommendation,aiReason,autoApproved:autoApprove&&canAutoApprove,status };
  },
);
'@
}
Save-NoBom $functionsPath $functions

# ---------------------------------------------------------------------------
# 3. Platform marketplace manual + AI review UI.
# ---------------------------------------------------------------------------
$platformMarketplacePath = ".\src\pages\platform\PlatformMarketplacePage.tsx"
$platformMarketplace = @'
import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../config/firebase";
import PlatformLayout from "../../components/platform/PlatformLayout";
import type { MarketplaceProduct } from "../../domains/marketplace";

type AiReviewResult = {
  deterministicEligible: boolean;
  moduleCount: number;
  lessonCount: number;
  aiScore: number;
  aiRecommendation: "approve" | "manual_review" | "reject";
  aiReason: string;
  autoApproved: boolean;
  status: MarketplaceProduct["status"];
};

export default function PlatformMarketplacePage(){
  const [items,setItems]=useState<MarketplaceProduct[]>([]);
  const [loading,setLoading]=useState(true);
  const [workingId,setWorkingId]=useState("");
  const [message,setMessage]=useState("");
  const load=useCallback(async()=>{setLoading(true);try{const snap=await getDocs(query(collection(db,"marketplaceProducts"),orderBy("updatedAt","desc")));setItems(snap.docs.map(s=>({id:s.id,...s.data()}) as MarketplaceProduct));}finally{setLoading(false)}},[]);
  useEffect(()=>{void load()},[load]);

  async function review(productId:string,autoApprove:boolean){
    try{
      setWorkingId(productId);setMessage("");
      const callable=httpsCallable<{productId:string;autoApprove:boolean},AiReviewResult>(functions,"reviewMarketplaceCourseUnitForApproval");
      const result=(await callable({productId,autoApprove})).data;
      setMessage(result.autoApproved?`Automatically approved. AI score ${result.aiScore}/100. ${result.aiReason}`:`Review completed. Status: ${result.status}. AI score ${result.aiScore}/100. ${result.aiReason}`);
      await load();
    }catch(error){setMessage(error instanceof Error?error.message:"Marketplace review could not be completed.")}finally{setWorkingId("")}
  }

  async function setStatus(item:MarketplaceProduct,status:MarketplaceProduct["status"]){
    if(status==="published" && item.type==="course_unit"){await review(item.id,true);return;}
    await updateDoc(doc(db,"marketplaceProducts",item.id),{status,updatedAt:serverTimestamp(),...(status==="published"?{publishedAt:serverTimestamp()}: {})});await load();
  }

  return <PlatformLayout title="Marketplace Operations" subtitle="AI-assisted eligibility review with manual moderation control.">
    {message&&<p className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 font-semibold text-blue-900">{message}</p>}
    <div className="rounded-2xl border bg-white"><div className="border-b p-5"><h2 className="text-xl font-black">Product moderation queue</h2><p className="mt-1 text-sm text-slate-600">Course units require at least one active module and one active lesson before marketplace publication.</p></div>
    {loading?<div className="p-8 text-center">Loading products...</div>:items.length===0?<div className="p-8 text-center text-slate-600">No marketplace products found.</div>:<div className="divide-y">{items.map(item=><div key={item.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 gap-4">{item.thumbnailUrl?<img src={item.thumbnailUrl} alt="" className="h-20 w-28 rounded-xl border object-cover"/>:<div className="h-20 w-28 rounded-xl bg-slate-100"/>}<div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{item.title}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase">{item.status}</span></div><p className="mt-1 text-sm text-slate-600">{item.sellerName} - {item.type.replaceAll("_"," ")} - {item.price.currency} {item.price.amount.toLocaleString()}</p></div></div><div className="flex flex-wrap gap-2">{item.type==="course_unit"&&<><button disabled={workingId===item.id} onClick={()=>void review(item.id,false)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800 disabled:opacity-50">AI Review</button><button disabled={workingId===item.id} onClick={()=>void review(item.id,true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">AI Auto Approve</button></>}<button onClick={()=>void setStatus(item,"review")} className="rounded-lg border px-3 py-2 text-sm font-bold">Manual Review</button><button onClick={()=>void setStatus(item,"published")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white">Publish</button><button onClick={()=>void setStatus(item,"hidden")} className="rounded-lg border px-3 py-2 text-sm font-bold">Hide</button><button onClick={()=>void setStatus(item,"archived")} className="rounded-lg border px-3 py-2 text-sm font-bold text-red-700">Archive</button></div></div>)}</div>}</div>
  </PlatformLayout>
}
'@
Save-NoBom $platformMarketplacePath $platformMarketplace

# ---------------------------------------------------------------------------
# 4. Public navigation shell and route wrapping.
# ---------------------------------------------------------------------------
$publicShell = @'
import type { ReactNode } from "react";
import Navbar from "../home/Navbar";
import Footer from "./Footer";
export default function PublicPageShell({children}:{children:ReactNode}){return <div className="min-h-screen bg-slate-50 text-slate-900"><Navbar/><main id="main-content">{children}</main><Footer/></div>}
'@
Save-NoBom ".\src\components\layout\PublicPageShell.tsx" $publicShell

$routerPath=".\src\routes\AppRouter.tsx"; $router=Get-Content $routerPath -Raw
if($router -notmatch 'PublicPageShell'){$router=$router.Replace('import PlatformAccessGate from "../components/platform/PlatformAccessGate";','import PlatformAccessGate from "../components/platform/PlatformAccessGate";'+"`r`n"+'import PublicPageShell from "../components/layout/PublicPageShell";')}
$replacements=@{
'<Route path="/about" element={<AboutPage />} />'='<Route path="/about" element={<PublicPageShell><AboutPage /></PublicPageShell>} />';
'<Route path="/privacy" element={<PrivacyPolicyPage />} />'='<Route path="/privacy" element={<PublicPageShell><PrivacyPolicyPage /></PublicPageShell>} />';
'<Route path="/terms" element={<TermsPage />} />'='<Route path="/terms" element={<PublicPageShell><TermsPage /></PublicPageShell>} />';
'<Route path="/testimonials" element={<TestimonialsPage />} />'='<Route path="/testimonials" element={<PublicPageShell><TestimonialsPage /></PublicPageShell>} />';
'<Route path="/contact" element={<ContactPage />} />'='<Route path="/contact" element={<PublicPageShell><ContactPage /></PublicPageShell>} />';
'<Route path="/courses" element={<CourseUnitPage />} />'='<Route path="/courses" element={<PublicPageShell><CourseUnitPage /></PublicPageShell>} />';
'<Route path="/courses/:slug" element={<CourseUnitDetailsPage />} />'='<Route path="/courses/:slug" element={<PublicPageShell><CourseUnitDetailsPage /></PublicPageShell>} />';
'<Route path="/marketplace" element={<MarketplaceHomePage />} />'='<Route path="/marketplace" element={<PublicPageShell><MarketplaceHomePage /></PublicPageShell>} />';
'<Route path="/marketplace/products/:productId" element={<MarketplaceProductPage />} />'='<Route path="/marketplace/products/:productId" element={<PublicPageShell><MarketplaceProductPage /></PublicPageShell>} />';
'<Route path="/marketplace/sellers/:sellerId" element={<MarketplaceSellerPage />} />'='<Route path="/marketplace/sellers/:sellerId" element={<PublicPageShell><MarketplaceSellerPage /></PublicPageShell>} />';
'<Route path="/store/:sellerId" element={<MarketplaceSellerPage />} />'='<Route path="/store/:sellerId" element={<PublicPageShell><MarketplaceSellerPage /></PublicPageShell>} />'
}
foreach($key in $replacements.Keys){if($router.Contains($key)){$router=$router.Replace($key,$replacements[$key])}}
Save-NoBom $routerPath $router

# ---------------------------------------------------------------------------
# 5. Platform dashboard/link access consistency.
# ---------------------------------------------------------------------------
$gatePath=".\src\components\platform\PlatformAccessGate.tsx"; $gate=Get-Content $gatePath -Raw
$old='  return profile.platformRole === "super_admin" || bootstrapEmails.has(String(profile.email ?? "").toLowerCase());'
$new=@'
  const platformRole = String(profile.platformRole ?? "");
  const allowedPlatformRoles = new Set(["super_admin", "platform_admin", "platform_support", "platform_finance"]);
  return allowedPlatformRoles.has(platformRole) || bootstrapEmails.has(String(profile.email ?? "").toLowerCase());
'@
if($gate.Contains($old)){$gate=$gate.Replace($old,$new)}
Save-NoBom $gatePath $gate

# ---------------------------------------------------------------------------
# 6. Public catalogue copy and SEO/branding assets.
# ---------------------------------------------------------------------------
$coursePagePath=".\src\pages\CourseUnitPage.tsx"; $coursePage=Get-Content $coursePagePath -Raw
$coursePage=$coursePage.Replace('Heading subtitle="Medical Elites Academy" title="Explore Published Course Units"','Heading subtitle="Medical Elites Marketplace" title="Explore Approved Course Units"')
$coursePage=$coursePage.Replace('Browse publicly available medical and health sciences course units from institutions and educators on Medical Elites.','Browse course units approved for the Medical Elites Marketplace. Every displayed course unit contains at least one active module and one active lesson.')
$coursePage=$coursePage.Replace('Published course units will appear here automatically once educators make them public.','Marketplace-approved course units will appear here after eligibility and quality review.')
Save-NoBom $coursePagePath $coursePage

$featuredPath=".\src\components\home\FeaturedCourses.tsx"; $featured=Get-Content $featuredPath -Raw
$featured=$featured.Replace('title="Start with our most popular medical course units"','title="Explore marketplace-approved medical course units"')
$featured=$featured.Replace('Published course units will appear here as soon as educators make them available.','Marketplace-approved course units will appear here once they meet publication requirements.')
Save-NoBom $featuredPath $featured

$indexPath=".\index.html"; $index=Get-Content $indexPath -Raw
if($index -notmatch 'apple-touch-icon'){$index=$index.Replace('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />','<link rel="icon" type="image/svg+xml" href="/favicon.svg" />'+"`r`n"+'    <link rel="apple-touch-icon" href="/favicon.svg" />')}
if($index -notmatch 'meta name="keywords"'){$index=$index.Replace('<meta name="application-name" content="Medical Elites" />','<meta name="application-name" content="Medical Elites" />'+"`r`n"+'    <meta name="keywords" content="medical education, health sciences education, clinical medicine, nursing education, medical LMS, online medical courses, Uganda health training, medical assessments" />'+"`r`n"+'    <meta name="author" content="Medical Elites" />'+"`r`n"+'    <meta name="robots" content="index,follow,max-image-preview:large" />')}
if($index -notmatch 'property="og:image"'){$index=$index.Replace('<meta property="og:url" content="https://medicalelites.org/" />','<meta property="og:url" content="https://medicalelites.org/" />'+"`r`n"+'    <meta property="og:image" content="https://medicalelites.org/images/medical-elites-social-card.svg" />'+"`r`n"+'    <meta property="og:image:alt" content="Medical Elites medical education platform" />')}
if($index -notmatch 'name="twitter:title"'){$index=$index.Replace('<meta name="twitter:card" content="summary_large_image" />','<meta name="twitter:card" content="summary_large_image" />'+"`r`n"+'    <meta name="twitter:title" content="Medical Elites | Medical Education & Learning Platform" />'+"`r`n"+'    <meta name="twitter:description" content="Digital medical education, assessments, clinical learning, tutor commerce and AI in one platform." />'+"`r`n"+'    <meta name="twitter:image" content="https://medicalelites.org/images/medical-elites-social-card.svg" />')}
Save-NoBom $indexPath $index

$socialCard=@'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset="0.55" stop-color="#1d4ed8"/><stop offset="1" stop-color="#0891b2"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#bg)"/><circle cx="1040" cy="110" r="180" fill="#fff" opacity=".08"/><circle cx="1050" cy="520" r="250" fill="#fff" opacity=".05"/>
<g transform="translate(100 150)"><rect width="112" height="112" rx="28" fill="#fff"/><path d="M56 20v72M20 56h72" stroke="#1d4ed8" stroke-width="18" stroke-linecap="round"/></g>
<text x="240" y="220" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="72" font-weight="700">Medical Elites</text>
<text x="105" y="335" fill="#dbeafe" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="600">Medical Education &amp; Learning Platform</text>
<text x="105" y="405" fill="#e2e8f0" font-family="Arial,Helvetica,sans-serif" font-size="27">Learn - Teach - Assess - Build clinical competence - Grow professionally</text>
<text x="105" y="530" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700">medicalelites.org</text>
</svg>
'@
Save-NoBom ".\public\images\medical-elites-social-card.svg" $socialCard

Write-Host "`nBatch applied." -ForegroundColor Green
if(-not $SkipValidation){
 Write-Host "`n===== TYPECHECK =====" -ForegroundColor Cyan; npm run typecheck; if($LASTEXITCODE-ne 0){throw "Frontend typecheck failed."}
 Write-Host "`n===== FRONTEND BUILD =====" -ForegroundColor Cyan; npm run build; if($LASTEXITCODE-ne 0){throw "Frontend build failed."}
 Write-Host "`n===== FUNCTIONS BUILD =====" -ForegroundColor Cyan; Push-Location ".\functions"; try{npm run build;if($LASTEXITCODE-ne 0){throw "Functions build failed."}}finally{Pop-Location}
}
Write-Host "`nDeploy with:" -ForegroundColor Yellow
Write-Host 'firebase deploy --only "functions:getPublicCourseCatalogueSnapshot,functions:reviewMarketplaceCourseUnitForApproval,hosting"' -ForegroundColor White
