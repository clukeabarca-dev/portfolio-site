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
    year: z.union([z.number(), z.string()]),
    disciplines: z.array(z.string()),
    medium: z.array(z.string()),
    role: z.string(),
    client: z.string(),
    location: z.string().optional(),
    featured: z.boolean().default(false),
    archived: z.boolean().default(false),
    order: z.number().default(999),
    cover: z.string().min(1),
    coverAlt: z.string(),
    gallery: z
      .array(
        z.object({
          src: z.string().min(1),
          alt: z.string(),
          caption: z.string(),
          layout: z.enum(["wide", "tall", "square"]).default("wide"),
          credit: z.enum(["photography-and-editing", "editing-only"]).optional(),
        }),
      )
      .min(1, "Project pages need at least 1 gallery image.")
      .max(24, "Project pages should stay at 24 gallery images or fewer."),
    accent: z.string(),
    theme: z.enum(["light", "dark"]).default("light"),
    summary: z.string(),
    chapterEyebrow: z.string().optional(),
    chapterTitle: z.string().optional(),
    chapterBody: z.string().optional(),
  }),
});

export const collections = { projects };
