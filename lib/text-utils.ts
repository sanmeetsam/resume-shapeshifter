/** Rough char cap for LLM inputs (MVP token budgeting). */
export function truncateText(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}\n\n[truncated]`;
}

export function extractJsonString(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return raw.slice(start, end + 1);
  }

  return raw.trim();
}
