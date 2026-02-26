import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    summary: z.string().min(1),
    draft: z.boolean().default(false),
    hero: z.string().optional(),
  }),
});

export const collections = {
  blog,
};
