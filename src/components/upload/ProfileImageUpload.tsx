import { CheckCircle2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import {
  uploadProfileImageToStorage,
  type UploadResult,
} from "../../firebase/storage";

type Props = {
  label?: string;
  onUploaded: (result: UploadResult) => void;
};

export default function ProfileImageUpload({
  label = "Upload Profile Picture",
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState("");

  async function handleFile(file: File) {
    try {
      setUploading(true);
      setProgress(0);

      const result = await uploadProfileImageToStorage({
        file,
        onProgress: setProgress,
      });

      setUploadedFile(result.fileName);
      onUploaded(result);
    } catch (error) {
      console.error("Profile image upload failed:", error);
      alert(
        error instanceof Error && error.message
          ? error.message
          : "Profile image upload failed. Please try again.",
      );
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
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          if (file) void handleFile(file);
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