/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Handle pdfjs-dist canvas dependency (only needed for Node.js, not browser)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark canvas as external to avoid build errors
      // pdfjs-dist only uses canvas on Node.js, not in browser
      config.externals = [...(config.externals || []), "canvas"];
    }
    return config;
  },
};

export default nextConfig;
