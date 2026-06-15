import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GapAnalysisSchema,
  JobDescriptionProfileSchema,
  MatchScoreSchema,
  ResumeProfileSchema,
  TailoredResumeSchema,
  type GapAnalysis,
  type JobDescriptionProfile,
  type MatchScore,
  type ResumeProfile,
  type TailoredResume,
} from "@/lib/schemas";

const fixturesDir = join(process.cwd(), "tests", "fixtures");

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(fixturesDir, filename), "utf-8")) as T;
}

export function loadSampleResume(): ResumeProfile {
  return ResumeProfileSchema.parse(loadJson("sample-resume.json"));
}

export function loadSampleJd(): JobDescriptionProfile {
  return JobDescriptionProfileSchema.parse(loadJson("sample-jd.json"));
}

export function loadMockOriginalMatch(): MatchScore {
  const run = loadJson<{ originalMatch: MatchScore }>("mock-tailoring-run.json");
  return MatchScoreSchema.parse(run.originalMatch);
}

export function loadMockTailoredMatch(): MatchScore {
  const run = loadJson<{ tailoredMatch: MatchScore }>("mock-tailoring-run.json");
  return MatchScoreSchema.parse(run.tailoredMatch);
}

export function loadMockGapAnalysis(): GapAnalysis {
  const run = loadJson<{ gapAnalysis: GapAnalysis }>("mock-tailoring-run.json");
  return GapAnalysisSchema.parse(run.gapAnalysis);
}

export function loadMockTailoredResume(): TailoredResume {
  const run = loadJson<{ tailoredResume: TailoredResume }>("mock-tailoring-run.json");
  return TailoredResumeSchema.parse(run.tailoredResume);
}
