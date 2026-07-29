import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { storage } from "../config/firebase";

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

function createSafeFileName(fileName: string) {
  const timestamp = Date.now();
  const safeName = fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");

  return `${timestamp}-${safeName}`;
}

export function uploadFileToStorage({
  file,
  folder,
  onProgress,
}: {
  file: File;
  folder: UploadFolder;
  onProgress?: (progress: number) => void;
}): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const safeFileName = createSafeFileName(file.name);
    const filePath = `${folder}/${safeFileName}`;
    const storageRef = ref(storage, filePath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        onProgress?.(Math.round(progress));
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

        resolve({
          fileName: file.name,
          filePath,
          downloadUrl,
          contentType: file.type,
          size: file.size,
        });
      }
    );
  });
}

export async function deleteFileFromStorage(filePath: string) {
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
}