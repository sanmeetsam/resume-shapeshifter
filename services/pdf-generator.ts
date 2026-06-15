import {
  buildComparisonPdfHtml,
  buildTailoredResumeHtml,
} from "@/lib/pdf/build-context";
import { sanitizeFilename } from "@/lib/pdf/escape";
import { renderHtmlToPdf } from "@/lib/pdf/renderer";
import type { TailoringRun } from "@/lib/schemas";

export type PdfExportType = "tailored" | "comparison";

export type GeneratedPdf = {
  type: PdfExportType;
  filename: string;
  buffer: Buffer;
};

function baseFilename(run: TailoringRun): string {
  const title = sanitizeFilename(run.jobDescription.jobTitle);
  const company = run.jobDescription.company
    ? `-${sanitizeFilename(run.jobDescription.company)}`
    : "";
  return `${title}${company}`;
}

export async function generateTailoredPdf(run: TailoringRun): Promise<GeneratedPdf> {
  const html = buildTailoredResumeHtml(run);
  const buffer = await renderHtmlToPdf(html);
  return {
    type: "tailored",
    filename: `${baseFilename(run)}-tailored-resume.pdf`,
    buffer,
  };
}

export async function generateComparisonPdf(
  run: TailoringRun
): Promise<GeneratedPdf> {
  const html = buildComparisonPdfHtml(run);
  const buffer = await renderHtmlToPdf(html);
  return {
    type: "comparison",
    filename: `${baseFilename(run)}-comparison.pdf`,
    buffer,
  };
}

export async function generatePdfs(
  run: TailoringRun,
  types: PdfExportType[]
): Promise<GeneratedPdf[]> {
  const results: GeneratedPdf[] = [];

  if (types.includes("tailored")) {
    results.push(await generateTailoredPdf(run));
  }
  if (types.includes("comparison")) {
    results.push(await generateComparisonPdf(run));
  }

  return results;
}

/** For tests — ensure HTML escapes XSS in job title */
export function previewTailoredHtml(run: TailoringRun): string {
  return buildTailoredResumeHtml(run);
}

export function previewComparisonHtml(run: TailoringRun): string {
  return buildComparisonPdfHtml(run);
}
