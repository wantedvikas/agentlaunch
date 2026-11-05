import type { NextConfig } from "next";
// @module:blog
import createMDX from "@next/mdx";
// @end:blog

const nextConfig: NextConfig = {
  // Docker builds set NEXT_OUTPUT=standalone for a small image; `next start` (dev, tests) needs the default.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  cacheComponents: true,
  // Dev-only badge; bottom-left would cover the dashboard sidebar's "Back to site" link.
  devIndicators: { position: "bottom-right" },
  // Dev logging of Server Function calls prints their arguments, including passwords from the
  // auth forms. Keep it off; request lines (e.g. "POST /login 200") are still logged.
  logging: { serverFunctions: false },
  partialPrefetching: true,
  // @module:uploads
  // Uploads go through a Server Action; allow 5 MB files plus multipart overhead.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  // @end:uploads
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Optional modules wrap the config (the create-agentlaunch CLI removes the ones you don't pick).
const plugins: ((config: NextConfig) => NextConfig)[] = [
  // @module:blog
  // MDX for blog posts in src/content/blog (no remark plugins: Turbopack needs serializable options).
  createMDX({}),
  // @end:blog
];

export default plugins.reduce((config, plugin) => plugin(config), nextConfig);
