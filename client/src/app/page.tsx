import type { Metadata } from "next";
import UrlInput from "@/components/UrlInput";
import JsonLd from "@/components/JsonLd";
import Analytics from '@mui/icons-material/Analytics';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Psychology from '@mui/icons-material/Psychology';

export const metadata: Metadata = {
  title: "Analyze Any YouTube Video | AI-Powered Stats & Sentiment",
  description:
    "Get deep sentiment analysis, predictive insights, and comprehensive analytics for any YouTube video. Powered by AI and machine learning.",
  openGraph: {
    title: "Analyze Any YouTube Video | AI-Powered Stats & Sentiment",
    description:
      "Get deep sentiment analysis, predictive insights, and comprehensive analytics for any YouTube video.",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "YouTube Stats Analyzer",
  description:
    "Analyze YouTube video statistics, audience sentiment, and engagement metrics using advanced AI and machine learning.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Real-time YouTube video analytics",
    "AI-powered sentiment analysis",
    "Predictive performance insights",
    "Topic extraction",
    "Earnings estimation",
    "Video download",
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={jsonLdData} />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-4 sm:p-8 pb-20 gap-10 sm:gap-16 transition-all duration-500">
        <section className="flex flex-col gap-8 sm:gap-12 items-center w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 mb-2 sm:mb-4">
              <Analytics className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
              <span className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">Professional Analytics Platform</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
              Analyze Any{' '}
              <span className="bg-linear-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                YouTube Video
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Deep sentiment analysis, predictive insights, and comprehensive analytics powered by AI and machine learning.
            </p>
          </div>

          <UrlInput />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-4">
            <article className="group p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-red-300 dark:hover:border-red-800/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Real-time Analytics</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Get instant insights into views, likes, comments, and engagement metrics.
              </p>
            </article>

            <article className="group p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-800/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Psychology className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white">AI Sentiment</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Advanced emotion detection and sentiment analysis from audience comments.
              </p>
            </article>

            <article className="group p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-800/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Analytics className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Predictive Insights</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Forecast future performance with ML-powered predictive analytics.
              </p>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}

