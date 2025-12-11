import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {}, // empty config tells Next.js you intentionally want Webpack + Turbopack coexistence
  webpack: (config) => {
    config.externals = [...(config.externals || []), "@prisma/client"];
    return config;
  },
};

export default nextConfig;
