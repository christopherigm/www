import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  experimental: {
    swcPlugins: [
      [
        '@preact-signals/safe-react/swc',
        {
          // you should use `auto` mode to track only components which uses `.value` access.
          // Can be useful to avoid tracking of server side components
          mode: 'auto',
        } /* plugin options here */,
      ],
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
