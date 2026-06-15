import { analyzeGapsWithLlm } from "@/prompts/gap-analysis";
import type {
  GapAnalysis,
  JobDescriptionProfile,
  ResumeProfile,
} from "@/lib/schemas";

export async function analyzeGaps(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  runId?: string
): Promise<GapAnalysis> {
  return analyzeGapsWithLlm(resume, jobDescription, runId);
}
