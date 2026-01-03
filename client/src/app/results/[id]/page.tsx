
"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setIsNavigating } from "@/lib/features/videoSlice";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import TopicExtraction from "@/components/TopicExtraction";
import PredictiveInsights from "@/components/PredictiveInsights";
import EarningsDisplay from "@/components/EarningsDisplay";
import StatsDisplay from "@/components/StatsDisplay";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconButton } from "@mui/material";
import { Download } from "@mui/icons-material";
import { useVideoDownload } from "@/lib/downloadHooks";
import { fetchVideoStatsIfNeeded } from "@/lib/features/DownloadActions";
import VideoDownloadDialog from "@/components/downloadDialogBox";

export default function ResultsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { videoId, stats, statsLoading, error, url } = useAppSelector((state) => state.video);

  const fetchedVideoIdRef = useRef<string | null>(null);

  // Reconstruct URL from videoId if url is missing (e.g., on page reload)
  const videoUrl = url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);

  // Use the download hook
  const {
    open,
    filteredFormats,
    filteredQualities,
    filteredBitrates,
    selectedFormat,
    selectedQuality,
    selectedBitrate,
    selectedFormatId,
    loadingExts,
    downloading,
    downloadError,
    setSelectedFormat,
    setSelectedQuality,
    setSelectedBitrate,
    handleOpenDownload,
    handleDownload,
    handleCloseDialog,
    progress,
    progressStage,
  } = useVideoDownload({ videoUrl, videoTitle: stats?.title });

  const handleBack = () => {
    dispatch(setIsNavigating(true));
  };

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchVideoStatsIfNeeded({
        dispatch,
        id,
        videoId,
        stats,
        statsLoading,
        fetchedVideoIdRef,
      });
    }
  }, [id, videoId, stats, statsLoading, dispatch]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f0f0f] dark:via-[#181818] dark:to-[#0f0f0f] py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12"
        >
          <Link
            href="/"
            onClick={handleBack}
            className="group relative flex items-center gap-4 px-6 py-3 bg-white/40 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-2xl transition-all duration-1000 shadow-sm hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-linear-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 group-hover:bg-red-600 group-hover:text-white group-hover:rotate-[-10deg] transition-all duration-500 shadow-inner">
              <i className="fa-solid fa-arrow-left text-sm transition-transform duration-500 group-hover:-translate-x-1.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-0.5 group-hover:text-red-500/70 transition-colors duration-300">
                Navigation
              </span>
              <span className="text-sm font-black text-gray-700 dark:text-zinc-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 uppercase tracking-widest">
                Back to Search
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end px-6 border-r-2 border-gray-200/50 dark:border-white/10">
              <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-1">Matrix Node</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[11px] font-mono font-bold text-gray-600 dark:text-zinc-400 tracking-tighter">{id}</span>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-rose-600 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500 group-hover:duration-200 animate-pulse" />
              <IconButton
                aria-label="Download video"
                onClick={handleOpenDownload}
                className="relative w-14 h-14 bg-red-600! hover:bg-red-700! hover:scale-110 active:scale-90 text-white! rounded-2xl! shadow-2xl shadow-red-600/40 transition-all duration-1000 border border-white/20"
              >
                <Download sx={{ fontSize: 26 }} className="group-hover:animate-bounce" />
              </IconButton>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
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
            <EarningsDisplay />
            <VideoDownloadDialog
              open={open}
              filteredFormats={filteredFormats}
              filteredQualities={filteredQualities}
              filteredBitrates={filteredBitrates}
              selectedFormat={selectedFormat}
              selectedQuality={selectedQuality}
              selectedBitrate={selectedBitrate}
              selectedFormatId={selectedFormatId}
              loadingExts={loadingExts}
              downloading={downloading}
              downloadError={downloadError}
              onClose={handleCloseDialog}
              onFormatChange={setSelectedFormat}
              onQualityChange={setSelectedQuality}
              onBitrateChange={setSelectedBitrate}
              onDownload={handleDownload}
              progress={progress}
              progressStage={progressStage}
            />
          </>
        )}
      </div>
    </div>
  );
}
