import { computeSkillOverlapHints } from "@/lib/scoring";
import { scoreMatchWithLlm } from "@/prompts/match-scoring";
import type {
  JobDescriptionProfile,
  MatchScore,
  ResumeProfile,
} from "@/lib/schemas";

export async function scoreResumeAgainstJd(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  runId?: string
): Promise<MatchScore> {
  const hints = computeSkillOverlapHints(resume, jobDescription);
  return scoreMatchWithLlm(resume, jobDescription, hints, runId);
}
