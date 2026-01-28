/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // <--- ¡ESTA ES LA LÍNEA QUE FALTABA!
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: { workerThreads: false, cpus: 1 },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://oepgqbkhkkgwsoxqaxlk.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcGdxYmtoa2tnd3NveHFheGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTQxODAsImV4cCI6MjA3OTA3MDE4MH0.4nVFYeUntc5ng8GWkWURBzbmLkjVtvV1i4u5Q_UgBGQ',
    NEXT_PUBLIC_API_URL: 'https://profeic-backend-484019506864.us-central1.run.app',
  },
}
module.exports = nextConfig
