/** @type {import('next').NextConfig} */
const nextConfig = {
  // https://github.com/vercel/next.js/discussions/41189#discussioncomment-4488386
  // webpack(config) {
  //   config.resolve.extensionAlias = {
  //     ".js": [".js", ".ts"],
  //     ".jsx": [".jsx", ".tsx"],
  //   };
  //   return config;
  // },
  output: 'standalone',
}

module.exports =
  process.env.ANALYZE === "true"
    ? require('@next/bundle-analyzer')()(nextConfig)
    : nextConfig;
