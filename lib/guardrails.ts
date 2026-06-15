import type {
  Confidence,
  ResumeProfile,
  TailoredBullet,
  TailoredResume,
} from "@/lib/schemas";

/** MVP default: warn-only; set true to block PDF export API on critical issues. */
export const BLOCK_EXPORT_ON_CRITICAL = false;

export type GuardrailSeverity = "critical" | "high" | "medium" | "low";

export type GuardrailIssue = {
  code: string;
  severity: GuardrailSeverity;
  message: string;
  scope: "run" | "summary" | "skills" | "bullet";
  company?: string;
  bulletIndex?: number;
};

export type GuardrailResult = {
  tailoredResume: TailoredResume;
  issues: GuardrailIssue[];
  warnings: string[];
  hasCritical: boolean;
};

const DEGREE_PATTERNS =
  /\b(?:mba|ph\.?d\.?|m\.?s\.?|b\.?s\.?|b\.?a\.?|bachelor(?:'s)?|master(?:'s)?|doctorate|associate(?:'s)?)\b/gi;

const CERT_PATTERNS =
  /\b(?:aws\s+certified|pmp|cpa|cissp|cka|ckad|solutions?\s+architect|professional\s+certification)\b/gi;

const TECH_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  k8s: "kubernetes",
  kube: "kubernetes",
  postgres: "postgresql",
  pg: "postgresql",
  node: "nodejs",
  "c#": "csharp",
  golang: "go",
};

const COMMON_TECH =
  /\b(?:typescript|javascript|python|java|go|golang|rust|c\+\+|c#|ruby|php|swift|kotlin|react|vue|angular|next\.?js|node\.?js|express|django|flask|spring|graphql|rest|grpc|postgresql|postgres|mysql|mongodb|redis|kafka|rabbitmq|docker|kubernetes|k8s|aws|azure|gcp|terraform|ansible|jenkins|github\s+actions|ci\/cd|playwright|cypress|jest|vitest|tailwind|graphql|elasticsearch|snowflake|databricks|spark|hadoop|airflow|figma|jira)\b/gi;

const METRIC_PATTERN =
  /\b(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(%|percent|million|billion|k\b|m\b)?|\b(\d+(?:\.\d+)?)\s*(?:%|percent)\b/gi;

const WORD_NUMBERS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  twelve: "12",
  twenty: "20",
  thirty: "30",
  fifty: "50",
  hundred: "100",
};

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenizeCorpus(text: string): Set<string> {
  return new Set(
    normalizeText(text)
      .split(/[^a-z0-9+#.]+/)
      .filter((t) => t.length > 1)
  );
}

function buildResumeCorpus(resume: ResumeProfile): {
  text: string;
  tokens: Set<string>;
  companies: Set<string>;
  titles: Set<string>;
  degrees: Set<string>;
  certifications: Set<string>;
  numbers: Set<string>;
  technologies: Set<string>;
} {
  const parts: string[] = [
    resume.summary,
    ...resume.skills,
    ...resume.experience.flatMap((e) => [
      e.company,
      e.title,
      ...e.bullets,
    ]),
    ...resume.projects.flatMap((p) => [
      p.name,
      p.description ?? "",
      ...(p.bullets ?? []),
      ...(p.technologies ?? []),
    ]),
    ...resume.education.flatMap((e) => [
      e.institution,
      e.degree ?? "",
      e.field ?? "",
      ...(e.details ?? []),
    ]),
    ...resume.certifications.flatMap((c) => [c.name, c.issuer ?? ""]),
  ];

  const text = parts.filter(Boolean).join("\n");
  const tokens = tokenizeCorpus(text);
  const companies = new Set(
    resume.experience.map((e) => normalizeText(e.company))
  );
  const titles = new Set(resume.experience.map((e) => normalizeText(e.title)));
  const degrees = new Set<string>();
  const certifications = new Set<string>();

  for (const ed of resume.education) {
    if (ed.degree) degrees.add(normalizeText(ed.degree));
    if (ed.field) degrees.add(normalizeText(ed.field));
    if (ed.institution) degrees.add(normalizeText(ed.institution));
  }
  for (const cert of resume.certifications) {
    certifications.add(normalizeText(cert.name));
  }

  const numbers = extractNumbers(text);
  const technologies = extractTechnologies(text);

  return {
    text,
    tokens,
    companies,
    titles,
    degrees,
    certifications,
    numbers,
    technologies,
  };
}

function normalizeTechToken(raw: string): string {
  const key = raw.toLowerCase().replace(/\./g, "");
  return TECH_ALIASES[key] ?? key;
}

function extractTechnologies(text: string): Set<string> {
  const found = new Set<string>();
  for (const match of text.matchAll(COMMON_TECH)) {
    found.add(normalizeTechToken(match[0]));
  }
  for (const skill of text.split(/[,·|/\n]+/)) {
    const t = skill.trim();
    if (t.length >= 2 && t.length <= 40) {
      found.add(normalizeTechToken(t));
    }
  }
  return found;
}

function extractNumbers(text: string): Set<string> {
  const nums = new Set<string>();
  for (const match of text.matchAll(METRIC_PATTERN)) {
    const raw = (match[1] ?? match[2] ?? "").replace(/,/g, "");
    if (raw) nums.add(raw);
  }
  for (const [word, digit] of Object.entries(WORD_NUMBERS)) {
    if (new RegExp(`\\b${word}\\b`, "i").test(text)) nums.add(digit);
  }
  return nums;
}

function extractJdKeywords(jdKeywords: string[]): Set<string> {
  const set = new Set<string>();
  for (const kw of jdKeywords) {
    const n = normalizeText(kw);
    if (n.length > 2) set.add(n);
  }
  return set;
}

function dedupeWarnings(messages: string[]): string[] {
  return [...new Set(messages)];
}

function mergeRiskFlag(existing: string | undefined, addition: string): string {
  if (!existing?.trim()) return addition;
  if (existing.toLowerCase().includes(addition.toLowerCase())) return existing;
  return `${existing}; ${addition}`;
}

function downgradeConfidence(confidence: Confidence): Confidence {
  if (confidence === "high") return "medium";
  if (confidence === "medium") return "low";
  return "low";
}

function applyBulletIssue(
  bullet: TailoredBullet,
  flag: string
): TailoredBullet {
  return {
    ...bullet,
    confidence: "low",
    riskFlag: mergeRiskFlag(bullet.riskFlag, flag),
  };
}

function detectNewEmployersAndTitles(
  resume: ResumeProfile,
  tailored: TailoredResume,
  corpus: ReturnType<typeof buildResumeCorpus>
): GuardrailIssue[] {
  const issues: GuardrailIssue[] = [];

  for (const role of tailored.tailoredExperience) {
    const companyKey = normalizeText(role.company);
    if (companyKey && !corpus.companies.has(companyKey)) {
      issues.push({
        code: "NEW_EMPLOYER",
        severity: "critical",
        message: `Tailored experience lists employer not in original resume: "${role.company}".`,
        scope: "run",
        company: role.company,
      });
    }

    const titleKey = normalizeText(role.title);
    if (
      titleKey &&
      corpus.companies.has(companyKey) &&
      !corpus.titles.has(titleKey)
    ) {
      issues.push({
        code: "NEW_TITLE",
        severity: "high",
        message: `Job title "${role.title}" at ${role.company} was not in the original resume.`,
        scope: "run",
        company: role.company,
      });
    }
  }

  return issues;
}

function detectNewDegreesAndCerts(
  tailored: TailoredResume,
  corpus: ReturnType<typeof buildResumeCorpus>
): GuardrailIssue[] {
  const issues: GuardrailIssue[] = [];
  const surfaces = [
    tailored.tailoredSummary,
    ...tailored.tailoredSkills,
    ...tailored.tailoredExperience.flatMap((r) =>
      r.bullets.map((b) => b.tailored)
    ),
  ].join("\n");

  for (const match of surfaces.matchAll(DEGREE_PATTERNS)) {
    const token = normalizeText(match[0]);
    const known = [...corpus.degrees].some(
      (d) => d.includes(token) || token.includes(d)
    );
    if (!known && token.length > 1) {
      issues.push({
        code: "NEW_DEGREE",
        severity: "critical",
        message: `Possible new degree credential mentioned: "${match[0]}".`,
        scope: "summary",
      });
      break;
    }
  }

  for (const match of surfaces.matchAll(CERT_PATTERNS)) {
    const token = normalizeText(match[0]);
    const known = [...corpus.certifications].some(
      (c) => c.includes(token) || token.includes(c)
    );
    if (!known) {
      issues.push({
        code: "NEW_CERTIFICATION",
        severity: "critical",
        message: `Possible new certification mentioned: "${match[0]}".`,
        scope: "summary",
      });
      break;
    }
  }

  return issues;
}

function detectNewMetricsInBullet(
  bullet: TailoredBullet,
  corpus: ReturnType<typeof buildResumeCorpus>,
  company: string,
  bulletIndex: number
): GuardrailIssue[] {
  const originalNums = extractNumbers(bullet.original);
  const tailoredNums = extractNumbers(bullet.tailored);
  const issues: GuardrailIssue[] = [];

  for (const num of tailoredNums) {
    const inOriginalBullet = originalNums.has(num);
    const inResumeCorpus = corpus.numbers.has(num);
    if (!inOriginalBullet && !inResumeCorpus) {
      issues.push({
        code: "NEW_METRIC",
        severity: "critical",
        message: `New numeric claim "${num}" in tailored bullet not supported by the original resume.`,
        scope: "bullet",
        company,
        bulletIndex,
      });
    }
  }

  return issues;
}

function detectUnverifiedTechnologies(
  text: string,
  corpus: ReturnType<typeof buildResumeCorpus>,
  company: string,
  bulletIndex: number
): GuardrailIssue[] {
  const issues: GuardrailIssue[] = [];
  const tailoredTech = extractTechnologies(text);

  for (const tech of tailoredTech) {
    if (!corpus.technologies.has(tech)) {
      issues.push({
        code: "UNVERIFIED_TECH",
        severity: "high",
        message: `Technology "${tech}" appears in tailored text but not in the original resume.`,
        scope: "bullet",
        company,
        bulletIndex,
      });
    }
  }

  return issues;
}

function detectKeywordDensitySpike(
  bullet: TailoredBullet,
  jdKeywords: Set<string>,
  company: string,
  bulletIndex: number
): GuardrailIssue[] {
  const orig = normalizeText(bullet.original);
  const tailored = normalizeText(bullet.tailored);
  if (tailored.length < orig.length * 1.8) return [];

  let origHits = 0;
  let tailoredHits = 0;
  for (const kw of jdKeywords) {
    if (orig.includes(kw)) origHits += 1;
    if (tailored.includes(kw)) tailoredHits += 1;
  }

  if (tailoredHits >= Math.max(3, origHits * 3) && tailored.length > orig.length * 2) {
    return [
      {
        code: "KEYWORD_STUFFING",
        severity: "high",
        message:
          "Tailored bullet may be keyword-stuffed relative to the original (length and JD keyword density spike).",
        scope: "bullet",
        company,
        bulletIndex,
      },
    ];
  }

  return [];
}

function detectSummaryAndSkillsRisks(
  tailored: TailoredResume,
  corpus: ReturnType<typeof buildResumeCorpus>
): GuardrailIssue[] {
  const issues: GuardrailIssue[] = [];

  if (tailored.tailoredSummary) {
    issues.push(
      ...detectUnverifiedTechnologies(
        tailored.tailoredSummary,
        corpus,
        "_summary",
        -1
      )
    );
  }

  for (const skill of tailored.tailoredSkills) {
    const norm = normalizeTechToken(normalizeText(skill));
    if (
      norm.length > 2 &&
      !corpus.technologies.has(norm) &&
      !corpus.tokens.has(norm)
    ) {
      issues.push({
        code: "UNVERIFIED_SKILL",
        severity: "medium",
        message: `Skill "${skill}" in tailored skills was not found in the original resume.`,
        scope: "skills",
      });
    }
  }

  return issues;
}

function applyIssuesToTailored(
  tailored: TailoredResume,
  bulletIssues: Map<string, GuardrailIssue[]>
): TailoredResume {
  return {
    ...tailored,
    tailoredExperience: tailored.tailoredExperience.map((role) => ({
      ...role,
      bullets: role.bullets.map((bullet, i) => {
        const key = `${normalizeText(role.company)}::${i}`;
        const issues = bulletIssues.get(key) ?? [];
        if (issues.length === 0) return bullet;

        const flags = issues.map((issue) => {
          if (issue.code === "NEW_METRIC") return "New metric";
          if (issue.code === "UNVERIFIED_TECH") return "Unverified technology";
          if (issue.code === "KEYWORD_STUFFING") return "Keyword stuffing";
          return issue.message;
        });

        let updated = bullet;
        for (const flag of flags) {
          updated = applyBulletIssue(updated, flag);
        }
        if (issues.some((x) => x.severity === "critical" || x.severity === "high")) {
          updated = { ...updated, confidence: "low" };
        } else if (updated.confidence === "high") {
          updated = { ...updated, confidence: downgradeConfidence(updated.confidence) };
        }
        return updated;
      }),
    })),
  };
}

function issuesToWarnings(issues: GuardrailIssue[]): string[] {
  return dedupeWarnings(issues.map((i) => i.message));
}

/**
 * Deterministic post-LLM guardrails: detect fabrication/overstatement and
 * merge risk flags + confidence downgrades onto tailored bullets.
 */
export function checkTailoredResume(
  original: ResumeProfile,
  tailored: TailoredResume,
  jdKeywords: string[] = []
): GuardrailResult {
  const corpus = buildResumeCorpus(original);
  const jdKeywordSet = extractJdKeywords(jdKeywords);
  const issues: GuardrailIssue[] = [];
  const bulletIssues = new Map<string, GuardrailIssue[]>();

  issues.push(
    ...detectNewEmployersAndTitles(original, tailored, corpus),
    ...detectNewDegreesAndCerts(tailored, corpus),
    ...detectSummaryAndSkillsRisks(tailored, corpus)
  );

  for (const role of tailored.tailoredExperience) {
    role.bullets.forEach((bullet, i) => {
      const key = `${normalizeText(role.company)}::${i}`;
      const perBullet: GuardrailIssue[] = [
        ...detectNewMetricsInBullet(bullet, corpus, role.company, i),
        ...detectUnverifiedTechnologies(bullet.tailored, corpus, role.company, i),
        ...detectKeywordDensitySpike(bullet, jdKeywordSet, role.company, i),
      ];
      if (perBullet.length > 0) {
        bulletIssues.set(key, perBullet);
        issues.push(...perBullet);
      }
    });
  }

  const tailoredResume = applyIssuesToTailored(tailored, bulletIssues);
  const warnings = issuesToWarnings(issues);
  const hasCritical = issues.some((i) => i.severity === "critical");

  return {
    tailoredResume,
    issues,
    warnings,
    hasCritical,
  };
}

export function shouldBlockExport(hasCritical: boolean): boolean {
  return BLOCK_EXPORT_ON_CRITICAL && hasCritical;
}
