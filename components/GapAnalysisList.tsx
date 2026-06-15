"use client";

import { useMemo, useState } from "react";
import type { GapAnalysis, Importance } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type GapAnalysisListProps = {
  gapAnalysis: GapAnalysis;
};

const importanceVariant: Record<
  Importance,
  "high" | "medium" | "low"
> = {
  high: "high",
  medium: "medium",
  low: "low",
};

const IMPORTANCE_ORDER: Record<Importance, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

type Filter = "all" | Importance;

export function GapAnalysisList({ gapAnalysis }: GapAnalysisListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(
    () =>
      [...gapAnalysis.gaps].sort(
        (a, b) =>
          IMPORTANCE_ORDER[a.importance] - IMPORTANCE_ORDER[b.importance]
      ),
    [gapAnalysis.gaps]
  );

  const visible =
    filter === "all"
      ? sorted
      : sorted.filter((g) => g.importance === filter);

  if (gapAnalysis.gaps.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
        role="status"
      >
        No gaps identified — strong alignment with the job description.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Gap analysis</h3>
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="Filter gaps by importance"
        >
          {(["all", "high", "medium", "low"] as const).map((f) => (
            <Button
              key={f}
              type="button"
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f === "all" ? "All" : f}
            </Button>
          ))}
        </div>
      </div>
      <ul className="space-y-3">
        {visible.map((gap) => (
          <li
            key={gap.name}
            className="rounded-lg border bg-card p-4 text-sm shadow-xs"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{gap.name}</span>
              <Badge variant={importanceVariant[gap.importance]}>
                {gap.importance}
              </Badge>
              {!gap.canSafelyAdd && (
                <Badge variant="outline">Do not invent</Badge>
              )}
            </div>
            <p className="mt-2 text-muted-foreground">
              <span className="font-medium text-foreground">JD: </span>
              {gap.jdEvidence}
            </p>
            <p className="mt-1 text-muted-foreground">
              <span className="font-medium text-foreground">Resume: </span>
              {gap.resumeEvidence || "Not mentioned"}
            </p>
            <p className="mt-2 text-foreground">{gap.suggestedAction}</p>
          </li>
        ))}
      </ul>
      {visible.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No {filter} importance gaps in this run.
        </p>
      )}
    </div>
  );
}
