import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "買取AI",
  description: "不動産買取再販向けAI物件マッチング通知ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
