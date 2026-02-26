import type { APIRoute } from "astro";
import { getPublishedPosts } from "../lib/blog";
import { getSiteUrl } from "../lib/site";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = getSiteUrl(site);
  const posts = await getPublishedPosts();
  const feedUrl = new URL("/rss.xml", siteUrl).toString();
  const siteLink = siteUrl.toString();

  const items = posts
    .map((post) => {
      const link = new URL(`/blog/${post.slug}/`, siteUrl).toString();
      const title = xmlEscape(post.data.title);
      const description = xmlEscape(post.data.summary);
      const pubDate = post.data.date.toUTCString();
      return `<item><title>${title}</title><link>${link}</link><guid>${link}</guid><description>${description}</description><pubDate>${pubDate}</pubDate></item>`;
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0"><channel>` +
    `<title>Alexey Emelin</title>` +
    `<link>${siteLink}</link>` +
    `<description>Personal blog and gallery.</description>` +
    `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />` +
    items +
    `</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
