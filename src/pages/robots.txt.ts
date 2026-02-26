import type { APIRoute } from "astro";
import { getSiteUrl } from "../lib/site";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = getSiteUrl(site);
  const sitemapUrl = new URL("/sitemap.xml", siteUrl).toString();

  const body = [`User-agent: *`, `Allow: /`, `Sitemap: ${sitemapUrl}`].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
