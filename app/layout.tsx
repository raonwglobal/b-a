import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "b/a - 베트남 사업 실행 플랫폼",
  description: "베트남 진출의 모든 과정을 하나의 파트너와 함께. 법인설립, 거래·M&A, 산업별 현지화, 보안·준법, 현지 운영 통합 지원",
  keywords: ["베트남 진출", "베트남 법인설립", "베트남 M&A", "b/a", "베트남 사업"],
  openGraph: {
    title: "b/a - 베트남 사업 실행 플랫폼",
    description: "베트남 진출의 모든 과정을 하나의 파트너와 함께",
    type: "website",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
