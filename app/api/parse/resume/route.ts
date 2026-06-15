import { apiError } from "@/lib/api-errors";
import { extractResumeFromBuffer } from "@/lib/document-extract";
import { handleRouteError, okJson } from "@/lib/handle-llm-route";
import { isLlmConfigured } from "@/lib/llm/client";
import { heuristicParseResume } from "@/lib/heuristic-resume";
import { isAllowedResumeMime } from "@/lib/upload-config";
import { parseResume } from "@/services/resume-parser";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");

      if (!file || !(file instanceof File)) {
        return apiError("file is required", "INVALID_INPUT", 400);
      }

      const mime = file.type || "application/octet-stream";
      if (!isAllowedResumeMime(mime)) {
        return apiError(
          "Unsupported file type. Upload PDF or DOCX only.",
          "INVALID_INPUT",
          400
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const extracted = await extractResumeFromBuffer(
        buffer,
        mime,
        file.name
      );

      if (!isLlmConfigured()) {
        const profile = heuristicParseResume(extracted.text);
        return okJson({
          text: extracted.text,
          profile,
          parseWarnings: [
            ...extracted.warnings,
            "LLM not configured — heuristic parse only.",
          ],
        });
      }

      const parsed = await parseResume(extracted.text);
      return okJson({
        text: extracted.text,
        profile: parsed.profile,
        parseWarnings: [...extracted.warnings, ...parsed.parseWarnings],
      });
    }

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

    if (!isLlmConfigured()) {
      const profile = heuristicParseResume(text);
      return okJson({
        text: text.trim(),
        profile,
        parseWarnings: ["LLM not configured — heuristic parse only."],
      });
    }

    const result = await parseResume(text.trim());
    return okJson({
      text: text.trim(),
      ...result,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("exceeds maximum")) {
      return apiError(err.message, "FILE_TOO_LARGE", 413);
    }
    if (err instanceof Error && err.message.includes("Unsupported file")) {
      return apiError(err.message, "INVALID_INPUT", 400);
    }
    return handleRouteError(err);
  }
}
