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

  await recordRef.set(
    {
      sourcePath: name,
      sourceName: path.basename(name),
      sourceGeneration: generation || metadata.generation || null,
      sourceSize,
      sourceContentType: metadata.contentType || null,
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

    await recordRef.set(
      {
        status: "ready",
        previewPdfPath,
        previewPdfUrl,
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
  const supportedFolder = lower.startsWith("powerpoints/") || lower.startsWith("documents/");
  return supportedFolder && [".pptx", ".docx"].some((extension) => lower.endsWith(extension));
}

function isGeneratedPreview(name) {
  return name.toLowerCase().startsWith("office-previews/");
}

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`Office converter listening on ${port}`);
});
