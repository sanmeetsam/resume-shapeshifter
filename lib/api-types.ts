import type {
  GapAnalysis,
  JobDescriptionProfile,
  MatchScore,
  ResumeProfile,
  TailoredResume,
  TailoringRunPartial,
} from "@/lib/schemas";

export type AnalyzeResponse = {
  runId: string;
  resume: ResumeProfile;
  jobDescription: JobDescriptionProfile;
  originalMatch: MatchScore;
  gapAnalysis: GapAnalysis;
  resumeParseWarnings?: string[];
};

export type TailorResponse = {
  runId: string;
  tailoredResume: TailoredResume;
  tailoredMatch: MatchScore;
  warnings: string[];
  hasCriticalGuardrails?: boolean;
};

export type TailorRequest = {
  runId: string;
  /** Fallback when server in-memory store was cleared (e.g. dev restart or HMR). */
  run?: TailoringRunPartial;
};

export type PdfExportType = "tailored" | "comparison";

export type PdfExportFile = {
  type: PdfExportType;
  filename: string;
  base64: string;
};

export type PdfExportResponse = {
  runId: string;
  files: PdfExportFile[];
};

export type PdfExportRequest = {
  runId: string;
  types?: PdfExportType[];
  /** Fallback when server in-memory store was cleared (e.g. after restart). */
  run?: TailoringRunPartial;
};
