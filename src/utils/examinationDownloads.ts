function safeFileName(value: string, fallback: string): string {
  const cleaned = value.trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

function triggerDownload(url: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function downloadRemoteFile(url: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed (${response.status}).`);
    const objectUrl = URL.createObjectURL(await response.blob());
    triggerDownload(objectUrl, fileName);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    console.warn("Direct file download failed; opening the stored file instead.", error);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function downloadTextFile(text: string, title: string, suffix = "marking-guide"): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  triggerDownload(objectUrl, `${safeFileName(title, "examination")}-${suffix}.txt`);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function downloadElementAsPdf(elementId: string, title: string, suffix: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("The examination preview is not ready for download.");
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const canvas = await html2canvas(element, { scale: 1.7, backgroundColor: "#ffffff", useCORS: true });
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;
  const image = canvas.toDataURL("image/jpeg", 0.94);
  let remaining = imageHeight;
  let y = 0;
  pdf.addImage(image, "JPEG", 0, y, pageWidth, imageHeight);
  remaining -= pageHeight;
  while (remaining > 0) {
    y = remaining - imageHeight;
    pdf.addPage();
    pdf.addImage(image, "JPEG", 0, y, pageWidth, imageHeight);
    remaining -= pageHeight;
  }
  pdf.save(`${safeFileName(title, "examination")}-${suffix}.pdf`);
}

