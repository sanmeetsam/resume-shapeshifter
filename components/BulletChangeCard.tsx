"use client";

import type { TailoredBullet } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BulletChangeCardProps = {
  bullet: TailoredBullet;
};

const confidenceVariant = {
  high: "success" as const,
  medium: "medium" as const,
  low: "warning" as const,
};

export function BulletChangeCard({ bullet }: BulletChangeCardProps) {
  const changed = bullet.original.trim() !== bullet.tailored.trim();
  const needsReview = Boolean(bullet.riskFlag) || bullet.confidence === "low";

  return (
    <div
      className={cn(
        "rounded-md border p-3 text-sm",
        changed && "border-primary/30 bg-primary/5",
        needsReview &&
          "border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/30"
      )}
    >
      <p
        className={cn(
          "leading-relaxed",
          changed && "bg-primary/10 rounded px-1 py-0.5"
        )}
      >
        {bullet.tailored}
      </p>
      {changed && (
        <p className="mt-2 text-xs text-muted-foreground line-through">
          {bullet.original}
        </p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{bullet.changeReason}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge variant={confidenceVariant[bullet.confidence]}>
          {bullet.confidence} confidence
        </Badge>
        {bullet.keywordsAddressed.map((kw) => (
          <Badge key={kw} variant="outline">
            {kw}
          </Badge>
        ))}
        {bullet.riskFlag && (
          <Badge variant="high">{bullet.riskFlag}</Badge>
        )}
      </div>
    </div>
  );
}
