import { PdfRendererError } from "@/lib/pdf/errors";
import { launchPdfBrowser } from "@/lib/pdf/launch-browser";

export { PdfRendererError } from "@/lib/pdf/errors";

const PDF_MARGINS = {
  top: "0.5in",
  bottom: "0.6in",
  left: "0.55in",
  right: "0.55in",
};

const SUPPORTED_RENDERERS = ["playwright"] as const;

export type PdfRendererName = (typeof SUPPORTED_RENDERERS)[number];

export function getPdfRendererName(): string {
  return process.env.PDF_RENDERER?.trim().toLowerCase() || "playwright";
}

export function assertPdfRendererSupported(): PdfRendererName {
  const name = getPdfRendererName();
  if (!SUPPORTED_RENDERERS.includes(name as PdfRendererName)) {
    throw new PdfRendererError(
      `Unsupported PDF_RENDERER "${name}". Supported values: ${SUPPORTED_RENDERERS.join(", ")}. Set PDF_RENDERER=playwright in .env.`
    );
  }
  return name as PdfRendererName;
}

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  assertPdfRendererSupported();

  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "Letter",
      margin: PDF_MARGINS,
      printBackground: true,
    });
    const buffer = Buffer.from(pdf);
    if (buffer.length === 0) {
      throw new PdfRendererError("PDF generation produced an empty file");
    }
    return buffer;
  } finally {
    await browser.close();
  }
}
