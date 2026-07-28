/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/admin",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/admin",
        basePath: false,
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
