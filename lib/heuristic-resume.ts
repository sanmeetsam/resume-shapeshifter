import type { ResumeProfile } from "@/lib/schemas";

const SECTION_PATTERNS: { key: keyof Pick<ResumeProfile, "summary" | "skills" | "experience" | "education">; patterns: RegExp[] }[] = [
  { key: "summary", patterns: [/^(professional\s+)?summary$/i, /^profile$/i, /^about$/i] },
  { key: "skills", patterns: [/^(technical\s+)?skills$/i, /^core\s+competencies$/i] },
  { key: "experience", patterns: [/^(work\s+)?experience$/i, /^employment$/i, /^professional\s+experience$/i] },
  { key: "education", patterns: [/^education$/i, /^academic$/i] },
];

/**
 * Best-effort plain-text resume sectioning for display in Phase 1.
 * Not used for scoring — LLM parsing replaces this in Phase 2.
 */
export function heuristicParseResume(text: string): Partial<ResumeProfile> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections: Record<string, string[]> = { header: [] };
  let current = "header";

  for (const line of lines) {
    const isHeader = SECTION_PATTERNS.some(({ patterns }) =>
      patterns.some((p) => p.test(line))
    );
    if (isHeader) {
      const match = SECTION_PATTERNS.find(({ patterns }) =>
        patterns.some((p) => p.test(line))
      );
      current = match?.key ?? "header";
      sections[current] = sections[current] ?? [];
      continue;
    }
    sections[current] = sections[current] ?? [];
    sections[current].push(line);
  }

  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/\+?[\d\s().-]{10,}/);

  const experience: ResumeProfile["experience"] = [];
  const expLines = sections.experience ?? [];
  let currentJob: (typeof experience)[number] | null = null;

  for (const line of expLines) {
    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      const bullet = line.replace(/^[-•*]\s*/, "");
      if (currentJob) currentJob.bullets.push(bullet);
      continue;
    }
    if (currentJob) experience.push(currentJob);
    const parts = line.split("|").map((p) => p.trim());
    currentJob = {
      company: parts[0] ?? line,
      title: parts[1] ?? "Role",
      bullets: [],
    };
  }
  if (currentJob) experience.push(currentJob);

  return {
    contact: {
      email: emailMatch?.[0],
      phone: phoneMatch?.[0],
    },
    summary: (sections.summary ?? []).join(" "),
    skills: (sections.skills ?? []).join(" ").split(/[,;|]/).map((s) => s.trim()).filter(Boolean),
    experience: experience.length > 0 ? experience : undefined,
    education: (sections.education ?? []).map((line) => ({ institution: line })),
  };
}
