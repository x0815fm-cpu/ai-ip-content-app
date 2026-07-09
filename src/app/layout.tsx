import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小光内容工作台",
  description: "用选择题引导普通人生成第一条可发布内容文案。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
