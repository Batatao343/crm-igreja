/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    // Optimize webpack configuration
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: '.next/cache',
      maxAge: 5184000000, // 60 days
      compression: 'gzip',
      // Reduce memory usage
      memoryCacheUnaffected: true,
      // Limit the size of the cache
      maxGenerations: 1,
    };

    // Optimize memory usage
    if (!isServer && dev) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      };
    }

    return config;
  },
  // Increase memory limit for the build process
  experimental: {
    workerThreads: true,
    cpus: Math.max(1, Math.min(4, require('os').cpus().length - 1)),
  },
};

export default nextConfig;