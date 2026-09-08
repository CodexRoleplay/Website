/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["google-auth-library"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
