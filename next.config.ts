import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: process.env.STORAGE_PORT || '64321',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: process.env.STORAGE_PORT || '64321',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'free-fall.cz',
        pathname: '/files/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
