/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle optional Solana dependencies that may not be present
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@solana/kit': false,
      '@solana-program/system': false,
      '@solana-program/token': false,
    };
    return config;
  },
};

export default nextConfig;
