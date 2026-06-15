import { afterEach, describe, expect, it } from "vitest";
import {
  assertPdfRendererSupported,
  getPdfRendererName,
  PdfRendererError,
} from "@/lib/pdf/renderer";

describe("pdf renderer config", () => {
  const original = process.env.PDF_RENDERER;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.PDF_RENDERER;
    } else {
      process.env.PDF_RENDERER = original;
    }
  });

  it("defaults to playwright", () => {
    delete process.env.PDF_RENDERER;
    expect(getPdfRendererName()).toBe("playwright");
    expect(assertPdfRendererSupported()).toBe("playwright");
  });

  it("rejects unsupported PDF_RENDERER values", () => {
    process.env.PDF_RENDERER = "react-pdf";
    expect(() => assertPdfRendererSupported()).toThrow(PdfRendererError);
    expect(() => assertPdfRendererSupported()).toThrow(/Unsupported PDF_RENDERER/);
  });
});
