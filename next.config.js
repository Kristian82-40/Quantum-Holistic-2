/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Quantum-Holistic-2',
  assetPrefix: '/Quantum-Holistic-2/',
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
