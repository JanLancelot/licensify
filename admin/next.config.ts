import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: "dist",
  reactStrictMode: true,
  transpilePackages: ["convex", "@convex-dev/auth"],
  webpack: (config) => {
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      ...(config.resolve.modules || []),
      "node_modules",
    ];
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "convex": path.resolve(__dirname, "node_modules/convex"),
      "@convex-dev/auth": path.resolve(__dirname, "node_modules/@convex-dev/auth"),
    };
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
