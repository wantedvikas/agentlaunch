import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** Public marketing routes only; the dashboard is excluded and marked noindex. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/features"].map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
