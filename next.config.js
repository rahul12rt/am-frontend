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
  },
  // Enable compression
  compress: true,
  // Optimize for production
  swcMinify: true,
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
