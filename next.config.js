/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 정적 호스팅 전용.
  // OpenNext / @opennextjs/cloudflare / next-on-pages / Workers SSR 사용 안 함.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
}
module.exports = nextConfig
