"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type TailorStep = "input" | "analysis" | "review" | "export";

const STEPS: { id: TailorStep; label: string }[] = [
  { id: "input", label: "Input" },
  { id: "analysis", label: "Analysis" },
  { id: "review", label: "Review" },
  { id: "export", label: "Export" },
];

type TailorStepperProps = {
  runId?: string;
  current: TailorStep;
  canAnalysis?: boolean;
  canReview?: boolean;
  canExport?: boolean;
};

function hrefFor(step: TailorStep, runId?: string): string | null {
  if (step === "input") return "/tailor";
  if (!runId) return null;
  if (step === "analysis") return `/tailor/${runId}/analysis`;
  if (step === "review") return `/tailor/${runId}/review`;
  if (step === "export") return `/tailor/${runId}/export`;
  return null;
}

function isEnabled(
  step: TailorStep,
  props: TailorStepperProps
): boolean {
  if (step === "input") return true;
  if (step === "analysis") return props.canAnalysis ?? false;
  if (step === "review") return props.canReview ?? false;
  if (step === "export") return props.canExport ?? false;
  return false;
}

export function TailorStepper(props: TailorStepperProps) {
  const { runId, current } = props;

  return (
    <nav aria-label="Tailoring progress" className="w-full">
      <ol className="flex flex-wrap gap-2 sm:gap-4">
        {STEPS.map((step, i) => {
          const enabled = isEnabled(step.id, props);
          const href = hrefFor(step.id, runId);
          const isCurrent = current === step.id;

          const className = cn(
            "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
            isCurrent && "bg-primary/10 font-medium text-foreground",
            !isCurrent && enabled && "text-muted-foreground hover:text-foreground",
            !enabled && "cursor-not-allowed text-muted-foreground/50"
          );

          const content = (
            <>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "border bg-background"
                )}
                aria-hidden
              >
                {i + 1}
              </span>
              {step.label}
            </>
          );

          return (
            <li key={step.id}>
              {enabled && href ? (
                <Link href={href} className={className}>
                  {content}
                </Link>
              ) : (
                <span className={className} aria-disabled>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
