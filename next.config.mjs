/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Externalize playwright-core and related packages to avoid bundling issues
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'playwright-core',
        '@sparticuz/chromium',
        'playwright',
      ];
    }
    return config;
  },
};

export default nextConfig;
