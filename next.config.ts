import { paths } from '@/consts/routes';
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // reactStrictMode: false, // Turn off double render. Sometimes need for check correct work in dev mode especially for animations.
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
  webpack: (config) => {
    // Required for Web Workers to function correctly in Next.js:
    // the default globalObject is 'window', which is not available inside a Worker.
    config.output.globalObject = 'self';
    return config;
  },
  async redirects() {
    return [
      {
        source: paths.root,
        destination: 'https://cvlens.net',
        permanent: true, // 308 permanent redirect
      },
      {
        source: paths.cvChecker,
        destination: 'https://cvlens.net/cv-checker',
        permanent: true, // 308 permanent redirect
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
