/**
 * Turns MDX pages into plain Markdown for `llms.txt` / `llms-full.txt`.
 * Imports and UI components are dropped; prose, fenced code, callouts,
 * props tables and `<CodeBlock code={…?raw} />` sources are kept.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { SITE_URL } from "@/site";
import type { DocEntry } from "./docs";

/** Absolute URL of a page. */
export function pageUrl(slug: string): string {
  return slug === "introduction" ? `${SITE_URL}/` : `${SITE_URL}/docs/${slug}`;
}

/** Components whose children are UI, not prose. */
const DROP = new Set(["ComponentPreview"]);

/**
 * Index just past the end of the JSX tag opening at `start` (`<Name …>` or
 * `<Name … />`), skipping quoted strings and `{…}` expressions so that `>`
 * or `}` inside them don't end the tag.
 */
export function tagEnd(text: string, start: number): number {
  let depth = 0;
  let quote: string | undefined;
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = undefined;
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i + 1;
  }
  return text.length;
}

/** Source of the `{…}` expression of attribute `name` in a tag, if any. */
export function attrExpression(tag: string, name: string): string | undefined {
  const at = new RegExp(`\\b${name}=\\{`).exec(tag);
  if (!at) return undefined;
  const from = at.index + at[0].length;
  let depth = 1;
  let quote: string | undefined;
  for (let i = from; i < tag.length; i++) {
    const c = tag[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = undefined;
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return tag.slice(from, i);
  }
  return undefined;
}

function attrString(tag: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1];
}

interface Row {
  name: string;
  type: string;
  default?: string;
  description: string;
}

const cell = (s: string | undefined) => (s ?? "").replaceAll("|", "\\|");

/** `<PropsTable rows={[…]} />` as a Markdown table. */
export function propsTable(tag: string): string[] {
  const expr = attrExpression(tag, "rows");
  if (!expr) return [];
  // Our own MDX, evaluated at build time: rows are plain object literals.
  const rows = new Function(`return (${expr});`)() as Row[];
  const label = attrString(tag, "label") ?? "Prop";
  return [
    `| ${label} | Type | Default | Description |`,
    "| --- | --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| \`${cell(r.name)}\` | \`${cell(r.type)}\` | ${cell(r.default)} | ${cell(r.description)} |`,
    ),
    "",
  ];
}

export interface MarkdownOptions {
  /** Returns the contents of a `?raw` import specifier. */
  readonly readRaw?: (specifier: string) => string | undefined;
}

/** Strips MDX-only syntax from a page body. */
export function mdxToMarkdown(
  body: string,
  options: MarkdownOptions = {},
): string {
  const text = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  const raw = new Map<string, string>();
  for (const m of text.matchAll(
    /^import\s+(\w+)\s+from\s+"([^"]+\?raw)";?$/gm,
  )) {
    if (m[1] && m[2]) raw.set(m[1], m[2]);
  }

  const out: string[] = [];
  let inFence = false;
  let pos = 0;
  while (pos < text.length) {
    const nl = text.indexOf("\n", pos);
    const lineEnd = nl === -1 ? text.length : nl;
    const line = text.slice(pos, lineEnd);

    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence || /^\s*```/.test(line)) {
      out.push(line);
      pos = lineEnd + 1;
      continue;
    }
    if (/^(import|export)\s/.test(line)) {
      pos = lineEnd + 1;
      continue;
    }

    const open = /^\s*<([A-Z][\w.]*)/.exec(line);
    if (open?.[1]) {
      const name = open[1];
      const start = pos + line.indexOf("<");
      const end = tagEnd(text, start);
      const tag = text.slice(start, end);
      const selfClosing = tag.endsWith("/>");
      if (DROP.has(name) && !selfClosing) {
        const close = text.indexOf(`</${name}>`, end);
        pos = close === -1 ? text.length : close + name.length + 3;
        continue;
      }
      if (name === "PropsTable") out.push(...propsTable(tag));
      if (name === "CodeBlock") {
        const ref = attrExpression(tag, "code");
        const spec = ref ? raw.get(ref.trim()) : undefined;
        const source = spec ? options.readRaw?.(spec) : undefined;
        if (source) {
          const title = attrString(tag, "title");
          if (title) out.push(`\`${title}\`:`, "");
          out.push(
            `\`\`\`${attrString(tag, "lang") ?? ""}`,
            source.trimEnd(),
            "```",
            "",
          );
        }
      }
      const title = attrString(tag, "title");
      if (title && !selfClosing && name !== "CodeBlock") {
        out.push(`**${title}**`, "");
      }
      pos = end;
      continue;
    }
    if (/^\s*<\/[A-Z]/.test(line)) {
      pos = lineEnd + 1;
      continue;
    }
    out.push(line.replace(/^ {2}(?=\S)/, ""));
    pos = lineEnd + 1;
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** One page as a Markdown section. */
export function pageToMarkdown(entry: DocEntry): string {
  const root = process.cwd();
  const readRaw = (spec: string) => {
    const path = spec.replace(/\?raw$/, "");
    const file = path.startsWith("@/")
      ? resolve(root, "src", path.slice(2))
      : resolve(root, dirname(entry.filePath ?? ""), path);
    try {
      return readFileSync(file, "utf8");
    } catch {
      return undefined;
    }
  };
  return [
    `# ${entry.data.title}`,
    "",
    `> ${entry.data.description}`,
    "",
    `Source: ${pageUrl(entry.id)}`,
    "",
    mdxToMarkdown(entry.body ?? "", { readRaw }),
  ].join("\n");
}
