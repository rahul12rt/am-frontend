/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'alban-marcus-images.s3.ap-southeast-2.amazonaws.com',
        port: '',
        pathname: '/AlbanMarcus/**',
      },
    ],
  },
}

export default nextConfig
