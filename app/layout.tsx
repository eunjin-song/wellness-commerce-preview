import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ComingSoon from "@/components/ComingSoon";
import { isComingSoon } from "@/lib/site";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ooro. — 프리미엄 웰니스",
  description: "하루의 리듬을 되찾는 웰니스 브랜드 ooro. 미리보기",
  openGraph: {
    title: "ooro.",
    description: "하루의 리듬을 되찾는 웰니스 브랜드",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1eee6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${cormorant.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col bg-cream text-brown">
        {isComingSoon ? (
          <ComingSoon />
        ) : (
          <>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
