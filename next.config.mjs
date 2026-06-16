/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Externalize packages to avoid bundling issues in serverless
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'playwright-core',
        '@sparticuz/chromium',
        'playwright',
        'pdfjs-dist',
      ];
    }
    return config;
  },
};

export default nextConfig;
