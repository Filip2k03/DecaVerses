import type {NextConfig} from 'next';
import pwa from '@ducanh2912/next-pwa';

const withPWA = pwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default process.env.NODE_ENV === 'production' ? withPWA(nextConfig) : nextConfig;
