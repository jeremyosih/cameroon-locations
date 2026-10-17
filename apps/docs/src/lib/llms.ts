/**
 * Turns MDX pages into plain Markdown for `llms.txt` / `llms-full.txt`.
 * Imports and JSX tags are dropped; fenced code and prose are kept.
 */
import { SITE_URL } from "@/site";
import type { DocEntry } from "./docs";

/** Absolute URL of a page. */
export function pageUrl(slug: string): string {
  return slug === "introduction" ? `${SITE_URL}/` : `${SITE_URL}/docs/${slug}`;
}

/** Components whose children are UI, not prose. */
const DROP = new Set(["ComponentPreview"]);

const field = (row: string, key: string) =>
  new RegExp(`\\b${key}: "((?:[^"\\\\]|\\\\.)*)"`)
    .exec(row)?.[1]
    ?.replaceAll('\\"', '"');

/** `<PropsTable rows={[{ name, type, default, description }]} />` as Markdown. */
function propsTable(source: string): string[] {
  const label = /\blabel="([^"]+)"/.exec(source)?.[1] ?? "Prop";
  const rows = source.match(/\{\s*name:[^}]*\}/g) ?? [];
  if (rows.length === 0) return [];
  return [
    `| ${label} | Type | Default | Description |`,
    "| --- | --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| \`${field(r, "name")}\` | \`${field(r, "type")}\` | ${field(r, "default") ?? ""} | ${field(r, "description") ?? ""} |`,
    ),
    "",
  ];
}

/** Strips MDX-only syntax from a page body. */
export function mdxToMarkdown(body: string): string {
  const out: string[] = [];
  let inFence = false;
  let inTag = false;
  let tag: string[] = [];
  let dropping: string | undefined;
  const lines = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").split("\n");
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      if (!dropping) out.push(line);
      continue;
    }
    if (inFence) {
      if (!dropping) out.push(line);
      continue;
    }
    if (dropping) {
      if (line.includes(`</${dropping}>`)) dropping = undefined;
      continue;
    }
    if (inTag) {
      tag.push(line);
      if (/\/?>\s*$/.test(line)) {
        inTag = false;
        if (tag[0]?.includes("<PropsTable"))
          out.push(...propsTable(tag.join("\n")));
      }
      continue;
    }
    if (/^(import|export)\s/.test(line)) continue;
    const open = /^\s*<([A-Z][\w.]*)/.exec(line);
    if (open?.[1]) {
      const name = open[1];
      const selfClosing = /\/>\s*$/.test(line);
      if (DROP.has(name) && !selfClosing) {
        dropping = name;
        continue;
      }
      const title = /\btitle="([^"]+)"/.exec(line)?.[1];
      if (title && !selfClosing) out.push(`**${title}**`, "");
      if (/>\s*$/.test(line)) {
        if (name === "PropsTable") out.push(...propsTable(line));
      } else {
        inTag = true;
        tag = [line];
      }
      continue;
    }
    if (/^\s*<\/[A-Z]/.test(line)) continue;
    out.push(line.replace(/^ {2}(?=\S)/, ""));
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** One page as a Markdown section. */
export function pageToMarkdown(entry: DocEntry): string {
  return [
    `# ${entry.data.title}`,
    "",
    `> ${entry.data.description}`,
    "",
    `Source: ${pageUrl(entry.id)}`,
    "",
    mdxToMarkdown(entry.body ?? ""),
  ].join("\n");
}
