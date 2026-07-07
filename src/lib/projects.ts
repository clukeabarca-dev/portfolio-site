import type { CollectionEntry } from "astro:content";

type Project = CollectionEntry<"projects">;

export const isPublishedProject = (project: Project) => !project.data.archived;

export const sortProjectsByOrder = (a: Project, b: Project) => a.data.order - b.data.order;
