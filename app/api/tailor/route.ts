import { enforceRateLimit } from "@/lib/api-rate-limit";
import { apiError } from "@/lib/api-errors";
import { logApiEvent } from "@/lib/llm/logger";
import { handleRouteError, okJson } from "@/lib/handle-llm-route";
import { isLlmConfigured } from "@/lib/llm/client";
import { applyMockTailor, toTailorResponse } from "@/lib/mock-orchestrator";
import { runTailor } from "@/lib/orchestrator";
import { getRun, saveRun } from "@/lib/run-store";
import {
  TailoringRunPartialSchema,
  type TailoringRunPartial,
} from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "api/tailor");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_JSON", 400);
  }

  const { runId, run: runPayload } = body as {
    runId?: string;
    run?: TailoringRunPartial;
  };

  if (!runId) {
    return apiError("runId is required", "INVALID_INPUT", 400);
  }

  const fromStore = getRun(runId);
  const existing =
    fromStore ?? (runPayload?.id === runId ? runPayload : undefined);

  if (!existing) {
    return apiError(
      "Run not found. Run Analyze again to create a new session.",
      "RUN_NOT_FOUND",
      404
    );
  }

  if (!fromStore) {
    saveRun(existing);
  }

  const parsed = TailoringRunPartialSchema.safeParse(existing);
  if (!parsed.success) {
    return apiError("Invalid run state", "INVALID_RUN", 500);
  }

  if (parsed.data.status === "draft") {
    return apiError(
      "Run must be analyzed before tailoring",
      "INVALID_STATE",
      409
    );
  }

  if (!parsed.data.originalMatch || !parsed.data.gapAnalysis) {
    return apiError(
      "Run is missing analysis results",
      "INVALID_STATE",
      409
    );
  }

  const started = Date.now();

  try {
    if (!isLlmConfigured()) {
      const tailored = applyMockTailor(parsed.data);
      saveRun(tailored);
      logApiEvent("tailor_complete", {
        runId,
        mode: "mock",
        durationMs: Date.now() - started,
      });
      return okJson(toTailorResponse(tailored));
    }

    const { run, response } = await runTailor(parsed.data);
    saveRun(run);
    logApiEvent("tailor_complete", {
      runId,
      mode: "llm",
      durationMs: Date.now() - started,
      warningCount: response.warnings.length,
    });
    return okJson(response);
  } catch (err) {
    logApiEvent("tailor_failed", { runId, durationMs: Date.now() - started });
    return handleRouteError(err);
  }
}
