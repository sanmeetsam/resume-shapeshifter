import { escapeHtml } from "@/lib/pdf/escape";
import { renderTemplate } from "@/lib/pdf/load-template";
import type {
  JobDescriptionProfile,
  ResumeGap,
  TailoredBullet,
  TailoringRun,
} from "@/lib/schemas";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function contactLine(run: TailoringRun): string {
  const c = run.resume.contact;
  const parts = [c.name, c.email, c.phone, c.location, c.linkedin, c.website].filter(
    (p): p is string => Boolean(p)
  );
  return parts.map(escapeHtml).join(" · ");
}

function renderBullets(items: string[]): string {
  if (items.length === 0) return "";
  return `<ul>${items.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`;
}

function buildExperienceSection(run: TailoringRun): string {
  const t = run.tailoredResume;
  const blocks = t.tailoredExperience
    .map((role) => {
      const dates = run.resume.experience.find(
        (e) => e.company === role.company
      );
      const dateStr = [dates?.startDate, dates?.endDate]
        .filter(Boolean)
        .join(" – ");

      return `
        <h3>${escapeHtml(role.title)} — ${escapeHtml(role.company)}</h3>
        ${dateStr ? `<p class="muted">${escapeHtml(dateStr)}</p>` : ""}
        ${renderBullets(role.bullets.map((b) => b.tailored))}
      `;
    })
    .join("");

  if (!blocks) return "";
  return `<h2>Experience</h2>${blocks}`;
}

function buildEducationSection(run: TailoringRun): string {
  const educationHtml = run.resume.education
    .map((e) => {
      const line = [e.degree, e.field, e.institution, e.endDate]
        .filter(Boolean)
        .join(", ");
      return `<li>${escapeHtml(line)}</li>`;
    })
    .join("");

  if (!educationHtml) return "";
  return `<h2>Education</h2><ul>${educationHtml}</ul>`;
}

export function buildTailoredResumeHtml(run: TailoringRun): string {
  const t = run.tailoredResume;
  const contact = contactLine(run);
  const jd = run.jobDescription;

  const footerNote = `Tailored for ${escapeHtml(jd.jobTitle)}${
    jd.company ? ` at ${escapeHtml(jd.company)}` : ""
  }. Verify all content before submitting.`;

  return renderTemplate("tailored-resume.html", {
    pageTitle: escapeHtml(jd.jobTitle),
    contactName: escapeHtml(run.resume.contact.name ?? "Resume"),
    contactLine: contact ? `<p class="contact">${contact}</p>` : "",
    summarySection: t.tailoredSummary
      ? `<h2>Summary</h2><p>${escapeHtml(t.tailoredSummary)}</p>`
      : "",
    skillsSection:
      t.tailoredSkills.length > 0
        ? `<h2>Skills</h2><p>${escapeHtml(t.tailoredSkills.join(" · "))}</p>`
        : "",
    experienceSection: buildExperienceSection(run),
    educationSection: buildEducationSection(run),
    footerNote,
  });
}

function renderComparisonBullet(bullet: TailoredBullet): string {
  const changed = bullet.original.trim() !== bullet.tailored.trim();
  const tailored = changed
    ? `<mark>${escapeHtml(bullet.tailored)}</mark>`
    : escapeHtml(bullet.tailored);

  return `
    <tr>
      <td class="col-original">${escapeHtml(bullet.original)}</td>
      <td class="col-tailored">${tailored}</td>
    </tr>
  `;
}

function renderGapRows(gaps: ResumeGap[]): string {
  const top = gaps.slice(0, 12);
  if (top.length === 0) {
    return `<tr><td colspan="3" class="muted">No significant gaps identified.</td></tr>`;
  }
  return top
    .map(
      (g) => `
    <tr>
      <td><strong>${escapeHtml(g.name)}</strong> (${escapeHtml(g.importance)})</td>
      <td>${escapeHtml(g.jdEvidence)}</td>
      <td>${escapeHtml(g.suggestedAction)}</td>
    </tr>`
    )
    .join("");
}

function renderJdTags(jd: JobDescriptionProfile): string {
  const topSkills = [
    ...jd.requiredSkills.slice(0, 8),
    ...jd.preferredSkills.slice(0, 4),
  ];
  const topTools = jd.tools.slice(0, 8);
  const topKeywords = jd.keywords.slice(0, 10);

  const tags = [
    ...topSkills.map((s) => `<span class="tag">${escapeHtml(s)}</span>`),
    ...topTools.map((t) => `<span class="tag">${escapeHtml(t)}</span>`),
    ...topKeywords.map((k) => `<span class="tag">${escapeHtml(k)}</span>`),
  ];

  if (tags.length === 0) {
    return `<p class="muted">No extracted requirements.</p>`;
  }

  return `<div class="jd-tags">${tags.join("")}</div>`;
}

function buildScoresSection(run: TailoringRun): string {
  return `
    <div class="score-box">
      <p class="muted">Original match</p>
      <p class="score-num">${run.originalMatch.overallScore}</p>
      <p>${escapeHtml(run.originalMatch.explanation)}</p>
    </div>
    <div class="score-box">
      <p class="muted">Tailored match</p>
      <p class="score-num">${run.tailoredMatch.overallScore}</p>
      <p>${escapeHtml(run.tailoredMatch.explanation)}</p>
    </div>
  `;
}

export function buildComparisonPdfHtml(run: TailoringRun): string {
  const jd = run.jobDescription;

  const roleSections = run.tailoredResume.tailoredExperience
    .map((role) => {
      const rows = role.bullets.map(renderComparisonBullet).join("");
      return `
        <h3>${escapeHtml(role.title)} · ${escapeHtml(role.company)}</h3>
        <table class="compare">
          <thead>
            <tr>
              <th>Original</th>
              <th>Tailored</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    })
    .join("");

  const headerMeta = [
    `<strong>${escapeHtml(jd.jobTitle)}</strong>`,
    jd.company ? escapeHtml(jd.company) : null,
    `Generated ${formatDate(run.createdAt)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const footer = `
    <p><strong>Disclaimer:</strong> This report was generated by AI to help align your resume with a job description.
    You must verify every claim, metric, and skill before using this resume. Do not submit unreviewed content.
    This tool does not guarantee ATS ranking or interview outcomes.</p>
    <p>Resume Shapeshifter · Run ID ${escapeHtml(run.id)}</p>
  `;

  return renderTemplate("comparison-pdf.html", {
    pageTitle: escapeHtml(jd.jobTitle),
    headerMeta,
    scoresSection: buildScoresSection(run),
    seniority: escapeHtml(jd.seniorityLevel || "Not specified"),
    jdSummarySection: renderJdTags(jd),
    roleSections,
    gapRows: renderGapRows(run.gapAnalysis.gaps),
    footer,
  });
}
