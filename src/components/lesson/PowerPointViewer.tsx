import { AlertCircle, Download, LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getBytes, ref } from "firebase/storage";

import { storage } from "../../config/firebase";

import Button from "../ui/Button";

type Props = {
  url: string;
  title?: string;
};

const DOWNLOAD_TIMEOUT_MS = 30_000;
const RENDER_TIMEOUT_MS = 35_000;

export default function PowerPointViewer({ url, title }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let destroyPreview: (() => void) | undefined;

    async function loadPresentation(container: HTMLDivElement) {
      container.innerHTML = "";
      setLoading(true);
      setError("");

      try {
        const file = await withTimeout(
          downloadPresentation(url),
          DOWNLOAD_TIMEOUT_MS,
          "The PowerPoint file took too long to download."
        );

        if (cancelled) return;

        const { init } = await import("pptx-preview");
        if (cancelled) return;

        const width = Math.max(320, Math.min(960, container.clientWidth || 960));
        const height = Math.round((width * 9) / 16);

        const previewer = init(container, {
          width,
          height,
          mode: "slide",
        });

        destroyPreview = () => previewer.destroy();

        await withTimeout(
          Promise.resolve(previewer.preview(file)),
          RENDER_TIMEOUT_MS,
          "The PowerPoint renderer did not finish. The file may use unsupported PowerPoint features."
        );

        if (cancelled) return;

        if (container.childElementCount === 0) {
          throw new Error("No slides were produced by the PowerPoint renderer.");
        }

        setLoading(false);
      } catch (loadError) {
        console.error("Failed to preview PowerPoint:", loadError);

        if (!cancelled) {
          setLoading(false);
          const message =
            loadError instanceof Error ? loadError.message : "Unknown preview error";

          setError(
            `The presentation could not be rendered inside the browser (${message}). You can still download and open the original PowerPoint file.`
          );
        }
      }
    }

    void loadPresentation(host);

    return () => {
      cancelled = true;
      destroyPreview?.();
      host.innerHTML = "";
    };
  }, [url, reloadKey]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-slate-950">
            {title || "PowerPoint presentation"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Use the Previous and Next controls in the viewer to move between slides.
          </p>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          download
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-blue-800 hover:bg-blue-800 hover:shadow-md"
        >
          <Download size={17} />
          Download PowerPoint
        </a>
      </div>

      <div className="relative min-h-[420px] overflow-auto bg-slate-100 p-3 sm:min-h-[560px] sm:p-5">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90">
            <div className="text-center text-slate-700">
              <LoaderCircle className="mx-auto animate-spin text-blue-700" size={38} />
              <p className="mt-3 font-semibold">Preparing presentation…</p>
              <p className="mt-1 text-sm text-slate-500">
                Large presentations may take several seconds.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900">
            <AlertCircle className="mx-auto" size={36} />
            <p className="mt-3 font-semibold">{error}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
          </div>
        )}

        <div
          ref={hostRef}
          className={error ? "hidden" : "mx-auto flex min-w-fit justify-center"}
        />
      </div>
    </div>
  );
}

async function downloadPresentation(url: string): Promise<ArrayBuffer> {
  try {
    const bytes = await getBytes(ref(storage, url), 50 * 1024 * 1024);

    return bytes;
  } catch (firebaseDownloadError) {
    console.warn(
      "Firebase SDK download failed; trying direct download.",
      firebaseDownloadError
    );

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`PowerPoint download failed (${response.status}).`, {
        cause: firebaseDownloadError,
      });
    }

    return response.arrayBuffer();
  }
}

function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    operation.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (reason) => {
        window.clearTimeout(timeoutId);
        reject(reason);
      }
    );
  });
}
