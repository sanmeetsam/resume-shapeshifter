import { v4 as uuidv4 } from "uuid";
import { apiError } from "@/lib/api-errors";
import { logApiEvent } from "@/lib/llm/logger";
import { handleRouteError, okJson } from "@/lib/handle-llm-route";
import { isLlmConfigured } from "@/lib/llm/client";
import {
  createMockAnalyzedRun,
  toAnalyzeResponse,
} from "@/lib/mock-orchestrator";
import { runAnalyze } from "@/lib/orchestrator";
import { saveRun } from "@/lib/run-store";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_JSON", 400);
  }

  const { resumeText, jdText } = body as {
    resumeText?: string;
    jdText?: string;
  };

  if (!resumeText?.trim() || !jdText?.trim()) {
    return apiError(
      "resumeText and jdText are required",
      "INVALID_INPUT",
      400
    );
  }

  const runId = uuidv4();
  const started = Date.now();

  try {
    if (!isLlmConfigured()) {
      const run = createMockAnalyzedRun(resumeText, jdText, runId);
      saveRun(run);
      logApiEvent("analyze_complete", {
        runId,
        mode: "mock",
        durationMs: Date.now() - started,
      });
      return okJson(toAnalyzeResponse(run));
    }

    const { run, response } = await runAnalyze(
      resumeText.trim(),
      jdText.trim(),
      runId
    );
    saveRun(run);
    logApiEvent("analyze_complete", {
      runId,
      mode: "llm",
      durationMs: Date.now() - started,
      parseWarningCount: run.resumeParseWarnings?.length ?? 0,
    });
    return okJson(response);
  } catch (err) {
    logApiEvent("analyze_failed", {
      runId,
      durationMs: Date.now() - started,
    });
    return handleRouteError(err);
  }
}
