import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Resume Shapeshifter
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Truthful resume tailoring for every job description
          </h1>
          <p className="text-lg text-muted-foreground">
            Match scoring, gap analysis, and side-by-side bullet rewrites — with
            a PDF proof artifact when you are ready to apply.
          </p>
        </div>
        <Button render={<Link href="/tailor" />} nativeButton={false} size="lg">
          Get started
        </Button>
      </main>
    </div>
  );
}
