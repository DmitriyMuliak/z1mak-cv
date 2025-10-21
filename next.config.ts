import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // reactStrictMode: false, // Turn off double render. Sometimes need for check correct work in dev mode especially for animations.
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
