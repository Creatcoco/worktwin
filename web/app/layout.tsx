import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { ProductDataProvider } from "@/lib/product-data";
import ProductDataBoundary from "@/components/ProductDataBoundary";
import GuestModeBanner from "@/components/GuestModeBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkTwin · 你下班，你的分身继续上班",
  description:
    "把你的专业技能镜像成可雇佣、可派单、可结算的工作分身。让分身 7×24 在岗接单，你只管做更有价值的事。",
  metadataBase: new URL("https://worktwin.cn"),
  openGraph: {
    title: "WorkTwin · 你下班，你的分身继续上班",
    description:
      "把技能变成资产，让工作分身替你接单、交付、结算。",
    url: "https://worktwin.cn",
    siteName: "WorkTwin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkTwin · 你下班，你的分身继续上班",
    description:
      "把技能变成资产，让工作分身替你接单、交付、结算。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <ProductDataProvider>
              <Nav />
              <GuestModeBanner />
              <main className="flex-1"><ProductDataBoundary>{children}</ProductDataBoundary></main>
              <Footer />
            </ProductDataProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
