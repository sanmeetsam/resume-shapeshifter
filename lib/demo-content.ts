import { readFileSync } from "node:fs";
import { join } from "node:path";

const fixturesDir = join(process.cwd(), "tests", "fixtures");

function loadTextFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), "utf-8").trim();
}

/** Portfolio demo resume (curated from fixtures). */
export function getDemoResumeText(): string {
  return loadTextFixture("demo-resume.txt");
}

/** Portfolio demo job description. */
export function getDemoJdText(): string {
  return loadTextFixture("demo-jd.txt");
}
