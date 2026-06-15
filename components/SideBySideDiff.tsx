"use client";

import type { TailoredResume } from "@/lib/schemas";
import { BulletChangeCard } from "@/components/BulletChangeCard";
import { cn } from "@/lib/utils";

type SideBySideDiffProps = {
  tailoredResume: TailoredResume;
};

export function SideBySideDiff({ tailoredResume }: SideBySideDiffProps) {
  return (
    <div className="space-y-6">
      {tailoredResume.tailoredSummary && (
        <section>
          <h3 className="mb-2 text-sm font-medium">Summary</h3>
          <p className="rounded-lg border bg-card p-3 text-sm leading-relaxed">
            {tailoredResume.tailoredSummary}
          </p>
        </section>
      )}

      {tailoredResume.tailoredSkills.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium">Skills (reordered)</h3>
          <p className="text-sm text-muted-foreground">
            {tailoredResume.tailoredSkills.join(" · ")}
          </p>
        </section>
      )}

      {tailoredResume.tailoredExperience.map((role) => (
        <section key={`${role.company}-${role.title}`}>
          <h3 className="text-sm font-semibold">
            {role.title}
            <span className="font-normal text-muted-foreground">
              {" "}
              · {role.company}
            </span>
          </h3>

          <div className="mt-3 hidden gap-4 md:grid md:grid-cols-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Original
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tailored
            </p>
          </div>

          <ul className="mt-2 space-y-4">
            {role.bullets.map((bullet, i) => {
              const needsReview =
                Boolean(bullet.riskFlag) || bullet.confidence === "low";
              return (
                <li
                  key={`${bullet.original.slice(0, 24)}-${i}`}
                  className={cn(
                    "grid gap-3 md:grid-cols-2",
                    needsReview && "rounded-lg p-1 ring-1 ring-amber-500/40"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-md border bg-muted/30 p-3 text-sm leading-relaxed",
                      needsReview && "border-amber-500/40"
                    )}
                  >
                    {bullet.original}
                  </div>
                  <BulletChangeCard bullet={bullet} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
