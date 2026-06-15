const DEFAULT_MAX_MB = 5;

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type AllowedResumeMime = (typeof ALLOWED_RESUME_MIME_TYPES)[number];

export function getMaxUploadMb(): number {
  const raw = process.env.MAX_UPLOAD_MB;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_MAX_MB;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_MB;
}

export function getMaxUploadBytes(): number {
  return getMaxUploadMb() * 1024 * 1024;
}

export function isAllowedResumeMime(mime: string): mime is AllowedResumeMime {
  return (ALLOWED_RESUME_MIME_TYPES as readonly string[]).includes(mime);
}
