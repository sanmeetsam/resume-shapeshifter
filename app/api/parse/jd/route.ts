import { apiError } from "@/lib/api-errors";
import { handleRouteError, okJson } from "@/lib/handle-llm-route";
import { isLlmConfigured } from "@/lib/llm/client";
import { loadSampleJd } from "@/lib/fixtures";
import { parseJobDescription } from "@/services/jd-parser";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_JSON", 400);
  }

  const { text } = body as { text?: string };
  if (!text?.trim()) {
    return apiError("text is required", "INVALID_INPUT", 400);
  }

  try {
    if (!isLlmConfigured()) {
      return okJson({ profile: loadSampleJd() });
    }

    const profile = await parseJobDescription(text.trim());
    return okJson({ profile });
  } catch (err) {
    return handleRouteError(err);
  }
}
