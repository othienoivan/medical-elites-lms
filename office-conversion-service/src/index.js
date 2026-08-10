import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import express from "express";
import { Firestore, FieldValue } from "@google-cloud/firestore";
import { Storage } from "@google-cloud/storage";

const execFileAsync = promisify(execFile);
const app = express();
app.use(express.json({ limit: "2mb" }));

const firestore = new Firestore();
const storage = new Storage();
const region = process.env.GOOGLE_CLOUD_REGION || "us-central1";
const collectionName = "officeDocumentPreviews";

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "medical-elites-office-converter", region });
});

app.post("/", async (request, response) => {
  const event = normalizeStorageEvent(request.body);
  if (!event) {
    response.status(400).json({ error: "Unsupported event payload." });
    return;
  }

  const { bucket, name, generation } = event;
  if (!isSupportedOfficeFile(name) || isGeneratedPreview(name)) {
    response.status(204).end();
    return;
  }

  try {
    await convertOfficeDocument({ bucket, name, generation });
    response.status(204).end();
  } catch (error) {
    console.error("Office conversion failed", error);
    response.status(500).json({
      error: error instanceof Error ? error.message : "Unknown conversion error",
    });
  }
});

app.post("/process", async (request, response) => {
  const expectedSecret = process.env.PROCESSOR_SHARED_SECRET;
  if (expectedSecret && request.header("x-medical-elites-secret") !== expectedSecret) {
    response.status(403).json({ error: "Forbidden" });
    return;
  }

  const bucket = String(request.body?.bucket || "");
  const name = String(request.body?.name || "");
  const generation = request.body?.generation ? String(request.body.generation) : undefined;

  if (!bucket || !isSupportedOfficeFile(name)) {
    response.status(400).json({ error: "bucket and a supported Office object name are required" });
    return;
  }

  try {
    const previewId = await convertOfficeDocument({ bucket, name, generation });
    response.json({ ok: true, previewId });
  } catch (error) {
    console.error("Manual Office conversion failed", error);
    response.status(500).json({
      error: error instanceof Error ? error.message : "Unknown conversion error",
    });
  }
});

