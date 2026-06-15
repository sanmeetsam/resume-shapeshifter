import { okJson } from "@/lib/handle-llm-route";
import { isLlmConfigured } from "@/lib/llm/client";
import { isServerlessHost } from "@/lib/is-serverless";
import { assertPdfRendererSupported } from "@/lib/pdf/renderer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let pdfRenderer: string | null = null;
  let pdfReady = false;

  try {
    pdfRenderer = assertPdfRendererSupported();
    pdfReady = true;
  } catch {
    pdfReady = false;
  }

  const llmConfigured = isLlmConfigured();

  return okJson({
    status: llmConfigured ? "ok" : "degraded",
    llmConfigured,
    pdfRenderer,
    pdfReady,
    serverless: isServerlessHost(),
    nodeVersion: process.version,
  });
}
