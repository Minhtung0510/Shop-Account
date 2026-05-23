import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers configuration
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https: blob:",
              "connect-src 'self' https://www.googleapis.com https://oauth2.googleapis.com https://accounts.google.com",
              "frame-src 'self' https://www.google.com https://accounts.google.com",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },

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
