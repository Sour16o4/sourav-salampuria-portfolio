/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Barrel-file imports get rewritten to deep imports, so only the icons and
    // motion primitives actually used end up in the bundle.
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
