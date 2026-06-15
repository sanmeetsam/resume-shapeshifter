"use client";

import { useMutation } from "@tanstack/react-query";
import { downloadBase64Pdf } from "@/lib/download-pdf";
import type {
  PdfExportRequest,
  PdfExportResponse,
  PdfExportType,
} from "@/lib/api-types";
import type { TailoringRunPartial } from "@/lib/schemas";

async function postExportPdf(
  payload: PdfExportRequest
): Promise<PdfExportResponse> {
  const res = await fetch("/api/export/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as PdfExportResponse & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "PDF export failed");
  return data;
}

export function useExportPdf(
  run: TailoringRunPartial | null,
  onExported?: () => void
) {
  return useMutation({
    mutationFn: async (types: PdfExportType[]) => {
      if (!run?.id) throw new Error("No active run");
      const response = await postExportPdf({
        runId: run.id,
        types,
        run,
      });
      for (const file of response.files) {
        downloadBase64Pdf(file);
      }
      return response;
    },
    onSuccess: () => {
      onExported?.();
    },
  });
}
