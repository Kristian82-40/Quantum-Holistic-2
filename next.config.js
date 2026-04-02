/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Redirect .io domain to .com (set NEXT_PUBLIC_DOMAIN in Vercel env)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'quantumholistic.io' }],
        destination: 'https://quantumholistic.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.quantumholistic.io' }],
        destination: 'https://quantumholistic.com/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
