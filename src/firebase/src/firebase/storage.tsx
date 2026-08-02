import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";

import { auth, db, storage } from "../config/firebase";

export type UploadFolder =
  | "images"
  | "pdfs"
  | "powerpoints"
  | "videos"
  | "audio"
  | "documents"
  | "lesson-resources";

export type UploadResult = {
  fileName: string;
  filePath: string;
  downloadUrl: string;
  contentType: string;
  size: number;
};

const MAX_UPLOAD_BYTES: Record<UploadFolder, number> = {
  images: 10 * 1024 * 1024,
  pdfs: 50 * 1024 * 1024,
  powerpoints: 50 * 1024 * 1024,
  documents: 50 * 1024 * 1024,
  "lesson-resources": 250 * 1024 * 1024,
  videos: 250 * 1024 * 1024,
  audio: 250 * 1024 * 1024,
};

function createSafeFileName(fileName: string) {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomUUID().slice(0, 8);
  const safeName = fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "")
    .replace(/^-+|-+$/g, "");

  return `${timestamp}-${randomSuffix}-${safeName || "upload"}`;
}

function normalizePathPart(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/[^a-zA-Z0-9_-]/g, "-");
  return normalized.length > 0 ? normalized : null;
}

function inferContentType(file: File): string {
  if (file.type) return file.type;

  const extension = file.name.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    pdf: "application/pdf",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
    mp4: "video/mp4",
    webm: "video/webm",
  };

  return extension ? types[extension] ?? "application/octet-stream" : "application/octet-stream";
}

function validateUpload(file: File, folder: UploadFolder, contentType: string) {
  if (file.size <= 0) throw new Error("The selected file is empty.");
  if (file.size > MAX_UPLOAD_BYTES[folder]) {
    const maximumMb = Math.round(MAX_UPLOAD_BYTES[folder] / (1024 * 1024));
    throw new Error(`This file exceeds the ${maximumMb} MB upload limit.`);
  }

  const isImage = contentType.startsWith("image/");
  const isAudio = contentType.startsWith("audio/");
  const isVideo = contentType.startsWith("video/");

  if (folder === "images" && !isImage) throw new Error("Only image files are allowed here.");
  if (folder === "audio" && !isAudio) throw new Error("Only audio files are allowed here.");
  if (folder === "videos" && !isVideo) throw new Error("Only video files are allowed here.");
  if (folder === "pdfs" && contentType !== "application/pdf") throw new Error("Only PDF files are allowed here.");
  if (
    folder === "powerpoints" &&
    ![
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ].includes(contentType)
  ) {
    throw new Error("Only PowerPoint files are allowed here.");
  }
}

async function resolveUploadPath(folder: UploadFolder, safeFileName: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in before uploading a file.");

  let tenantId: string | null = null;
  try {
    const profile = await getDoc(doc(db, "users", user.uid));
    if (profile.exists()) {
      const data = profile.data() as Record<string, unknown>;
      tenantId = normalizePathPart(data.tenantId ?? data.institutionId);
    }
  } catch (error) {
    console.warn("Unable to resolve tenant storage namespace; using the user namespace.", error);
  }

  const basePath = tenantId
    ? `tenants/${tenantId}/uploads/${user.uid}/${folder}`
    : `users/${user.uid}/uploads/${folder}`;

  return {
    filePath: `${basePath}/${safeFileName}`,
    uploaderUid: user.uid,
    tenantId,
  };
}

export async function uploadFileToStorage({
  file,
  folder,
  onProgress,
}: {
  file: File;
  folder: UploadFolder;
  onProgress?: (progress: number) => void;
}): Promise<UploadResult> {
  const safeFileName = createSafeFileName(file.name);
  const contentType = inferContentType(file);
  validateUpload(file, folder, contentType);

  const { filePath, uploaderUid, tenantId } = await resolveUploadPath(folder, safeFileName);
  const storageRef = ref(storage, filePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType,
      customMetadata: {
        uploaderUid,
        uploadFolder: folder,
        originalFileName: file.name,
        ...(tenantId ? { tenantId } : {}),
      },
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          snapshot.totalBytes > 0
            ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            : 0;
        onProgress?.(Math.round(progress));
      },
      reject,
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            fileName: file.name,
            filePath,
            downloadUrl,
            contentType,
            size: file.size,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

export async function deleteFileFromStorage(filePath: string) {
  if (!filePath.trim()) throw new Error("A storage file path is required.");
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
}
