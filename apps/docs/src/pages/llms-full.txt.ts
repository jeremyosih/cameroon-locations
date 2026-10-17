import type { APIRoute } from "astro";
import { getDocs } from "@/lib/docs";
import { pageToMarkdown } from "@/lib/llms";
import { SITE_DESCRIPTION } from "@/site";

/** Every docs page as Markdown, in sidebar order. */
export const GET: APIRoute = async () => {
  const docs = await getDocs();
  const header = `# cameroon-locations\n\n> ${SITE_DESCRIPTION}`;
  const body = [header, ...docs.map(pageToMarkdown)].join("\n\n---\n\n");

  return new Response(`${body}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
