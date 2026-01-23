import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Next.js 16 Turbopack 설정
  turbopack: {
    // 프로젝트 루트 디렉토리 (front 디렉토리) - 절대 경로 필요
    root: __dirname,
  },
};

export default nextConfig;
