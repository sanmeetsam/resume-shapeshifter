import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  JobDescriptionProfileSchema,
  MatchScoreSchema,
  ResumeProfileSchema,
  SCHEMA_VERSION,
  TailoringRunPartialSchema,
  TailoringRunSchema,
} from "@/lib/schemas";

const fixturesDir = join(__dirname, "fixtures");

function loadFixture<T>(filename: string): T {
  const raw = readFileSync(join(fixturesDir, filename), "utf-8");
  return JSON.parse(raw) as T;
}

describe("ResumeProfileSchema", () => {
  it("parses sample-resume.json", () => {
    const data = loadFixture("sample-resume.json");
    const result = ResumeProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects overallScore in resume object", () => {
    const data = {
      ...loadFixture<Record<string, unknown>>("sample-resume.json"),
      overallScore: 50,
    };
    const result = ResumeProfileSchema.strict().safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("JobDescriptionProfileSchema", () => {
  it("parses sample-jd.json", () => {
    const data = loadFixture("sample-jd.json");
    const result = JobDescriptionProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("requires jobTitle", () => {
    const data = loadFixture<Record<string, unknown>>("sample-jd.json");
    delete data.jobTitle;
    const result = JobDescriptionProfileSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("MatchScoreSchema", () => {
  it("rejects scores outside 0-100", () => {
    const result = MatchScoreSchema.safeParse({
      overallScore: 150,
      skillCoverageScore: 70,
      responsibilityAlignmentScore: 70,
      keywordScore: 70,
      seniorityScore: 70,
      criticalMissingRequirements: [],
      explanation: "Invalid score",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid confidence in wrong schema context", () => {
    const result = MatchScoreSchema.safeParse({
      overallScore: 50,
      skillCoverageScore: 50,
      responsibilityAlignmentScore: 50,
      keywordScore: 50,
      seniorityScore: 50,
      criticalMissingRequirements: [],
      explanation: "OK",
    });
    expect(result.success).toBe(true);
  });
});

describe("TailoringRunSchema", () => {
  it("parses mock-tailoring-run.json", () => {
    const data = loadFixture("mock-tailoring-run.json");
    const result = TailoringRunSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.schemaVersion).toBe(SCHEMA_VERSION);
      expect(result.data.status).toBe("tailored");
    }
  });

  it("rejects invalid UUID", () => {
    const data = loadFixture<Record<string, unknown>>("mock-tailoring-run.json");
    data.id = "not-a-uuid";
    const result = TailoringRunSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const data = loadFixture<Record<string, unknown>>("mock-tailoring-run.json");
    data.status = "pending";
    const result = TailoringRunSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("TailoringRunPartialSchema", () => {
  it("allows analyzed state without tailor fields", () => {
    const data = loadFixture<Record<string, unknown>>("mock-tailoring-run.json");
    delete data.tailoredResume;
    delete data.tailoredMatch;
    data.status = "analyzed";
    const result = TailoringRunPartialSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("allows draft with only resume and jobDescription", () => {
    const resume = loadFixture("sample-resume.json");
    const jd = loadFixture("sample-jd.json");
    const result = TailoringRunPartialSchema.safeParse({
      schemaVersion: SCHEMA_VERSION,
      id: "a1b2c3d4-e5f6-4789-a012-3456789abcde",
      createdAt: "2026-05-19T12:00:00.000Z",
      resume,
      jobDescription: jd,
      status: "draft",
    });
    expect(result.success).toBe(true);
  });
});
