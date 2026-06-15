import { extractJobDescription } from "@/prompts/jd-extraction";
import type { JobDescriptionProfile } from "@/lib/schemas";

export async function parseJobDescription(
  jdText: string,
  runId?: string
): Promise<JobDescriptionProfile> {
  return extractJobDescription(jdText, runId);
}
