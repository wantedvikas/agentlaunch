import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
// @module:blog
import { listPosts } from "@/features/blog/posts";
// @end:blog

/** Public marketing routes only; the dashboard is excluded and marked noindex. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = ["/", "/features"].map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
  // @module:blog
  entries.push({
    url: new URL("/blog", siteConfig.url).toString(),
    changeFrequency: "weekly",
    priority: 0.7,
  });
  for (const { slug, meta } of await listPosts())
    entries.push({
      url: new URL(`/blog/${slug}`, siteConfig.url).toString(),
      lastModified: meta.date,
      priority: 0.6,
    });
  // @end:blog
  return entries;
}
