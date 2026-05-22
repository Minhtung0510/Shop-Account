import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["frantic-wool-ranger.ngrok-free.dev", "frantic-woongrok-free.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.tenor.com",
      },
      {
        protocol: "https",
        hostname: "media1.tenor.com",
      },
      {
        protocol: "https",
        hostname: "media.tenor.com",
      },
      {
        protocol: "https",
        hostname: "**.giphy.com",
      },
      {
        protocol: "https",
        hostname: "media.giphy.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "**.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images-eds-ssl.xboxlive.com",
      },
      {
        protocol: "https",
        hostname: "**.xboxlive.com",
      },
      {
        protocol: "https",
        hostname: "pngimg.com",
      },
      {
        protocol: "https",
        hostname: "**.pngimg.com",
      },
      {
        protocol: "https",
        hostname: "platform.theverge.com",
      },
    ],
  },
};

export default nextConfig;
