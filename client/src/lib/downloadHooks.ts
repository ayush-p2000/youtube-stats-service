
import { useState, useMemo } from 'react';

interface FormatOption {
  format_id: string;
  ext: string;
  resolution?: string;
  quality?: string;
  bitrate?: number;
  fps?: number;
  note?: string;
  filesize?: number;
  hasAudio: boolean;
}

interface AvailableOptions {
  formats: string[];
  qualities: string[];
  bitrates: string[];
}

interface UseVideoDownloadProps {
  videoUrl: string | null;
  videoTitle?: string;
}

interface UseVideoDownloadReturn {
  open: boolean;
  formats: FormatOption[];
  availableOptions: AvailableOptions;
  filteredFormats: string[];
  filteredQualities: string[];
  filteredBitrates: string[];
  selectedFormat: string;
  selectedQuality: string;
  selectedBitrate: string;
  selectedFormatId: string | null;
  loadingExts: boolean;
  downloading: boolean;
  downloadError: string | null;
  setSelectedFormat: (format: string) => void;
  setSelectedQuality: (quality: string) => void;
  setSelectedBitrate: (bitrate: string) => void;
  handleOpenDownload: () => Promise<void>;
  handleDownload: () => Promise<void>;
  handleCloseDialog: () => void;
}

const formatBitrate = (bitrate: number | undefined): string | undefined => {
  if (!bitrate) return undefined;
  if (bitrate >= 1000000) return `${(bitrate / 1000000).toFixed(1)} Mbps`;
  if (bitrate >= 1000) return `${(bitrate / 1000).toFixed(0)} kbps`;
  return `${bitrate} bps`;
};

// Parse bitrate string back to number for comparison (handles rounding)
const parseBitrate = (bitrateStr: string): number | null => {
  if (!bitrateStr) return null;
  if (bitrateStr.includes('Mbps')) {
    return Math.round(parseFloat(bitrateStr.replace(' Mbps', '')) * 1000000);
  }
  if (bitrateStr.includes('kbps')) {
    return Math.round(parseFloat(bitrateStr.replace(' kbps', '')) * 1000);
  }
  if (bitrateStr.includes('bps')) {
    return parseInt(bitrateStr.replace(' bps', ''));
  }
  return null;
};

// Compare bitrates with tolerance for rounding differences
// This handles cases where 377524 bps is formatted as "378 kbps" (rounded)
const bitrateMatches = (bitrate: number | undefined, targetBitrateStr: string): boolean => {
  if (!bitrate || !targetBitrateStr) return false;
  
  // Format the actual bitrate to see what it would display as
  const formattedBitrate = formatBitrate(bitrate);
  if (formattedBitrate === targetBitrateStr) {
    return true; // Exact match after formatting
  }
  
  // Also check with tolerance for rounding differences
  const targetBitrate = parseBitrate(targetBitrateStr);
  if (targetBitrate === null) return false;
  
  // Allow 5% tolerance or at least 2kbps for rounding differences
  const tolerance = Math.max(2000, targetBitrate * 0.05);
  return Math.abs(bitrate - targetBitrate) <= tolerance;
};

