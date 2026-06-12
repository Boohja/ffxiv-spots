import type { Metadata } from "next";
import { Exo_2, Space_Grotesk } from "next/font/google";
import { MainFooter } from "@/components/layout/MainFooter";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { buildDefaultMetadata } from "@/lib/metadata";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo-2",
  subsets: ["latin"],
});

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${exo2.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface-page text-text-primary">
        <MainNavbar />
        <div className="flex-1">{children}</div>
        <MainFooter />
      </body>
    </html>
  );
}
