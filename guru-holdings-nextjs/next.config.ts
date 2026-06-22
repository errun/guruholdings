import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.guruholdings.net' }],
        destination: 'https://guruholdings.net/:path*',
        permanent: true,
      },
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true },
      { source: '/holdings/buffett', destination: '/live-13f/berkshire', permanent: true },
      { source: '/holdings/li-lu', destination: '/live-13f/himalaya', permanent: true },
      { source: '/:locale(zh|ja|ko)/holdings/buffett', destination: '/:locale/live-13f/berkshire', permanent: true },
      { source: '/:locale(zh|ja|ko)/holdings/li-lu', destination: '/:locale/live-13f/himalaya', permanent: true },
    ];
  },
};

export default nextConfig;
