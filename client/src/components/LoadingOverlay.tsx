'use client'

import { useAppSelector } from '@/lib/hooks'
import { Youtube } from 'lucide-react'

export default function LoadingOverlay() {
    const { statsLoading, sentimentLoading, predictionLoading } = useAppSelector((state) => state.video)

    // Show overlay if any major loading is happening
    // Note: We might want to be more specific later, but for now we'll show it for all
    const isLoading = statsLoading || sentimentLoading || predictionLoading

    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-gray-950/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6 p-12 rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 scale-95 animate-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative bg-blue-600 p-5 rounded-2xl animate-bounce">
                        <Youtube className="h-10 w-10 text-white" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Analyzing YouTube Data
                    </h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                        Please wait a moment...
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    )
}
