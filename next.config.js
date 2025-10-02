/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'alban.b-cdn.net',
      'alban-marcus-pull-trial.b-cdn.net',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1w5wvfcm01czh.cloudfront.net',
        pathname: '/AlbanMarcus/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Generate static pages for better SEO
  output: 'standalone',
  // Optimize for production
  swcMinify: true,
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/collection',
        destination: '/collections',
        permanent: true,
      },
      {
        source: '/watch/:id',
        destination: '/collections/:id',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig;
