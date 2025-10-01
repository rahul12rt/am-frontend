/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'https://alban-marcus-images.s3.ap-southeast-2.amazonaws.com',
        port: '',
        pathname: '/watches/**',
      },
    ],
  },
}

export default nextConfig
