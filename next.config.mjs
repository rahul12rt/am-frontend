/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1w5wvfcm01czh.cloudfront.net',
        port: '',
        pathname: '/AlbanMarcus/**',
      },
    ],
  },
}

export default nextConfig
