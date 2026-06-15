"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TailorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[tailor-error]", error.message);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        The tailoring flow hit an unexpected error. You can retry or return to
        input.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button
          variant="outline"
          render={<Link href="/tailor" />}
          nativeButton={false}
        >
          Back to input
        </Button>
      </div>
    </div>
  );
}
