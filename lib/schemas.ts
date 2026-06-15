import { z } from "zod";

/** Bump when stored JSON shape changes (sessionStorage migration). */
export const SCHEMA_VERSION = 1;

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);

export const ImportanceSchema = z.enum(["high", "medium", "low"]);

export const TailoringRunStatusSchema = z.enum([
  "draft",
  "analyzed",
  "tailored",
  "exported",
]);

const scoreField = z.number().min(0).max(100);

export const ContactInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
});

export const ExperienceEntrySchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()),
});

export const ProjectEntrySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});

export const EducationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  details: z.array(z.string()).optional(),
});

export const CertificationEntrySchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
});

export const ResumeProfileSchema = z.object({
  contact: ContactInfoSchema.default({}),
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceEntrySchema).default([]),
  projects: z.array(ProjectEntrySchema).default([]),
  education: z.array(EducationEntrySchema).default([]),
  certifications: z.array(CertificationEntrySchema).default([]),
});

export const JobDescriptionProfileSchema = z.object({
  jobTitle: z.string(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  seniorityLevel: z.string().default(""),
  domainSignals: z.array(z.string()).default([]),
});

export const MatchScoreSchema = z.object({
  overallScore: scoreField,
  skillCoverageScore: scoreField,
  responsibilityAlignmentScore: scoreField,
  keywordScore: scoreField,
  seniorityScore: scoreField,
  criticalMissingRequirements: z.array(z.string()).default([]),
  explanation: z.string(),
});

export const TailoredBulletSchema = z.object({
  original: z.string().min(1),
  tailored: z.string().min(10),
  changeReason: z.string().min(1),
  keywordsAddressed: z.array(z.string()).default([]),
  confidence: ConfidenceSchema,
  riskFlag: z.string().optional(),
});

export const TailoredExperienceEntrySchema = z.object({
  company: z.string(),
  title: z.string(),
  bullets: z.array(TailoredBulletSchema),
});

export const TailoredResumeSchema = z.object({
  tailoredSummary: z.string(),
  tailoredSkills: z.array(z.string()).default([]),
  tailoredExperience: z.array(TailoredExperienceEntrySchema).default([]),
});

export const ResumeGapSchema = z.object({
  name: z.string(),
  importance: ImportanceSchema,
  jdEvidence: z.string(),
  resumeEvidence: z.string(),
  suggestedAction: z.string(),
  canSafelyAdd: z.boolean(),
});

export const GapAnalysisSchema = z.object({
  gaps: z.array(ResumeGapSchema).default([]),
});

/**
 * Full tailoring run after export. All analysis/tailor fields present.
 */
export const TailoringRunSchema = z.object({
  schemaVersion: z.number().int().default(SCHEMA_VERSION),
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  /** Original resume text for audit and guardrail diffing. */
  rawText: z.string().optional(),
  resumeParseWarnings: z.array(z.string()).default([]),
  resume: ResumeProfileSchema,
  jobDescription: JobDescriptionProfileSchema,
  originalMatch: MatchScoreSchema,
  tailoredResume: TailoredResumeSchema,
  tailoredMatch: MatchScoreSchema,
  gapAnalysis: GapAnalysisSchema,
  guardrailWarnings: z.array(z.string()).default([]),
  hasCriticalGuardrails: z.boolean().optional(),
  status: TailoringRunStatusSchema,
});

/**
 * Partial run states before tailor/export complete.
 */
export const TailoringRunPartialSchema = z.object({
  schemaVersion: z.number().int().default(SCHEMA_VERSION),
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  rawText: z.string().optional(),
  resumeParseWarnings: z.array(z.string()).default([]),
  resume: ResumeProfileSchema,
  jobDescription: JobDescriptionProfileSchema,
  originalMatch: MatchScoreSchema.optional(),
  tailoredResume: TailoredResumeSchema.optional(),
  tailoredMatch: MatchScoreSchema.optional(),
  gapAnalysis: GapAnalysisSchema.optional(),
  guardrailWarnings: z.array(z.string()).default([]),
  hasCriticalGuardrails: z.boolean().optional(),
  status: TailoringRunStatusSchema,
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;
export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;
export type JobDescriptionProfile = z.infer<typeof JobDescriptionProfileSchema>;
export type MatchScore = z.infer<typeof MatchScoreSchema>;
export type TailoredBullet = z.infer<typeof TailoredBulletSchema>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;
export type ResumeGap = z.infer<typeof ResumeGapSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;
export type TailoringRun = z.infer<typeof TailoringRunSchema>;
export type TailoringRunPartial = z.infer<typeof TailoringRunPartialSchema>;
export type TailoringRunStatus = z.infer<typeof TailoringRunStatusSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
export type Importance = z.infer<typeof ImportanceSchema>;

export function parseResumeProfile(data: unknown): ResumeProfile {
  return ResumeProfileSchema.parse(data);
}

export function parseJobDescriptionProfile(data: unknown): JobDescriptionProfile {
  return JobDescriptionProfileSchema.parse(data);
}

export function parseMatchScore(data: unknown): MatchScore {
  return MatchScoreSchema.parse(data);
}

export function parseTailoringRun(data: unknown): TailoringRun {
  return TailoringRunSchema.parse(data);
}

export function parseTailoringRunPartial(data: unknown): TailoringRunPartial {
  return TailoringRunPartialSchema.parse(data);
}
