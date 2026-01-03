"use client";

import { useEffect, useRef, useState } from "react";
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
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, CircularProgress, IconButton, Chip } from "@mui/material";
import { Download } from "@mui/icons-material";

export default function ResultsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { videoId, stats, statsLoading, error, url } = useAppSelector((state) => state.video);

  const fetchedVideoIdRef = useRef<string | null>(null);
  
  // Reconstruct URL from videoId if url is missing (e.g., on page reload)
  const videoUrl = url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);
  const [open, setOpen] = useState(false);
  const [exts, setExts] = useState<string[]>([]);
  const [selectedExt, setSelectedExt] = useState<string>("mp4");
  const [loadingExts, setLoadingExts] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleBack = () => {
    dispatch(setIsNavigating(true));
  };

  const sanitizeFileName = (name: string) =>
    name.replace(/[\\/:*?"<>|]+/g, "").trim() || "video";

  const handleOpenDownload = async () => {
    if (!videoUrl) return;
    setOpen(true);
    setLoadingExts(true);
    setDownloadError(null);
    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${serverUrl}/api/formats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch formats");
      }
      const availableExts: string[] = Array.isArray(data.exts) ? data.exts : [];
      const unique = Array.from(new Set(availableExts.map((e) => String(e).toLowerCase())));
      const sorted = unique.sort((a, b) => {
        if (a === "mp4" && b !== "mp4") return -1;
        if (b === "mp4" && a !== "mp4") return 1;
        return a.localeCompare(b);
      });
      setExts(sorted);
      if (sorted.includes("mp4")) {
        setSelectedExt("mp4");
      } else if (sorted.length > 0) {
        setSelectedExt(sorted[0]);
      } else {
        setSelectedExt("mp4");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Network error";
      setDownloadError(msg);
      setExts([]);
    } finally {
      setLoadingExts(false);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl || !selectedExt) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${serverUrl}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl, format: selectedExt }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Download failed");
      }
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const filenameBase = stats?.title ? sanitizeFileName(stats.title) : "video";
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `${filenameBase}.${selectedExt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);
      setOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Network error";
      setDownloadError(msg);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (id && typeof id === "string") {
      const lastDashIndex = id.lastIndexOf("-");
      const actualVideoId = lastDashIndex !== -1 ? id.substring(0, lastDashIndex) : id;
      const alreadyFetched = fetchedVideoIdRef.current === actualVideoId;
      
      // Check if we already have stats for this video OR if it's currently loading
      const hasValidStats = stats && videoId === actualVideoId;
      const isLoadingStats = statsLoading && videoId === actualVideoId;

      // Only fetch if:
      // 1. We don't have valid stats AND
      // 2. It's not currently loading AND
      // 3. We haven't already fetched this ID
      if (!hasValidStats && !isLoadingStats && !alreadyFetched) {
        fetchedVideoIdRef.current = actualVideoId;
        dispatch(fetchVideoStats({ videoId: actualVideoId })).catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Error fetching video stats:", error);
          }
        });
      }
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
            className="!bg-red-600 hover:!bg-red-700 !text-white !rounded-lg"
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
          <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
            <DialogTitle>Select format</DialogTitle>
            <DialogContent>
              {loadingExts ? (
                <div className="flex items-center gap-3 py-3">
                  <CircularProgress size={20} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Loading available formats...</span>
                </div>
              ) : exts.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  No downloadable formats found for this video. Try again later.
                </p>
              ) : (
                <RadioGroup
                  value={selectedExt}
                  onChange={(e) => setSelectedExt((e.target as HTMLInputElement).value)}
                >
                  {exts.map((ext) => (
                    <FormControlLabel
                      key={ext}
                      value={ext}
                      control={<Radio />}
                      label={
                        <span className="inline-flex items-center gap-2">
                          <span>{ext.toUpperCase()}</span>
                          {ext === "mp4" && <Chip label="Recommended" size="small" color="success" />}
                        </span>
                      }
                    />
                  ))}
                </RadioGroup>
              )}
              {downloadError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{downloadError}</p>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)} disabled={downloading}>Cancel</Button>
              <Button
                onClick={handleDownload}
                disabled={downloading || loadingExts || exts.length === 0}
                variant="contained"
                color="primary"
              >
                {downloading ? <CircularProgress size={20} /> : "Download"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
}