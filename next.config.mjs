/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure Vercel serverless functions bundle the SQLite database file
  outputFileTracingIncludes: {
    "/api/**/*": ["./prisma/**/*"],
  },
};

export default nextConfig;
