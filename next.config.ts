import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Export /page/index.html so both /page and /page/ work on GitHub Pages.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Served from the custom domain root (hmcyberacademy.com), so basePath is empty
  basePath: '', 
};

export default nextConfig;
