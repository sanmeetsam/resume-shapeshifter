import { describe, expect, it } from "vitest";
import { extractResumeFromBuffer } from "@/lib/document-extract";

describe("extractResumeFromBuffer", () => {
  it("rejects unsupported MIME types", async () => {
    await expect(
      extractResumeFromBuffer(
        Buffer.from("hello"),
        "text/plain",
        "resume.txt"
      )
    ).rejects.toThrow(/Unsupported file type/);
  });

  it("rejects oversize buffers", async () => {
    const huge = Buffer.alloc(6 * 1024 * 1024, 1);
    await expect(
      extractResumeFromBuffer(
        huge,
        "application/pdf",
        "big.pdf"
      )
    ).rejects.toThrow(/exceeds maximum size/);
  });
});
