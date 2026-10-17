import { type CollectionEntry, getCollection } from "astro:content";
import { PAGES } from "@/site";

export type DocEntry = CollectionEntry<"docs">;

/** Docs pages in sidebar order. Fails the build if nav and files disagree. */
export async function getDocs(): Promise<DocEntry[]> {
  const entries = await getCollection("docs");
  const byId = new Map(entries.map((e) => [e.id, e]));
  const missing = PAGES.filter((p) => !byId.has(p.slug)).map((p) => p.slug);
  const orphans = entries
    .filter((e) => !PAGES.some((p) => p.slug === e.id))
    .map((e) => e.id);
  if (missing.length > 0 || orphans.length > 0) {
    throw new Error(
      `docs nav out of sync. Missing files: ${missing.join(", ") || "none"}. Not in NAV: ${orphans.join(", ") || "none"}.`,
    );
  }
  return PAGES.map((p) => byId.get(p.slug) as DocEntry);
}

/** Repository path of a page's MDX source. */
export function sourcePath(entry: DocEntry): string {
  return `apps/docs/src/content/docs/${entry.id}.mdx`;
}
