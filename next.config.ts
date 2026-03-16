import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Since the URL is mukeshpyda.github.io, basePath is empty
  basePath: '', 
};

export default nextConfig;
