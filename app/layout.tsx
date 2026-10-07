import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HtmlLangScript } from "./_components/html-lang";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAA 2025",
  description: "Sun* Annual Awards 2025",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <HtmlLangScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
