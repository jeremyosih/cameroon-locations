import type { APIRoute } from "astro";
import { getDocs } from "@/lib/docs";
import { pageUrl } from "@/lib/llms";
import {
  GITHUB_URL,
  NAV,
  registryUrl,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/site";

/** https://llmstxt.org index, generated from the MDX pages. */
export const GET: APIRoute = async () => {
  const docs = new Map((await getDocs()).map((d) => [d.id, d]));
  const sections = NAV.map((group) => {
    const lines = group.items.map((item) => {
      const doc = docs.get(item.slug);
      return `- [${item.label}](${pageUrl(item.slug)}): ${doc?.data.description ?? ""}`;
    });
    return `## ${group.label}\n\n${lines.join("\n")}`;
  });

  const body = [
    "# cameroon-locations",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Records are plain frozen objects keyed by OCHA P-codes (`CM002` region, `CM002007` division, `CM002007001` arrondissement). Lookups return `T | undefined` or readonly arrays. Entry points: `cameroon-locations`, `cameroon-locations/cantons`, `/villages`, `/search`, `/geo`, `/elecam`, `/effect`, `/geojson/*`.",
    "",
    ...sections.flatMap((s) => [s, ""]),
    "## Optional",
    "",
    `- [llms-full.txt](${SITE_URL}/llms-full.txt): every page in one file`,
    `- [Repository](${GITHUB_URL}): source, data pool and NOTICE.md`,
    `- [shadcn registry item](${registryUrl("cameroon-locations-core")}): copy-paste core utilities`,
    `- [Location picker registry item](${registryUrl("location-picker")}): cascading region/division/arrondissement picker (shadcn/ui, no npm dependency)`,
    `- [Cameroon map registry item](${registryUrl("cameroon-map")}): choropleth and drill-down map on shadcn-map (depends on the npm package)`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
