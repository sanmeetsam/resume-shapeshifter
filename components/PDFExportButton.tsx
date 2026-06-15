"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportPdf } from "@/hooks/useExportPdf";
import type { TailoringRunPartial } from "@/lib/schemas";

type PDFExportButtonProps = {
  run: TailoringRunPartial | null;
  onExported?: () => void;
};

export function PDFExportButton({ run, onExported }: PDFExportButtonProps) {
  const [verified, setVerified] = useState(false);
  const exportMutation = useExportPdf(run, onExported);
  const hasTailored = Boolean(run?.tailoredResume);
  const exportBlocked = !verified;
  const disabled =
    !hasTailored || exportMutation.isPending || exportBlocked;

  return (
    <div className="rounded-lg border bg-card p-6 shadow-xs">
      <p className="text-sm font-medium">Export PDFs</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Download a tailored resume and a side-by-side comparison report. Review
        all content before sharing or submitting applications.
        {run?.status === "exported" && (
          <> You can download again anytime.</>
        )}
      </p>

      <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
        Disclaimer: AI-generated content may contain errors. Verify truthfulness
        of every claim. This tool does not guarantee ATS performance.
      </p>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-primary"
          checked={verified}
          onChange={(e) => setVerified(e.target.checked)}
          disabled={!hasTailored}
        />
        <span>
          I have verified all content is truthful and accurate before export.
        </span>
      </label>

      {exportBlocked && hasTailored && (
        <p className="mt-2 text-xs text-muted-foreground">
          Confirm the checkbox above to enable PDF download.
        </p>
      )}

      {exportMutation.error && (
        <p className="mt-3 text-sm text-destructive">
          {exportMutation.error.message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={disabled}
          onClick={() => exportMutation.mutate(["tailored"])}
        >
          {exportMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          Tailored resume PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => exportMutation.mutate(["comparison"])}
        >
          {exportMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          Comparison PDF
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => exportMutation.mutate(["tailored", "comparison"])}
        >
          {exportMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          Download both
        </Button>
      </div>
    </div>
  );
}
