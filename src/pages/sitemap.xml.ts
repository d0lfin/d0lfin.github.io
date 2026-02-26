import type { APIRoute } from "astro";
import { getPublishedPosts, getTagGroups, paginatePosts } from "../lib/blog";
import { getAllPhotos, getSeriesList } from "../lib/photos";
import { getSiteUrl } from "../lib/site";

function absoluteUrl(pathname: string, site: URL): string {
  return new URL(pathname, site).toString();
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = getSiteUrl(site);
  const photos = getAllPhotos();
  const series = getSeriesList(photos);
  const posts = await getPublishedPosts();
  const blogPages = paginatePosts(posts).map((page) => page.page).filter((page) => page > 1);
  const tags = getTagGroups(posts);

  const paths = new Set<string>([
    "/",
    "/gallery/",
    "/blog/",
    "/rss.xml",
  ]);

  for (const item of photos) {
    paths.add(`/photo/${item.slug}/`);
  }

  for (const item of series) {
    paths.add(`/gallery/${item.slug}/`);
  }

  for (const post of posts) {
    paths.add(`/blog/${post.slug}/`);
  }

  for (const page of blogPages) {
    paths.add(`/blog/page/${page}/`);
  }

  for (const tag of tags) {
    paths.add(`/blog/tag/${tag.slug}/`);
    const tagPages = paginatePosts(tag.posts).map((page) => page.page).filter((page) => page > 1);
    for (const page of tagPages) {
      paths.add(`/blog/tag/${tag.slug}/page/${page}/`);
    }
  }

  const urls = Array.from(paths)
    .sort((a, b) => a.localeCompare(b))
    .map((pathname) => `<url><loc>${absoluteUrl(pathname, siteUrl)}</loc></url>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
