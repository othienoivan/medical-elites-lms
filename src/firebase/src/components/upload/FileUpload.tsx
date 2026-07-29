import { useRef, useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";

import {
  uploadFileToStorage,
  type UploadFolder,
} from "../../firebase/storage";

type Props = {
  folder: UploadFolder;
  accept?: string;
  label?: string;
  onUploaded: (result: {
    fileName: string;
    filePath: string;
    downloadUrl: string;
    contentType: string;
    size: number;
  }) => void;
};

export default function FileUpload({
  folder,
  accept,
  label = "Upload File",
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState("");

  async function handleFile(file: File) {
    try {
      setUploading(true);

      const result = await uploadFileToStorage({
        file,
        folder,
        onProgress: setProgress,
      });

      setUploadedFile(result.fileName);

      onUploaded(result);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            handleFile(file);
          }
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-700 px-5 py-4 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
      >
        <Upload size={20} />

        {uploading ? `Uploading ${progress}%` : label}
      </button>

      {uploadedFile && (
        <div className="mt-4 flex items-center gap-2 text-green-700">
          <CheckCircle2 size={18} />
          <span className="text-sm">{uploadedFile}</span>
        </div>
      )}
    </div>
  );
}