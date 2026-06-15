import { applyTailoredToResume } from "@/lib/apply-tailored";
import type { AnalyzeResponse, TailorResponse } from "@/lib/api-types";
import { analyzeGaps } from "@/services/gap-engine";
import { scoreResumeAgainstJd } from "@/services/match-engine";
import { parseJobDescription } from "@/services/jd-parser";
import { parseResume } from "@/services/resume-parser";
import { tailorResume } from "@/services/tailoring-engine";
import {
  SCHEMA_VERSION,
  type TailoringRun,
  type TailoringRunPartial,
} from "@/lib/schemas";

export async function runAnalyze(
  resumeText: string,
  jdText: string,
  runId: string
): Promise<{ run: TailoringRunPartial; response: AnalyzeResponse }> {
  const [{ profile: resume, parseWarnings }, jobDescription] = await Promise.all([
    parseResume(resumeText, runId),
    parseJobDescription(jdText, runId),
  ]);

  const [originalMatch, gapAnalysis] = await Promise.all([
    scoreResumeAgainstJd(resume, jobDescription, runId),
    analyzeGaps(resume, jobDescription, runId),
  ]);

  const run: TailoringRunPartial = {
    schemaVersion: SCHEMA_VERSION,
    id: runId,
    createdAt: new Date().toISOString(),
    rawText: resumeText,
    resumeParseWarnings: parseWarnings,
    resume,
    jobDescription,
    originalMatch,
    gapAnalysis,
    guardrailWarnings: [],
    status: "analyzed",
  };

  return {
    run,
    response: {
      runId,
      resume,
      jobDescription,
      originalMatch,
      gapAnalysis,
      resumeParseWarnings: parseWarnings,
    },
  };
}

export async function runTailor(
  partial: TailoringRunPartial
): Promise<{ run: TailoringRun; response: TailorResponse }> {
  if (!partial.originalMatch || !partial.gapAnalysis) {
    throw new Error("Run must be analyzed before tailoring");
  }

  const {
    tailoredResume,
    warnings,
    hasCriticalGuardrails,
  } = await tailorResume(
    partial.resume,
    partial.jobDescription,
    partial.gapAnalysis,
    partial.id
  );

  const resumeForScoring = applyTailoredToResume(
    partial.resume,
    tailoredResume
  );

  const tailoredMatch = await scoreResumeAgainstJd(
    resumeForScoring,
    partial.jobDescription,
    partial.id
  );

  const run: TailoringRun = {
    schemaVersion: SCHEMA_VERSION,
    id: partial.id,
    createdAt: partial.createdAt,
    rawText: partial.rawText,
    resumeParseWarnings: partial.resumeParseWarnings ?? [],
    resume: partial.resume,
    jobDescription: partial.jobDescription,
    originalMatch: partial.originalMatch,
    gapAnalysis: partial.gapAnalysis,
    tailoredResume,
    tailoredMatch,
    guardrailWarnings: warnings,
    hasCriticalGuardrails,
    status: "tailored",
  };

  return {
    run,
    response: {
      runId: partial.id,
      tailoredResume,
      tailoredMatch,
      warnings,
      hasCriticalGuardrails,
    },
  };
}
