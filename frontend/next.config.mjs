const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Proxy /api/* to the Fastify backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
      { protocol: 'https', hostname: 'f.vimeocdn.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: '*.cdninstagram.com' },
      { protocol: 'https', hostname: '*.fbcdn.net' },
      { protocol: 'https', hostname: '*.redd.it' },
      { protocol: 'https', hostname: 'preview.redd.it' },
      { protocol: 'https', hostname: '*.tiktokcdn.com' },
      { protocol: 'https', hostname: 'static-cdn.jtvnw.net' },
      { protocol: 'https', hostname: 'i1.sndcdn.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
