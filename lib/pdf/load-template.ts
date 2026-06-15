import { readFileSync } from "node:fs";
import { join } from "node:path";

const TEMPLATE_DIR = join(process.cwd(), "templates");

export function loadTemplate(filename: string): string {
  return readFileSync(join(TEMPLATE_DIR, filename), "utf-8");
}

/** Replace `{{key}}` placeholders with pre-escaped HTML fragments. */
export function renderTemplate(
  filename: string,
  vars: Record<string, string>
): string {
  let html = loadTemplate(filename);
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}
