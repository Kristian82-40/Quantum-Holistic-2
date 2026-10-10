/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // El artículo de Bristol se retiró el 10-oct-2026: los enlaces antiguos van al blog
  async redirects() {
    return [
      { source: '/blog/km0-bristol-guia', destination: '/blog/', permanent: false },
    ];
  },
};

module.exports = nextConfig;
