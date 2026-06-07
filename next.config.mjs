/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.1.14'],
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
