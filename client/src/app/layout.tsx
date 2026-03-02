import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import LoadingOverlay from "@/components/LoadingOverlay";
import Footer from "@/components/Footer";
import FontAwesomeLoader from "@/components/FontAwesomeLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "YouTube Stats Analyzer | AI-Powered Video Analytics & Sentiment",
    template: "%s | YouTube Stats Analyzer",
  },
  description:
    "Analyze YouTube video statistics, audience sentiment, and engagement metrics using advanced AI and machine learning. Get predictive insights, topic extraction, and earnings estimates.",
  keywords: [
    "YouTube analytics",
    "video statistics",
    "sentiment analysis",
    "AI video analysis",
    "YouTube engagement metrics",
    "predictive insights",
    "audience sentiment",
    "YouTube earnings estimator",
    "video performance analytics",
    "machine learning",
  ],
  applicationName: "YouTube Stats Analyzer",
  authors: [{ name: "YouTube Analytics Suite" }],
  creator: "YouTube Analytics Suite",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "YouTube Stats Analyzer",
    title: "YouTube Stats Analyzer | AI-Powered Video Analytics & Sentiment",
    description:
      "Analyze YouTube video statistics, audience sentiment, and engagement metrics using advanced AI and machine learning.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Stats Analyzer | AI-Powered Video Analytics & Sentiment",
    description:
      "Analyze YouTube video statistics, audience sentiment, and engagement metrics using advanced AI and machine learning.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head suppressHydrationWarning>
        <link
          rel="preconnect"
          href="https://cdnjs.cloudflare.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased min-h-screen transition-colors duration-300 text-foreground bg-background`}
      >
        <Providers>
          <FontAwesomeLoader />
          <Navbar />
          <LoadingOverlay />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}