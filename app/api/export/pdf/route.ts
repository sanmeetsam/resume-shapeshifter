import { enforceRateLimit } from "@/lib/api-rate-limit";
import { apiError } from "@/lib/api-errors";
import type { PdfExportRequest, PdfExportType } from "@/lib/api-types";
import { shouldBlockExport } from "@/lib/guardrails";
import { handleRouteError, okJson } from "@/lib/handle-llm-route";
import { assertPdfRendererSupported, PdfRendererError } from "@/lib/pdf/renderer";
import { toExportableRun } from "@/lib/pdf/resolve-run";
import { getRun, saveRun } from "@/lib/run-store";
import { SCHEMA_VERSION } from "@/lib/schemas";
import { generatePdfs } from "@/services/pdf-generator";

export const runtime = "nodejs";
export const maxDuration = 120;

const VALID_TYPES: PdfExportType[] = ["tailored", "comparison"];

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "api/export/pdf");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_JSON", 400);
  }

  const { runId, types, run: runPayload } = body as PdfExportRequest;

  if (!runId) {
    return apiError("runId is required", "INVALID_INPUT", 400);
  }

  const exportTypes =
    types && types.length > 0
      ? types.filter((t): t is PdfExportType => VALID_TYPES.includes(t))
      : VALID_TYPES;

  if (exportTypes.length === 0) {
    return apiError(
      "types must include 'tailored' and/or 'comparison'",
      "INVALID_INPUT",
      400
    );
  }

  try {
    assertPdfRendererSupported();

    const fromStore = getRun(runId);
    const source = runPayload ?? fromStore;

    let run;
    try {
      run = toExportableRun(runId, source ?? null);
    } catch (err) {
      const code = (err as Error).message;
      if (code === "RUN_NOT_FOUND") {
        return apiError("Run not found", "RUN_NOT_FOUND", 404);
      }
      if (code === "INVALID_STATE") {
        return apiError(
          "Complete tailoring before exporting PDFs",
          "INVALID_STATE",
          409
        );
      }
      return apiError(
        "Run is missing required export fields",
        "INCOMPLETE_RUN",
        409
      );
    }

    if (shouldBlockExport(run.hasCriticalGuardrails ?? false)) {
      return apiError(
        "Export blocked due to critical guardrail violations. Review warnings and re-tailor.",
        "GUARDRAIL_BLOCKED",
        403
      );
    }

    const pdfs = await generatePdfs(run, exportTypes);

    const exported = {
      ...run,
      schemaVersion: SCHEMA_VERSION,
      status: "exported" as const,
    };
    saveRun(exported);

    return okJson({
      runId,
      files: pdfs.map((f) => ({
        type: f.type,
        filename: f.filename,
        base64: f.buffer.toString("base64"),
      })),
    });
  } catch (err) {
    if (err instanceof PdfRendererError) {
      return apiError(err.message, "PDF_RENDERER_UNSUPPORTED", 503);
    }
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("Executable doesn't exist") ||
      message.includes("chromium") ||
      message.includes("PDF engine not installed")
    ) {
      return apiError(
        "PDF engine not available. Locally run: npm run pdf:install. On Vercel, ensure @sparticuz/chromium is bundled.",
        "PDF_ENGINE_MISSING",
        503
      );
    }
    return handleRouteError(err);
  }
}
