"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchVideoStats,
  setIsNavigating,
} from "@/lib/features/videoSlice";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import TopicExtraction from "@/components/TopicExtraction";
import PredictiveInsights from "@/components/PredictiveInsights";
import StatsDisplay from "@/components/StatsDisplay";
import Link from "next/link";

export default function ResultsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { videoId, stats, error } = useAppSelector((state) => state.video);

  // Track if this is initial mount (page reload) vs navigation
  const isInitialMount = useRef(true);
  const fetchedVideoIdRef = useRef<string | null>(null);

  const handleBack = () => {
    // Set navigating state to show loading overlay during navigation
    // The home page will reset the state when it mounts
    dispatch(setIsNavigating(true));
  };

  useEffect(() => {
    if (id && typeof id === "string") {
      // Split only from the last '-' to get the video ID
      const lastDashIndex = id.lastIndexOf("-");
      const actualVideoId = lastDashIndex !== -1 ? id.substring(0, lastDashIndex) : id;
      const alreadyFetched = fetchedVideoIdRef.current === actualVideoId;
      const hasStats = stats && videoId === actualVideoId;

      // Only fetch if:
      // 1. This is initial mount (page reload) AND
      // 2. We don't have stats AND
      // 3. We haven't already fetched this video ID
      if (isInitialMount.current && !hasStats && !alreadyFetched) {
        fetchedVideoIdRef.current = actualVideoId;
        dispatch(fetchVideoStats({ videoId: actualVideoId })).catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Error fetching video stats:", error);
          }
        });
      }

      // Mark as no longer initial mount after first render
      isInitialMount.current = false;
    }
  }, [id, videoId, stats, dispatch]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f0f0f] dark:via-[#181818] dark:to-[#0f0f0f] py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 font-semibold group"
          onMouseEnter={(e) => {
            const icon = e.currentTarget.querySelector('i');
            if (icon) {
              (icon as HTMLElement).style.transform = 'translateX(-8px)';
            }
          }}
          onMouseLeave={(e) => {
            const icon = e.currentTarget.querySelector('i');
            if (icon) {
              (icon as HTMLElement).style.transform = 'translateX(0)';
            }
          }}
        >
          <i
            className="fa-solid fa-arrow-left"
            style={{
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'inline-block',
              transform: 'translateX(0)'
            }}
          ></i>
          <span>Back to Search</span>
        </Link>
        <div className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-[#181818]/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-800/50">
          ID: {id}
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Analysis Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
              {error}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Try Another URL
            </Link>
          </div>
        </div>
      )}

      {!error && stats && (
        <>
          <StatsDisplay />
          <SentimentAnalysis />
          <TopicExtraction />
          <PredictiveInsights />
        </>
      )}
    </div>
  );
}