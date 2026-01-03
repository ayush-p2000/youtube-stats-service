/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
        ],
      },
    ];
  },
  async rewrites() {
    const server = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!server) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${server}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
