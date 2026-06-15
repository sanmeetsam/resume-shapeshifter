export class PdfRendererError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfRendererError";
  }
}
