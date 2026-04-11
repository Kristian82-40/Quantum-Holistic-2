/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
