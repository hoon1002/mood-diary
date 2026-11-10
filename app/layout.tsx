import type { Metadata } from "next";
import { Gaegu, Gowun_Dodum } from "next/font/google";
import "./globals.css";

// 손글씨 글꼴: 내가 쓴 내용(날짜 숫자, 메모)에 사용
const gaegu = Gaegu({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-gaegu",
  display: "swap",
});

// 인쇄 글꼴: 공책에 원래 인쇄돼 있는 글자(칸 이름, 버튼)에 사용
const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gowun",
  display: "swap",
});

export const metadata: Metadata = {
  title: "오늘의 기분 일기",
  description: "오늘 기분을 고르고 한 줄 메모를 남기는 작은 일기장",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${gaegu.variable} ${gowunDodum.variable}`}>
      <body>{children}</body>
    </html>
  );
}
