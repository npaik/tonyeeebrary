/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "threads-clone-local-npaik.s3.ca-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "tonyeeebrary.s3.ca-central-1.amazonaws.com",
      },
    ],
  },
};

module.exports = nextConfig;
