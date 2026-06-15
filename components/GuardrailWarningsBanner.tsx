"use client";

import { AlertTriangle } from "lucide-react";

type GuardrailWarningsBannerProps = {
  warnings: string[];
  hasCritical?: boolean;
};

export function GuardrailWarningsBanner({
  warnings,
  hasCritical,
}: GuardrailWarningsBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
    >
      <p className="flex items-center gap-2 font-medium">
        <AlertTriangle className="size-4 shrink-0" />
        {hasCritical
          ? "Critical content issues detected — review before exporting"
          : "Content warnings — verify before exporting"}
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-xs sm:text-sm">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}
