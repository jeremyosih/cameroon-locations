import { describe, expect, test } from "bun:test";
import { mdxToMarkdown, propsTable, tagEnd } from "./llms";

describe("propsTable", () => {
  test("keeps braces and quotes inside strings", () => {
    const tag = `<PropsTable
  label="Field"
  rows={[
    { name: "name", type: "{ fr: string; en: string }", description: "Display names in both official languages." },
    { name: "level", type: "AdminLevel", description: "\\"region\\", \\"division\\" or \\"arrondissement\\"." },
    { name: "population2005", type: "Population?", description: "{ total, male, female } from the 2005 census, as printed." },
    { name: "id", type: "string", default: "–", description: "Canton: <arrondissement pcode>-Cnn." },
  ]}
/>`;
    expect(propsTable(tag)).toEqual([
      "| Field | Type | Default | Description |",
      "| --- | --- | --- | --- |",
      "| `name` | `{ fr: string; en: string }` |  | Display names in both official languages. |",
      '| `level` | `AdminLevel` |  | "region", "division" or "arrondissement". |',
      "| `population2005` | `Population?` |  | { total, male, female } from the 2005 census, as printed. |",
      "| `id` | `string` | – | Canton: <arrondissement pcode>-Cnn. |",
      "",
    ]);
  });

  test("escapes pipes in union types", () => {
    const tag = `<PropsTable rows={[{ name: "a", type: "Pcode | null", description: "x" }]} />`;
    expect(propsTable(tag)[2]).toBe("| `a` | `Pcode \\| null` |  | x |");
  });
});

test("tagEnd ignores > and } inside strings and expressions", () => {
  const text = `<X a="b > c" rows={[{ d: "}" }]} />rest`;
  expect(text.slice(tagEnd(text, 0))).toBe("rest");
});

describe("mdxToMarkdown", () => {
  test("drops imports, comments and previews, keeps callouts and code", () => {
    const md = mdxToMarkdown(`import Demo from "@/demo";
{/* note for agents */}

Intro.

<ComponentPreview code={src}>
  <Demo client:load />
</ComponentPreview>

<Callout title="Heads up">
  Body text.
</Callout>

\`\`\`ts
const a = <T,>(x: T) => x;
\`\`\``);
    expect(md).toBe(
      "Intro.\n\n**Heads up**\n\nBody text.\n\n```ts\nconst a = <T,>(x: T) => x;\n```",
    );
  });

  test("inlines CodeBlock sources from ?raw imports", () => {
    const md = mdxToMarkdown(
      `import typesSource from "../types.ts?raw";

<CodeBlock code={typesSource} lang="ts" title="src/types.ts" />`,
      {
        readRaw: (spec) =>
          spec === "../types.ts?raw" ? "export type A = 1;\n" : undefined,
      },
    );
    expect(md).toBe("`src/types.ts`:\n\n```ts\nexport type A = 1;\n```");
  });
});
