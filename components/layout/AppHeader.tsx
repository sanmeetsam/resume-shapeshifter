import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Resume Shapeshifter
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/tailor"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tailor
          </Link>
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            Groq
          </span>
        </nav>
      </div>
    </header>
  );
}
