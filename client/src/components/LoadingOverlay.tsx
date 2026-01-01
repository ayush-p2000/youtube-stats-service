'use client'

import { useAppSelector } from '@/lib/hooks'
import { PlayArrow, Analytics } from '@mui/icons-material'

export default function LoadingOverlay() {
    const { statsLoading, sentimentLoading, predictionLoading, isNavigating } = useAppSelector((state) => state.video)

    // Show overlay if any major loading is happening or if navigating
    const isLoading = statsLoading || sentimentLoading || predictionLoading || isNavigating

    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-[#0f0f0f]/80 backdrop-blur-lg animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-8 p-10 sm:p-12 rounded-2xl bg-white dark:bg-[#181818] shadow-2xl border border-gray-200/50 dark:border-gray-800/50 scale-95 animate-in zoom-in duration-500 max-w-md mx-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-500/30 rounded-full blur-2xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-2xl shadow-xl">
                        <div className="relative">
                            <PlayArrow className="h-12 w-12 text-white" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-12 w-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <Analytics className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isNavigating ? 'Navigating...' : 'Analyzing YouTube Data'}
                        </h3>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {isNavigating ? 'Please wait while we load the page...' : 'Processing video analytics and sentiment data...'}
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    )
}
