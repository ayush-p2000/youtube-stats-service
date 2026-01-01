import UrlInput from "@/components/UrlInput";
import { Analytics, TrendingUp, Psychology } from '@mui/icons-material';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-6 sm:p-8 pb-20 gap-12 sm:gap-16 bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0f0f0f] dark:via-[#181818] dark:to-[#0f0f0f] transition-all duration-500">
      <main className="flex flex-col gap-10 sm:gap-12 items-center w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 mb-4">
            <Analytics className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">Professional Analytics Platform</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
            Analyze Any{' '}
            <span className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
              YouTube Video
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Deep sentiment analysis, predictive insights, and comprehensive analytics powered by AI and machine learning.
          </p>
        </div>

        <div className="w-full max-w-3xl">
          <UrlInput />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-4">
          <div className="group p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-red-300 dark:hover:border-red-800/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Real-time Analytics</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Get instant insights into views, likes, comments, and engagement metrics.
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-800/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Psychology className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Sentiment</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Advanced emotion detection and sentiment analysis from audience comments.
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-800/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Analytics className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Predictive Insights</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Forecast future performance with ML-powered predictive analytics.
            </p>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-6 flex gap-6 flex-wrap items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
          Powered by YouTube Data API & AI ML Models
        </p>
      </footer>
    </div>
  );
}
