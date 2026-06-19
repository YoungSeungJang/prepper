import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prepper",
  description: "저장한 레시피를 실제로 해먹게 만드는 웹앱",
  icons: {
    icon: "/prepper_favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
