import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/content/projects",
  }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    year: z.number(),
    disciplines: z.array(z.string()),
    medium: z.array(z.string()),
    role: z.string(),
    client: z.string(),
    location: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(999),
    cover: z.url(),
    coverAlt: z.string(),
    accent: z.string(),
    theme: z.enum(["light", "dark"]).default("light"),
    summary: z.string(),
  }),
});

export const collections = { projects };
