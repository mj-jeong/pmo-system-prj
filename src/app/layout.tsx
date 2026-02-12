import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PMO System - Project & Workforce Management",
    template: "%s | PMO System",
  },
  description:
    "Multi-tenant project management and workforce tracking system. Manage projects, track attendance, and coordinate your team in one place.",
  keywords: [
    "project management",
    "workforce management",
    "attendance tracking",
    "team management",
    "PMO",
  ],
  authors: [{ name: "PMO System" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PMO System",
    title: "PMO System - Project & Workforce Management",
    description:
      "Multi-tenant project management and workforce tracking system. Manage projects, track attendance, and coordinate your team in one place.",
  },
  robots: {
    index: false, // SaaS app - no public indexing of authenticated pages
    follow: false,
  },
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
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
