/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages = 정적 호스팅 + functions/ (SSR/next-on-pages 아님)
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // 빌드 산출물은 out/ 만 사용 (.next 를 배포 디렉터리로 쓰지 말 것)
}
module.exports = nextConfig
