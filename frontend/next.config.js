/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: { workerThreads: false, cpus: 1 },
};
module.exports = nextConfig
