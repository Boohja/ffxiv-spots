import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MainNavbar } from "@/components/layout/MainNavbar";
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
  title: "xivspots",
  description: "Learning-focused Next.js skeleton for Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        <MainNavbar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
