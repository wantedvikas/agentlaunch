import "server-only";

import { readdirSync } from "node:fs";
import path from "node:path";

import type { MDXContent } from "mdx/types";
import { z } from "zod";

/** Post front matter, exported from each MDX file as `export const meta = {...}`. */
const metaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.iso.date(), // YYYY-MM-DD
  author: z.string().min(1),
  /** Example posts shipped with the starter are labelled so they're never mistaken for real news. */
  demo: z.boolean().default(false),
});

export type PostMeta = z.infer<typeof metaSchema>;
export type Post = { slug: string; meta: PostMeta; Content: MDXContent };

const POSTS_DIR = path.join(process.cwd(), "src/content/blog");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function postSlugs(): string[] {
  return readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.slice(0, -".mdx".length))
    .filter((slug) => SLUG.test(slug));
}

/** Loads one post; invalid front matter fails the build with the file name. */
export async function getPost(slug: string): Promise<Post | null> {
  if (!SLUG.test(slug) || !postSlugs().includes(slug)) return null;
  const mod = (await import(`@/content/blog/${slug}.mdx`)) as {
    default: MDXContent;
    meta?: unknown;
  };
  const meta = metaSchema.safeParse(mod.meta);
  if (!meta.success)
    throw new Error(`Invalid front matter in src/content/blog/${slug}.mdx: ${meta.error.message}`);
  return { slug, meta: meta.data, Content: mod.default };
}

/** All posts, newest first. */
export async function listPosts(): Promise<Post[]> {
  const posts = (await Promise.all(postSlugs().map(getPost))).filter((p): p is Post => p !== null);
  return posts.sort((a, b) => b.meta.date.localeCompare(a.meta.date));
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
