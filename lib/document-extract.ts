import {
  getMaxUploadBytes,
  getMaxUploadMb,
  isAllowedResumeMime,
} from "@/lib/upload-config";

export type ExtractedDocument = {
  text: string;
  warnings: string[];
  mimeType: string;
  fileName: string;
};

function detectLayoutWarnings(text: string): string[] {
  const warnings: string[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    warnings.push("No text could be extracted from the file.");
    return warnings;
  }

  const shortLines = lines.filter((l) => l.trim().length > 0 && l.trim().length < 28);
  if (shortLines.length / lines.length > 0.45) {
    warnings.push(
      "Column layout may be wrong — extracted text has many short lines. Review or paste plain text if sections look scrambled."
    );
  }

  const hasExperience = /experience|employment|work history/i.test(text);
  const hasSkills = /skills|technical proficiencies/i.test(text);
  if (!hasExperience && lines.length > 8) {
    warnings.push(
      "Experience section unclear after extraction. Verify role titles and bullet order."
    );
  }
  if (!hasSkills && lines.length > 8) {
    warnings.push(
      "Skills section may be missing or merged — review parsed content before analyzing."
    );
  }

  return warnings;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

export async function extractResumeFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractedDocument> {
  if (buffer.length > getMaxUploadBytes()) {
    throw new Error(
      `File exceeds maximum size of ${getMaxUploadMb()} MB.`
    );
  }

  if (!isAllowedResumeMime(mimeType)) {
    throw new Error(
      "Unsupported file type. Upload PDF or DOCX only."
    );
  }

  let text = "";
  if (mimeType === "application/pdf") {
    text = await extractPdfText(buffer);
  } else {
    text = await extractDocxText(buffer);
  }

  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    throw new Error(
      "Could not extract text from the file. Try pasting resume text instead."
    );
  }

  const warnings = detectLayoutWarnings(normalized);

  return {
    text: normalized,
    warnings,
    mimeType,
    fileName,
  };
}

export async function extractResumeFromFile(
  file: File
): Promise<ExtractedDocument> {
  const mimeType = file.type || guessMimeFromName(file.name);
  if (!isAllowedResumeMime(mimeType)) {
    throw new Error(
      "Unsupported file type. Upload PDF or DOCX only."
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return extractResumeFromBuffer(buffer, mimeType, file.name);
}

function guessMimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "";
}
