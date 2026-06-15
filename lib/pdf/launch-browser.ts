import type { Browser } from "playwright-core";
import { isServerlessHost } from "@/lib/is-serverless";
import { PdfRendererError } from "@/lib/pdf/errors";

/**
 * Launch Chromium for PDF export.
 * - Vercel/Lambda: playwright-core + @sparticuz/chromium (no system browser install).
 * - Local: full `playwright` package with `npm run pdf:install`.
 */
export async function launchPdfBrowser(): Promise<Browser> {
  if (isServerlessHost()) {
    return launchServerlessBrowser();
  }
  return launchLocalBrowser();
}

async function launchServerlessBrowser(): Promise<Browser> {
  const { chromium: playwrightChromium } = await import("playwright-core");
  const chromium = (await import("@sparticuz/chromium")).default;

  return playwrightChromium.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

async function launchLocalBrowser(): Promise<Browser> {
  try {
    const { chromium } = await import("playwright");
    return chromium.launch({ headless: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("Executable doesn't exist") ||
      message.includes("chromium")
    ) {
      throw new PdfRendererError(
        "PDF engine not installed. Run: npm run pdf:install"
      );
    }
    throw err;
  }
}
