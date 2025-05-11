/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'res.cloudinary.com'], // For Google OAuth profile images and Cloudinary
  },
};

export default nextConfig; 