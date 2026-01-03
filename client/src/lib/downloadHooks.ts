
import { useState } from 'react';

interface UseVideoDownloadProps {
  videoUrl: string | null;
  videoTitle?: string;
}

interface UseVideoDownloadReturn {
  open: boolean;
  exts: string[];
  selectedExt: string;
  loadingExts: boolean;
  downloading: boolean;
  downloadError: string | null;
  setSelectedExt: (ext: string) => void;
  handleOpenDownload: () => Promise<void>;
  handleDownload: () => Promise<void>;
  handleCloseDialog: () => void;
}

export function useVideoDownload({ videoUrl, videoTitle }: UseVideoDownloadProps): UseVideoDownloadReturn {
  const [open, setOpen] = useState(false);
  const [exts, setExts] = useState<string[]>([]);
  const [selectedExt, setSelectedExt] = useState<string>("mp4");
  const [loadingExts, setLoadingExts] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

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
      const filenameBase = videoTitle ? sanitizeFileName(videoTitle) : "video";
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

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return {
    open,
    exts,
    selectedExt,
    loadingExts,
    downloading,
    downloadError,
    setSelectedExt,
    handleOpenDownload,
    handleDownload,
    handleCloseDialog,
  };
}