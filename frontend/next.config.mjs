const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      // YouTube thumbnails
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      // YouTube shortened thumbnails
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      // Vimeo
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
      { protocol: 'https', hostname: 'f.vimeocdn.com' },
      // Twitter / X
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      // Instagram / Facebook
      { protocol: 'https', hostname: '*.cdninstagram.com' },
      { protocol: 'https', hostname: '*.fbcdn.net' },
      // Reddit
      { protocol: 'https', hostname: '*.redd.it' },
      { protocol: 'https', hostname: 'preview.redd.it' },
      // TikTok
      { protocol: 'https', hostname: '*.tiktokcdn.com' },
      // Twitch
      { protocol: 'https', hostname: 'static-cdn.jtvnw.net' },
      // SoundCloud
      { protocol: 'https', hostname: 'i1.sndcdn.com' },
      // Generic fallback for any https thumbnail
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