async function convertOfficeDocument({ bucket, name, generation }) {
  const previewId = createPreviewId(name);
  const recordRef = firestore.collection(collectionName).doc(previewId);
  const sourceFile = storage.bucket(bucket).file(name, generation ? { generation } : undefined);
  const [metadata] = await sourceFile.getMetadata();
  const sourceSize = Number(metadata.size || 0);
  const customMetadata = metadata.metadata || {};
  const htmlConversionFormat = String(customMetadata.htmlConversionFormat || "");

  await recordRef.set(
    {
      sourcePath: name,
      sourceName: path.basename(name),
      sourceGeneration: generation || metadata.generation || null,
      sourceSize,
      sourceContentType: metadata.contentType || null,
      ownerUid: customMetadata.uploaderUid || null,
      lessonId: customMetadata.lessonId || null,
      courseUnitId: customMetadata.courseUnitId || null,
      htmlConversionFormat: htmlConversionFormat || null,
      status: "processing",
      errorMessage: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
      startedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const extension = path.extname(name).toLowerCase();
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "medical-elites-office-"));
  const inputPath = path.join(workDir, `source${extension}`);
  const outputDir = path.join(workDir, "converted");

  try {
    await fs.mkdir(outputDir, { recursive: true });
    await sourceFile.download({ destination: inputPath });

    await execFileAsync(
      "libreoffice",
      [
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        outputDir,
        inputPath,
      ],
      {
        timeout: 12 * 60 * 1000,
        maxBuffer: 20 * 1024 * 1024,
      }
    );

    const outputFiles = await fs.readdir(outputDir);
    const generatedPdfName = outputFiles.find((fileName) => fileName.toLowerCase().endsWith(".pdf"));
    if (!generatedPdfName) {
      throw new Error("LibreOffice did not create a PDF preview.");
    }

    const pdfPath = path.join(outputDir, generatedPdfName);
    await fs.access(pdfPath);

    const previewPdfPath = `office-previews/${previewId}/preview.pdf`;
    const downloadToken = crypto.randomUUID();
    await storage.bucket(bucket).upload(pdfPath, {
      destination: previewPdfPath,
      metadata: {
        contentType: "application/pdf",
        cacheControl: "private,max-age=3600",
        metadata: {
          sourcePath: name,
          previewId,
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    const encodedPath = encodeURIComponent(previewPdfPath);
    const previewPdfUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    let htmlResult = null;
    if (extension === ".pptx" && ["html-package", "self-contained-html5"].includes(htmlConversionFormat)) {
      htmlResult = await convertPowerPointPdfToHtml({
        bucket,
        sourcePath: name,
        previewId,
        pdfPath,
        outputDir,
        format: htmlConversionFormat,
        customMetadata,
      });
    }

    await recordRef.set(
      {
        status: "ready",
        previewPdfPath,
        previewPdfUrl,
        ...(htmlResult || {}),
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return previewId;
  } catch (error) {
    await recordRef.set(
      {
        sourcePath: name,
        sourceName: path.basename(name),
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown conversion error",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    throw error;
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}

async function convertPowerPointPdfToHtml({
  bucket,
  sourcePath,
  previewId,
  pdfPath,
  outputDir,
  format,
  customMetadata,
}) {
  const slidesDir = path.join(outputDir, "slides");
  await fs.mkdir(slidesDir, { recursive: true });
  const prefix = path.join(slidesDir, "slide");

  await execFileAsync(
    "pdftoppm",
    ["-jpeg", "-r", "144", "-jpegopt", "quality=84", pdfPath, prefix],
    { timeout: 12 * 60 * 1000, maxBuffer: 20 * 1024 * 1024 },
  );

  const slideFiles = (await fs.readdir(slidesDir))
    .filter((fileName) => fileName.toLowerCase().endsWith(".jpg"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (slideFiles.length === 0) throw new Error("No PowerPoint slides were generated.");

  const outputPath = createHtmlOutputPath(sourcePath, previewId, format);
  const title = path.basename(sourcePath).replace(/\.pptx$/i, "");
  let html;

  if (format === "self-contained-html5") {
    const sources = [];
    for (const fileName of slideFiles) {
      const bytes = await fs.readFile(path.join(slidesDir, fileName));
      sources.push(`data:image/jpeg;base64,${bytes.toString("base64")}`);
    }
    html = buildSlideViewerHtml({ title, slideSources: sources });
  } else {
    const slideSources = [];
    const outputRoot = createHtmlOutputRoot(sourcePath);
    for (let index = 0; index < slideFiles.length; index += 1) {
      const sourceFileName = slideFiles[index];
      const slideObjectPath = `${outputRoot}/${previewId}-slide-${String(index + 1).padStart(3, "0")}.jpg`;
      const token = crypto.randomUUID();
      await storage.bucket(bucket).upload(path.join(slidesDir, sourceFileName), {
        destination: slideObjectPath,
        metadata: {
          contentType: "image/jpeg",
          cacheControl: "private,max-age=86400",
          metadata: {
            uploaderUid: String(customMetadata.uploaderUid || ""),
            tenantId: String(customMetadata.tenantId || ""),
            courseUnitId: String(customMetadata.courseUnitId || ""),
            lessonId: String(customMetadata.lessonId || ""),
            generatedFrom: sourcePath,
            firebaseStorageDownloadTokens: token,
          },
        },
      });
      slideSources.push(firebaseStorageDownloadUrl(bucket, slideObjectPath, token));
    }
    html = buildSlideViewerHtml({ title, slideSources });
  }

  const htmlFile = path.join(outputDir, `${previewId}.html`);
  await fs.writeFile(htmlFile, html, "utf8");
  const htmlToken = crypto.randomUUID();
  await storage.bucket(bucket).upload(htmlFile, {
    destination: outputPath,
    metadata: {
      contentType: "text/html; charset=utf-8",
      cacheControl: "private,max-age=3600",
      metadata: {
        uploaderUid: String(customMetadata.uploaderUid || ""),
        tenantId: String(customMetadata.tenantId || ""),
        courseUnitId: String(customMetadata.courseUnitId || ""),
        lessonId: String(customMetadata.lessonId || ""),
        htmlConversionFormat: format,
        generatedFrom: sourcePath,
        firebaseStorageDownloadTokens: htmlToken,
      },
    },
  });

  return {
    htmlStatus: "ready",
    htmlFormat: format,
    htmlPath: outputPath,
    htmlUrl: firebaseStorageDownloadUrl(bucket, outputPath, htmlToken),
    slideCount: slideFiles.length,
  };
}

function createHtmlOutputRoot(sourcePath) {
  const marker = "/powerpoints/";
  const markerIndex = sourcePath.indexOf(marker);
  if (markerIndex >= 0) return `${sourcePath.slice(0, markerIndex)}/html5`;
  if (sourcePath.startsWith("powerpoints/")) return "html5";
  throw new Error("Unable to resolve the HTML output folder for this PowerPoint.");
}

function createHtmlOutputPath(sourcePath, previewId, format) {
  const suffix = format === "html-package" ? "package" : "self-contained";
  return `${createHtmlOutputRoot(sourcePath)}/${previewId}-${suffix}.html`;
}

function firebaseStorageDownloadUrl(bucket, objectPath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

function buildSlideViewerHtml({ title, slideSources }) {
  const escapedTitle = escapeHtml(title);
  const slides = slideSources.map((src, index) => `<section class="slide${index === 0 ? " active" : ""}" data-index="${index}"><img src="${src}" alt="Slide ${index + 1}" loading="${index === 0 ? "eager" : "lazy"}"></section>`).join("\n");
  const thumbs = slideSources.map((src, index) => `<button class="thumb${index === 0 ? " current" : ""}" data-go="${index}" aria-label="Go to slide ${index + 1}"><img src="${src}" alt=""></button>`).join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${escapedTitle}</title>
<style>
:root{--bg:#101216;--panel:#171a20;--text:#f4f6f8;--muted:#aeb6c2;--accent:#8ec5ff}*{box-sizing:border-box}html,body{height:100%;margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;overflow:hidden}.app{height:100%;display:grid;grid-template-rows:1fr auto}.stage{position:relative;display:grid;place-items:center;min-height:0;padding:12px}.slide{display:none;max-width:100%;max-height:100%;align-items:center;justify-content:center}.slide.active{display:flex}.slide img{max-width:100%;max-height:calc(100vh - 86px);object-fit:contain;border-radius:8px;background:white}.controls{display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--panel);border-top:1px solid rgba(255,255,255,.08)}button{border:0;border-radius:10px;padding:9px 12px;background:#262b33;color:var(--text);font-weight:650;cursor:pointer}.progress{height:6px;flex:1;background:#2a3038;border-radius:999px;overflow:hidden}.bar{height:100%;background:var(--accent);width:0}.counter{color:var(--muted);white-space:nowrap}.drawer{position:absolute;inset:0 auto 0 0;width:min(320px,82vw);background:#12151afa;transform:translateX(-101%);transition:.2s;z-index:5;display:grid;grid-template-rows:auto 1fr}.drawer.open{transform:none}.drawer-head{display:flex;justify-content:space-between;align-items:center;padding:10px}.thumbs{overflow:auto;padding:10px;display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.thumb{padding:0;overflow:hidden}.thumb img{display:block;width:100%}.thumb.current{outline:3px solid var(--accent)}@media(max-width:700px){button{padding:8px 9px}.slide img{max-height:calc(100vh - 78px)}}
</style></head><body><div class="app"><main class="stage"><aside class="drawer" id="drawer"><div class="drawer-head"><strong>Slides</strong><button id="close">✕</button></div><div class="thumbs">${thumbs}</div></aside>${slides}</main><footer class="controls"><button id="menu">☰</button><button id="prev">← Previous</button><div class="progress"><div class="bar" id="bar"></div></div><span class="counter" id="counter"></span><button id="next">Next →</button><button id="full">⛶</button></footer></div>
<script>(()=>{const slides=[...document.querySelectorAll('.slide')],thumbs=[...document.querySelectorAll('.thumb')],counter=document.getElementById('counter'),bar=document.getElementById('bar'),drawer=document.getElementById('drawer');let i=0;function go(n){i=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,x)=>s.classList.toggle('active',x===i));thumbs.forEach((s,x)=>s.classList.toggle('current',x===i));counter.textContent=(i+1)+' / '+slides.length;bar.style.width=((i+1)/slides.length*100)+'%';}document.getElementById('prev').onclick=()=>go(i-1);document.getElementById('next').onclick=()=>go(i+1);document.getElementById('menu').onclick=()=>drawer.classList.add('open');document.getElementById('close').onclick=()=>drawer.classList.remove('open');document.getElementById('full').onclick=()=>document.documentElement.requestFullscreen?.();thumbs.forEach(t=>t.onclick=()=>{go(Number(t.dataset.go));drawer.classList.remove('open')});addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='PageDown')go(i+1);if(e.key==='ArrowLeft'||e.key==='PageUp')go(i-1)});go(0)})();</script></body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function normalizeStorageEvent(body) {
  const data = body?.data || body;
  const bucket = data?.bucket;
  const name = data?.name;
  if (!bucket || !name) return null;
  return {
    bucket: String(bucket),
    name: decodeURIComponent(String(name)),
    generation: data?.generation ? String(data.generation) : undefined,
  };
}

function createPreviewId(filePath) {
  return Buffer.from(filePath, "utf8").toString("base64url");
}

function isSupportedOfficeFile(name) {
  const lower = name.toLowerCase();
  const supportedFolder = lower.startsWith("powerpoints/")
    || lower.startsWith("documents/")
    || lower.includes("/powerpoints/")
    || lower.includes("/documents/");
  return supportedFolder && [".pptx", ".docx"].some((extension) => lower.endsWith(extension));
}

function isGeneratedPreview(name) {
  return name.toLowerCase().startsWith("office-previews/");
}

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`Office converter listening on ${port}`);
});
