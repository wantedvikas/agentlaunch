import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Dev-only badge; bottom-left would cover the dashboard sidebar's "Back to site" link.
  devIndicators: { position: "bottom-right" },
  // Dev logging of Server Function calls prints their arguments, including passwords from the
  // auth forms. Keep it off; request lines (e.g. "POST /login 200") are still logged.
  logging: { serverFunctions: false },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
