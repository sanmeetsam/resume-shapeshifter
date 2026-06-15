"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PipelineProgressProps = {
  stages: string[];
  active: boolean;
  label?: string;
};

export function PipelineProgress({
  stages,
  active,
  label = "Working…",
}: PipelineProgressProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % stages.length);
    }, 2200);
    return () => clearInterval(id);
  }, [active, stages.length]);

  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border bg-muted/30 px-4 py-3"
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {label}
      </p>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {stages.map((stage, i) => (
          <li
            key={stage}
            className={cn(
              "flex items-center gap-2",
              i === index && "font-medium text-foreground"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                i === index ? "bg-primary" : "bg-muted-foreground/40"
              )}
              aria-hidden
            />
            {stage}
          </li>
        ))}
      </ul>
    </div>
  );
}
