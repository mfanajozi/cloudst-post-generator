import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SineThamsanqa Business Solutions | AI Content Generator",
  description: "Create viral content for Pinterest, X, Threads, and LinkedIn with AI-powered variations. Perfect for affiliates and service providers.",
  keywords: ["content generator", "social media", "pinterest", "twitter", "threads", "linkedin", "ai", "marketing", "affiliate"],
  openGraph: {
    title: "SineThamsanqa Business Solutions Content Generator",
    description: "Create viral content for social media with AI-powered variations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📌</text></svg>" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
