import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildComparisonPdfHtml,
  buildTailoredResumeHtml,
} from "@/lib/pdf/build-context";
import { escapeHtml } from "@/lib/pdf/escape";
import { TailoringRunSchema } from "@/lib/schemas";

const fixture = TailoringRunSchema.parse(
  JSON.parse(
    readFileSync(
      join(__dirname, "fixtures", "mock-tailoring-run.json"),
      "utf-8"
    )
  )
);

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<script>"AT&T"</script>`)).toBe(
      "&lt;script&gt;&quot;AT&amp;T&quot;&lt;/script&gt;"
    );
  });
});

describe("buildTailoredResumeHtml", () => {
  it("includes job title and tailored summary", () => {
    const html = buildTailoredResumeHtml(fixture);
    expect(html).toContain("Full Stack Engineer");
    expect(html).toContain(fixture.tailoredResume.tailoredSummary);
    expect(html).not.toContain("<script>");
  });
});

describe("buildComparisonPdfHtml", () => {
  it("includes scores, disclaimer, tools, and mark highlights", () => {
    const html = buildComparisonPdfHtml(fixture);
    expect(html).toContain("Original match");
    expect(html).toContain(String(fixture.originalMatch.overallScore));
    expect(html).toContain(String(fixture.tailoredMatch.overallScore));
    expect(html).toContain("<mark>");
    expect(html).toContain("Disclaimer");
    expect(html).toContain("does not guarantee ATS");
    for (const tool of fixture.jobDescription.tools) {
      expect(html).toContain(tool);
    }
  });

  it("loads comparison template shell", () => {
    const html = buildComparisonPdfHtml(fixture);
    expect(html).toContain("Resume Shapeshifter — Comparison Report");
    expect(html).toContain("Job requirements summary");
  });
});

describe("buildTailoredResumeHtml template", () => {
  it("loads tailored resume template shell", () => {
    const html = buildTailoredResumeHtml(fixture);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain(fixture.tailoredResume.tailoredSummary);
  });
});
