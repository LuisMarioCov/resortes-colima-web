import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Fase 1: rutas dinámicas con params; reactivar cache cuando el catálogo use "use cache" */
  cacheComponents: false,
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
