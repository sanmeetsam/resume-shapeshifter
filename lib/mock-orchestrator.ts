/** Phase 1 mock — kept for offline demos when GROQ_API_KEY is unset. */
import { checkTailoredResume } from "@/lib/guardrails";
import {
  loadMockGapAnalysis,
  loadMockOriginalMatch,
  loadMockTailoredMatch,
  loadMockTailoredResume,
  loadSampleJd,
  loadSampleResume,
} from "@/lib/fixtures";
import { heuristicParseResume } from "@/lib/heuristic-resume";
import {
  SCHEMA_VERSION,
  type TailoringRun,
  type TailoringRunPartial,
} from "@/lib/schemas";

export type { AnalyzeResponse, TailorResponse } from "@/lib/api-types";
import type { AnalyzeResponse, TailorResponse } from "@/lib/api-types";

function mergeResume(pasted: string) {
  const base = loadSampleResume();
  const heuristic = heuristicParseResume(pasted);
  return {
    ...base,
    contact: { ...base.contact, ...heuristic.contact },
    summary: heuristic.summary || base.summary,
    skills: heuristic.skills?.length ? heuristic.skills : base.skills,
    experience:
      heuristic.experience && heuristic.experience.length > 0
        ? heuristic.experience
        : base.experience,
    education:
      heuristic.education && heuristic.education.length > 0
        ? heuristic.education
        : base.education,
  };
}

export function createMockAnalyzedRun(
  resumeText: string,
  _jdText: string,
  runId: string
): TailoringRunPartial {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: runId,
    createdAt: new Date().toISOString(),
    rawText: resumeText,
    resumeParseWarnings: [],
    resume: mergeResume(resumeText),
    jobDescription: loadSampleJd(),
    originalMatch: loadMockOriginalMatch(),
    gapAnalysis: loadMockGapAnalysis(),
    guardrailWarnings: [],
    status: "analyzed",
  };
}

export function applyMockTailor(run: TailoringRunPartial): TailoringRun {
  const raw = loadMockTailoredResume();
  const jd = run.jobDescription;
  const guardrails = checkTailoredResume(run.resume, raw, [
    ...jd.keywords,
    ...jd.requiredSkills,
    ...jd.tools,
  ]);

  return {
    schemaVersion: SCHEMA_VERSION,
    id: run.id,
    createdAt: run.createdAt,
    rawText: run.rawText,
    resumeParseWarnings: run.resumeParseWarnings ?? [],
    resume: run.resume,
    jobDescription: jd,
    originalMatch: run.originalMatch!,
    gapAnalysis: run.gapAnalysis!,
    tailoredResume: guardrails.tailoredResume,
    tailoredMatch: loadMockTailoredMatch(),
    guardrailWarnings: guardrails.warnings,
    hasCriticalGuardrails: guardrails.hasCritical,
    status: "tailored",
  };
}

export function toAnalyzeResponse(run: TailoringRunPartial): AnalyzeResponse {
  if (!run.originalMatch || !run.gapAnalysis) {
    throw new Error("Run is missing analysis fields");
  }
  return {
    runId: run.id,
    resume: run.resume,
    jobDescription: run.jobDescription,
    originalMatch: run.originalMatch,
    gapAnalysis: run.gapAnalysis,
    resumeParseWarnings: run.resumeParseWarnings,
  };
}

export function toTailorResponse(run: TailoringRun): TailorResponse {
  return {
    runId: run.id,
    tailoredResume: run.tailoredResume,
    tailoredMatch: run.tailoredMatch,
    warnings: run.guardrailWarnings ?? [],
    hasCriticalGuardrails: run.hasCriticalGuardrails,
  };
}
