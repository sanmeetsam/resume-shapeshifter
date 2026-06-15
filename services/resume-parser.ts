import { heuristicParseResume } from "@/lib/heuristic-resume";
import { parseResumeWithLlm } from "@/prompts/resume-parser";
import { ResumeProfileSchema, type ResumeProfile } from "@/lib/schemas";

export type ParseResumeResult = {
  profile: ResumeProfile;
  parseWarnings: string[];
};

export async function parseResume(
  text: string,
  runId?: string
): Promise<ParseResumeResult> {
  const warnings: string[] = [];
  const heuristic = heuristicParseResume(text);

  if (!heuristic.experience?.length) {
    warnings.push(
      "Could not detect experience sections clearly. Review parsed output."
    );
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const shortLines = lines.filter((l) => l.trim().length > 0 && l.trim().length < 28);
  if (lines.length > 8 && shortLines.length / lines.length > 0.45) {
    warnings.push(
      "Column layout may be wrong — many short lines detected. Paste plain text if sections look scrambled."
    );
  }

  const hint = JSON.stringify(heuristic);
  const profile = await parseResumeWithLlm(text, hint, runId);

  return {
    profile: ResumeProfileSchema.parse(profile),
    parseWarnings: warnings,
  };
}
