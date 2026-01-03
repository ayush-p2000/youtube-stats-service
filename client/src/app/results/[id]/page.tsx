
"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setIsNavigating } from "@/lib/features/videoSlice";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import TopicExtraction from "@/components/TopicExtraction";
import PredictiveInsights from "@/components/PredictiveInsights";
import StatsDisplay from "@/components/StatsDisplay";
import Link from "next/link";
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
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-[#181818]/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-800/50">
            ID: {id}
          </div>
          <IconButton
            aria-label="Download video"
            onClick={handleOpenDownload}
            color="primary"
            className="bg-red-600! hover:bg-red-700! text-white! rounded-lg!"
          >
            <Download />
          </IconButton>
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
          />
        </>
      )}
    </div>
  );
}
