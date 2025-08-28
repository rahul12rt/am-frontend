/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'alban.b-cdn.net',
        port: '',
        pathname: '/watches/**',
      },
    ],
  },
}

export default nextConfig
