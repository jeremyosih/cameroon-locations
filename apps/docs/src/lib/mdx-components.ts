/**
 * Astro components available in every MDX page without an import. React
 * islands (`InstallCommand`, previews) need an explicit import in the MDX
 * file so Astro can hydrate them with `client:*`.
 */
import AttributionExample from "@/components/docs/AttributionExample.astro";
import Callout from "@/components/docs/Callout.astro";
import CodeBlock from "@/components/docs/CodeBlock.astro";
import ComponentPreview from "@/components/docs/ComponentPreview.astro";
import PipelineDiagram from "@/components/docs/PipelineDiagram.astro";
import PropsTable from "@/components/docs/PropsTable.astro";
import SourcesTable from "@/components/docs/SourcesTable.astro";
import Stats from "@/components/docs/Stats.astro";

export const mdxComponents = {
  AttributionExample,
  Callout,
  CodeBlock,
  ComponentPreview,
  PipelineDiagram,
  PropsTable,
  SourcesTable,
  Stats,
};
