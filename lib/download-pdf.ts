"use client";

import type { PdfExportFile } from "@/lib/api-types";

export function downloadBase64Pdf(file: PdfExportFile): void {
  const bytes = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
