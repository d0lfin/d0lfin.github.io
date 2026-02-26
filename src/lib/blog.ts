import { getCollection, type CollectionEntry } from "astro:content";

export const BLOG_PAGE_SIZE = 2;

export type BlogPost = CollectionEntry<"blog">;

export interface PaginatedPosts {
  page: number;
  totalPages: number;
  items: BlogPost[];
}

export interface BlogTagGroup {
  slug: string;
  label: string;
  posts: BlogPost[];
}

function normalizeTag(tag: string): string {
  return tag.trim();
}

export function toTagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return sortPostsByDate(posts);
}

export function paginatePosts(posts: BlogPost[], pageSize: number = BLOG_PAGE_SIZE): PaginatedPosts[] {
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const pages: PaginatedPosts[] = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    pages.push({
      page,
      totalPages,
      items: posts.slice(start, end),
    });
  }

  return pages;
}

export function getTagGroups(posts: BlogPost[]): BlogTagGroup[] {
  const groups = new Map<string, BlogTagGroup>();

  for (const post of posts) {
    for (const rawTag of post.data.tags) {
      const normalized = normalizeTag(rawTag);
      if (!normalized) {
        continue;
      }
      const slug = toTagSlug(normalized);
      if (!slug) {
        continue;
      }

      const existing = groups.get(slug);
      if (existing) {
        existing.posts.push(post);
        continue;
      }

      groups.set(slug, {
        slug,
        label: normalized,
        posts: [post],
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function getBlogPageUrl(page: number): string {
  return page <= 1 ? "/blog/" : `/blog/page/${page}/`;
}

export function getTagPageUrl(tagSlug: string, page: number): string {
  return page <= 1 ? `/blog/tag/${tagSlug}/` : `/blog/tag/${tagSlug}/page/${page}/`;
}
