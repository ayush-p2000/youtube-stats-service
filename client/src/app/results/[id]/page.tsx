'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchVideoStats, setIsNavigating, resetVideoState } from '@/lib/features/videoSlice';
import SentimentAnalysis from '@/components/SentimentAnalysis';
import TopicExtraction from '@/components/TopicExtraction';
import PredictiveInsights from '@/components/PredictiveInsights';
import StatsDisplay from '@/components/StatsDisplay';
import Link from 'next/link';

export default function ResultsPage() {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const { videoId, stats, error } = useAppSelector((state) => state.video);

    // Track which video we've already initiated a fetch for to prevent infinite loops
    const fetchedVideoIdRef = useRef<string | null>(null);

    const handleBack = () => {
        // Set navigating state to show loading overlay during navigation
        // The home page will reset the state when it mounts
        dispatch(setIsNavigating(true));
    };

    useEffect(() => {
        if (id && typeof id === 'string') {
            const actualVideoId = id.split('-')[0];

            // Only fetch if:
            // 1. We haven't already fetched/started fetching this video
            // 2. We don't already have stats for this exact video
            const alreadyFetched = fetchedVideoIdRef.current === actualVideoId;
            const alreadyHaveStats = stats && videoId === actualVideoId;

            if (!alreadyFetched && !alreadyHaveStats) {
                fetchedVideoIdRef.current = actualVideoId;
                dispatch(fetchVideoStats({ videoId: actualVideoId })).catch((error) => {
                    // Error is already handled by the slice
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error fetching video stats:', error);
                    }
                });
            }
        }
    }, [id, videoId, stats, dispatch]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-6xl mx-auto px-6 mb-8 flex items-center justify-between">
                <Link
                    href="/"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold"
                >
                    <i className="fa-solid fa-arrow-left"></i> Back to Search
                </Link>
                <div className="text-xs font-mono text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                    ID: {id}
                </div>
            </div>

            {error && (
                <div className="max-w-6xl mx-auto px-6 py-12 text-center">
                    <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold text-rose-600 mb-2">Analysis Failed</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                        <Link href="/" className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold">Try Another URL</Link>
                    </div>
                </div>
            )}

            {!error && (
                <>
                    <TopicExtraction />
                    <StatsDisplay />
                    <SentimentAnalysis />
                    <PredictiveInsights />
                </>
            )}
        </div>
    );
}
