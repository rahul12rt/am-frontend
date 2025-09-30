module.exports = {
  images: {
    domains: [
      'alban.b-cdn.net',
      'alban-marcus-pull-trial.b-cdn.net',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'alban-marcus-images.s3.ap-southeast-2.amazonaws.com',
        pathname: '/AlbanMarcus/**',
      },
    ],
  },
};
