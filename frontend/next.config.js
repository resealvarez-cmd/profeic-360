/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // <--- ¡ESTA ES LA LÍNEA QUE FALTABA!
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: { workerThreads: false, cpus: 1 },
  // config moved to .env.local
  // NEXT_PUBLIC_SUPABASE_URL: '...',
  // NEXT_PUBLIC_SUPABASE_ANON_KEY: '...',
  // NEXT_PUBLIC_API_URL: '...',
};
module.exports = nextConfig
