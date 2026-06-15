import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdf-parse",
    "mammoth",
    "playwright-core",
    "@sparticuz/chromium",
  ],
  outputFileTracingIncludes: {
    "/api/export/pdf": ["./node_modules/@sparticuz/chromium/**"],
  },
};

export default nextConfig;
