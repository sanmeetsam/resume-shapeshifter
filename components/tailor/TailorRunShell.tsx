"use client";

import type { ReactNode } from "react";
import { TailorStepper, type TailorStep } from "@/components/TailorStepper";
import type { TailoringRunPartial } from "@/lib/schemas";

type TailorRunShellProps = {
  children: ReactNode;
  currentStep: TailorStep;
  run: TailoringRunPartial | null;
  title: string;
  description?: string;
};

export function TailorRunShell({
  children,
  currentStep,
  run,
  title,
  description,
}: TailorRunShellProps) {
  const runId = run?.id;
  const hasAnalysis = Boolean(run?.originalMatch);
  const hasTailored = Boolean(run?.tailoredResume);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <TailorStepper
          runId={runId}
          current={currentStep}
          canAnalysis={hasAnalysis}
          canReview={hasTailored}
          canExport={hasTailored}
        />
      </div>
      {children}
    </div>
  );
}