export function useVideoDownload({ videoUrl, videoTitle }: UseVideoDownloadProps): UseVideoDownloadReturn {
  const [open, setOpen] = useState(false);
  const [formats, setFormats] = useState<FormatOption[]>([]);
  const [availableOptions, setAvailableOptions] = useState<AvailableOptions>({
    formats: [],
    qualities: [],
    bitrates: [],
  });
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedBitrate, setSelectedBitrate] = useState<string>("");
  const [loadingExts, setLoadingExts] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const sanitizeFileName = (name: string) =>
    name.replace(/[\\/:*?"<>|]+/g, "").trim() || "video";

  // Filter formats based on selected options
  const filteredFormats = useMemo(() => {
    let filtered = formats;
    
    // Filter by quality if selected
    if (selectedQuality) {
      filtered = filtered.filter((f) => f.quality === selectedQuality);
    }
    
    // Filter by bitrate if selected (with tolerance for rounding)
    if (selectedBitrate) {
      filtered = filtered.filter((f) => bitrateMatches(f.bitrate, selectedBitrate));
    }
    
    const unique = Array.from(new Set(filtered.map((f) => f.ext).filter(Boolean)));
    return unique.sort((a, b) => {
      if (a === "mp4" && b !== "mp4") return -1;
      if (b === "mp4" && a !== "mp4") return 1;
      return a.localeCompare(b);
    });
  }, [formats, selectedQuality, selectedBitrate]);

  // Filter qualities based on selected options
  const filteredQualities = useMemo(() => {
    let filtered = formats;
    
    // Filter by format if selected
    if (selectedFormat) {
      filtered = filtered.filter((f) => f.ext === selectedFormat);
    }
    
    // Filter by bitrate if selected (with tolerance for rounding)
    if (selectedBitrate) {
      filtered = filtered.filter((f) => bitrateMatches(f.bitrate, selectedBitrate));
    }
    
    const unique = Array.from(new Set(filtered.map((f) => f.quality).filter(Boolean)));
    return unique.sort((a, b) => {
      const numA = parseInt(a?.replace('p', '') || '0');
      const numB = parseInt(b?.replace('p', '') || '0');
      return numB - numA; // Sort descending
    });
  }, [formats, selectedFormat, selectedBitrate]);

  // Filter bitrates based on selected options
  const filteredBitrates = useMemo(() => {
    let filtered = formats;
    
    // Filter by format if selected
    if (selectedFormat) {
      filtered = filtered.filter((f) => f.ext === selectedFormat);
    }
    
    // Filter by quality if selected
    if (selectedQuality) {
      filtered = filtered.filter((f) => f.quality === selectedQuality);
    }
    
    const unique = Array.from(new Set(filtered.map((f) => f.bitrate).filter((b): b is number => b !== undefined)))
      .sort((a, b) => b - a)
      .map(formatBitrate)
      .filter((b): b is string => b !== undefined);
    
    return unique;
  }, [formats, selectedFormat, selectedQuality]);

  // Find the selected format_id based on current selections
  const selectedFormatId = useMemo(() => {
    if (!selectedFormat && !selectedQuality && !selectedBitrate) {
      // If nothing is selected, return the first available format_id
      return formats.length > 0 ? formats[0].format_id : null;
    }
    
    let filtered = formats;
    
    if (selectedFormat) {
      filtered = filtered.filter((f) => f.ext === selectedFormat);
    }
    if (selectedQuality) {
      filtered = filtered.filter((f) => f.quality === selectedQuality);
    }
    if (selectedBitrate) {
      filtered = filtered.filter((f) => bitrateMatches(f.bitrate, selectedBitrate));
    }
    
    // If we have multiple matches, prefer formats with audio, then highest bitrate
    if (filtered.length > 1) {
      filtered = filtered.sort((a, b) => {
        // Prefer formats with audio
        if (a.hasAudio && !b.hasAudio) return -1;
        if (!a.hasAudio && b.hasAudio) return 1;
        // Then prefer higher bitrate
        const bitrateA = a.bitrate || 0;
        const bitrateB = b.bitrate || 0;
        return bitrateB - bitrateA;
      });
    }
    
    // Return the first matching format_id, or null if no match
    const selectedId = filtered.length > 0 ? filtered[0].format_id : null;
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development' && selectedId) {
      console.log('Selected format:', {
        format_id: selectedId,
        ext: filtered[0].ext,
        quality: filtered[0].quality,
        bitrate: formatBitrate(filtered[0].bitrate),
        hasAudio: filtered[0].hasAudio,
      });
    }
    
    return selectedId;
  }, [formats, selectedFormat, selectedQuality, selectedBitrate]);

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
      
      const formatsData: FormatOption[] = Array.isArray(data.formats) ? data.formats : [];
      const options: AvailableOptions = data.availableOptions || {
        formats: [],
        qualities: [],
        bitrates: [],
      };
      
      setFormats(formatsData);
      setAvailableOptions(options);
      
      // Set default selections
      if (options.formats.length > 0) {
        const defaultFormat = options.formats.find((f) => f === "mp4") || options.formats[0];
        setSelectedFormat(defaultFormat);
      }
      if (options.qualities.length > 0) {
        setSelectedQuality(options.qualities[0]);
      }
      if (options.bitrates.length > 0) {
        setSelectedBitrate(options.bitrates[0]);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Network error";
      setDownloadError(msg);
      setFormats([]);
      setAvailableOptions({ formats: [], qualities: [], bitrates: [] });
    } finally {
      setLoadingExts(false);
    }
  };

  // Helper function to compute filtered qualities based on format and bitrate
  const computeFilteredQualities = (format?: string, bitrate?: string) => {
    let filtered = formats;
    if (format) filtered = filtered.filter((f) => f.ext === format);
    if (bitrate) filtered = filtered.filter((f) => bitrateMatches(f.bitrate, bitrate));
    const unique = Array.from(new Set(filtered.map((f) => f.quality).filter(Boolean)));
    return unique.sort((a, b) => {
      const numA = parseInt(a?.replace('p', '') || '0');
      const numB = parseInt(b?.replace('p', '') || '0');
      return numB - numA;
    });
  };

  // Helper function to compute filtered formats based on quality and bitrate
  const computeFilteredFormats = (quality?: string, bitrate?: string) => {
    let filtered = formats;
    if (quality) filtered = filtered.filter((f) => f.quality === quality);
    if (bitrate) filtered = filtered.filter((f) => bitrateMatches(f.bitrate, bitrate));
    const unique = Array.from(new Set(filtered.map((f) => f.ext).filter(Boolean)));
    return unique.sort((a, b) => {
      if (a === "mp4" && b !== "mp4") return -1;
      if (b === "mp4" && a !== "mp4") return 1;
      return a.localeCompare(b);
    });
  };

  // Helper function to compute filtered bitrates based on format and quality
  const computeFilteredBitrates = (format?: string, quality?: string) => {
    let filtered = formats;
    if (format) filtered = filtered.filter((f) => f.ext === format);
    if (quality) filtered = filtered.filter((f) => f.quality === quality);
    const unique = Array.from(new Set(filtered.map((f) => f.bitrate).filter((b): b is number => b !== undefined)))
      .sort((a, b) => b - a)
      .map(formatBitrate)
      .filter((b): b is string => b !== undefined);
    return unique;
  };

  // Reset dependent selections when parent selection changes
  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    // Compute what's available after this change
    const availableQualities = computeFilteredQualities(format, selectedBitrate || undefined);
    const availableBitrates = computeFilteredBitrates(format, selectedQuality || undefined);
    
    // Reset quality if no longer available
    if (selectedQuality && !availableQualities.includes(selectedQuality)) {
      setSelectedQuality(availableQualities[0] || "");
    }
    // Reset bitrate if no longer available
    if (selectedBitrate && !availableBitrates.includes(selectedBitrate)) {
      setSelectedBitrate(availableBitrates[0] || "");
    }
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    // Compute what's available after this change
    const availableFormats = computeFilteredFormats(quality, selectedBitrate || undefined);
    const availableBitrates = computeFilteredBitrates(selectedFormat || undefined, quality);
    
    // Reset format if no longer available
    if (selectedFormat && !availableFormats.includes(selectedFormat)) {
      setSelectedFormat(availableFormats[0] || "");
    }
    // Reset bitrate if no longer available
    if (selectedBitrate && !availableBitrates.includes(selectedBitrate)) {
      setSelectedBitrate(availableBitrates[0] || "");
    }
  };

  const handleBitrateChange = (bitrate: string) => {
    setSelectedBitrate(bitrate);
    // Compute what's available after this change
    const availableFormats = computeFilteredFormats(selectedQuality || undefined, bitrate);
    const availableQualities = computeFilteredQualities(selectedFormat || undefined, bitrate);
    
    // Reset format if no longer available
    if (selectedFormat && !availableFormats.includes(selectedFormat)) {
      setSelectedFormat(availableFormats[0] || "");
    }
    // Reset quality if no longer available
    if (selectedQuality && !availableQualities.includes(selectedQuality)) {
      setSelectedQuality(availableQualities[0] || "");
    }
  };

  const handleDownload = async () => {
    if (!videoUrl || !selectedFormatId) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${serverUrl}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: videoUrl, 
          format: selectedFormat || undefined,
          format_id: selectedFormatId,
          quality: selectedQuality || undefined,
          bitrate: selectedBitrate || undefined,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Download failed");
      }
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const filenameBase = videoTitle ? sanitizeFileName(videoTitle) : "video";
      const ext = selectedFormat || "mp4";
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `${filenameBase}.${ext}`;
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
    // Reset selections when closing
    setSelectedFormat("");
    setSelectedQuality("");
    setSelectedBitrate("");
  };

  return {
    open,
    formats,
    availableOptions,
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
    setSelectedFormat: handleFormatChange,
    setSelectedQuality: handleQualityChange,
    setSelectedBitrate: handleBitrateChange,
    handleOpenDownload,
    handleDownload,
    handleCloseDialog,
  };
}