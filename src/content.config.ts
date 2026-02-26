import { defineCollection, z } from "astro:content";

const photos = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    location: z.string().optional(),
    tags: z.array(z.string()).default([]),
    camera: z.string().optional(),
    lens: z.string().optional(),
    description: z.string().optional(),
    cover: z.string().min(1),
    manifest: z.string().min(1),
  }),
});

const photoManifests = defineCollection({
  type: "data",
  schema: z.object({
    images: z
      .array(
        z.object({
          path: z.string().min(1),
          description: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

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
  photos,
  photoManifests,
  blog,
};
