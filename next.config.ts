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
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
