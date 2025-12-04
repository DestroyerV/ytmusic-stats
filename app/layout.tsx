import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Navigation } from "@/components/Navigation";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube Music Stats",
  description:
    "Analyze your YouTube Music listening history and discover your music patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-black relative w-full">
            {/* Header - Floating above content */}
            <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
              <div className="pointer-events-auto">
                <Navigation />
              </div>
            </div>
            {/* Main Content - Full screen with beam background */}
            <main className="relative z-10 min-h-screen">
              {children}
              <Analytics />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
