
import { useState, useMemo, useEffect } from 'react';

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
  progress: number;
  progressStage: string;
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

  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [blockedFormatIds, setBlockedFormatIds] = useState<string[]>([]);

  // Clear cache if URL changes
  useEffect(() => {
    if (videoUrl !== cachedUrl) {
      setFormats([]);
      setAvailableOptions({ formats: [], qualities: [], bitrates: [] });
      setSelectedFormat("");
      setSelectedQuality("");
      setSelectedBitrate("");
      setCachedUrl(null);
      setBlockedFormatIds([]);
    }
  }, [videoUrl, cachedUrl]);

  const sanitizeFileName = (name: string) =>
    name.replace(/[\\/:*?"<>|]+/g, "").trim() || "video";

  // Apply blocked-format filter (formats that previously failed to download)
  const effectiveFormats = useMemo(
    () => formats.filter((f) => !blockedFormatIds.includes(f.format_id)),
    [formats, blockedFormatIds]
  );

  // Filter formats based on selected options
  const filteredFormats = useMemo(() => {
    let filtered = effectiveFormats;

    // Filter by quality if selected
    if (selectedQuality) {
      filtered = filtered.filter((f) => f.quality === selectedQuality);
    }

    // NOTE: We do NOT filter by bitrate here anymore. 
    // Bitrate is a leaf-node selection.

    const unique = Array.from(new Set(filtered.map((f) => f.ext).filter(Boolean)));
    return unique.sort((a, b) => {
      if (a === "mp4" && b !== "mp4") return -1;
      if (b === "mp4" && a !== "mp4") return 1;
      return a.localeCompare(b);
    });
  }, [effectiveFormats, selectedQuality]);

  // Filter qualities based on selected options
  const filteredQualities = useMemo(() => {
    let filtered = effectiveFormats;

    // Filter by format if selected
    if (selectedFormat) {
      filtered = filtered.filter((f) => f.ext === selectedFormat);
    }

    // NOTE: We do NOT filter by bitrate here anymore.

    const unique = Array.from(new Set(filtered.map((f) => f.quality).filter((q): q is string => q !== undefined)));
    return unique.sort((a, b) => {
      const numA = parseInt(a.replace('p', '') || '0');
      const numB = parseInt(b.replace('p', '') || '0');
      return numB - numA; // Sort descending
    });
  }, [effectiveFormats, selectedFormat]);

  // Filter bitrates based on selected options
  const filteredBitrates = useMemo(() => {
    let filtered = effectiveFormats;

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
  }, [effectiveFormats, selectedFormat, selectedQuality]);

  // Find the selected format_id based on current selections
  const selectedFormatId = useMemo(() => {
    if (!selectedFormat && !selectedQuality && !selectedBitrate) {
      // If nothing is selected, return the first available format_id
      return effectiveFormats.length > 0 ? effectiveFormats[0].format_id : null;
    }

    let filtered = effectiveFormats;

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
  }, [effectiveFormats, selectedFormat, selectedQuality, selectedBitrate]);

  const handleOpenDownload = async () => {
    if (!videoUrl) return;
    setOpen(true);
    setDownloadError(null);

    // If we already have formats for this URL, don't fetch again
    if (videoUrl === cachedUrl && formats.length > 0) {
      return;
    }

    setLoadingExts(true);
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

      // --- Compute smarter defaults that are internally consistent ---
      // 1) Default format: prefer mp4 if available
      const defaultFormat =
        options.formats.find((f) => f === "mp4") || options.formats[0] || "";

      // 2) Default quality: highest quality that exists for the default format
      let defaultQuality = "";
      if (defaultFormat) {
        const qualitiesForFormat = Array.from(
          new Set(
            formatsData
              .filter((f) => f.ext === defaultFormat && f.quality)
              .map((f) => f.quality as string)
          )
        ).sort((a, b) => {
          const numA = parseInt(a.replace("p", "") || "0");
          const numB = parseInt(b.replace("p", "") || "0");
          return numB - numA;
        });
        defaultQuality = qualitiesForFormat[0] || "";
      }
      // Fallback to first global quality if nothing was found
      if (!defaultQuality && options.qualities.length > 0) {
        defaultQuality = options.qualities[0];
      }

      // 3) Default bitrate: highest bitrate that exists for the chosen format + quality
      let defaultBitrate = "";
      if (defaultFormat && defaultQuality) {
        const bitratesForCombo = Array.from(
          new Set(
            formatsData
              .filter(
                (f) =>
                  f.ext === defaultFormat &&
                  f.quality === defaultQuality &&
                  typeof f.bitrate === "number"
              )
              .map((f) => f.bitrate as number)
          )
        )
          .sort((a, b) => b - a)
          .map(formatBitrate)
          .filter((b): b is string => b !== undefined);
        defaultBitrate = bitratesForCombo[0] || "";
      }

      // Apply the computed defaults
      setSelectedFormat(defaultFormat);
      setSelectedQuality(defaultQuality);
      setSelectedBitrate(defaultBitrate);

      setCachedUrl(videoUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Network error";
      setDownloadError(msg);
      setFormats([]);
      setAvailableOptions({ formats: [], qualities: [], bitrates: [] });
    } finally {
      setLoadingExts(false);
    }
  };

  // Helper function to compute filtered qualities based on format 
  const computeFilteredQualities = (format?: string) => {
    let filtered = effectiveFormats;
    if (format) filtered = filtered.filter((f) => f.ext === format);
    const unique = Array.from(new Set(filtered.map((f) => f.quality).filter((q): q is string => q !== undefined)));
    return unique.sort((a, b) => {
      const numA = parseInt(a.replace('p', '') || '0');
      const numB = parseInt(b.replace('p', '') || '0');
      return numB - numA;
    });
  };


  // Helper function to compute filtered bitrates based on format and quality
  const computeFilteredBitrates = (format?: string, quality?: string) => {
    let filtered = effectiveFormats;
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

    // Set first available quality for this format
    const availableQualities = computeFilteredQualities(format);
    setSelectedQuality(availableQualities[0] || "");

    // Set first available bitrate for this format + quality
    const availableBitrates = computeFilteredBitrates(format, availableQualities[0]);
    setSelectedBitrate(availableBitrates[0] || "");
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);

    // Check if current Format is valid for new Quality
    const validFormatsForQuality = formats
      .filter(f => f.quality === quality)
      .map(f => f.ext)
      .filter(Boolean);

    if (selectedFormat && !validFormatsForQuality.includes(selectedFormat)) {
      if (validFormatsForQuality.includes('mp4')) setSelectedFormat('mp4');
      else setSelectedFormat(validFormatsForQuality[0] || "");
    }

    // Set first available bitrate for this quality
    const availableBitrates = computeFilteredBitrates(selectedFormat, quality);
    setSelectedBitrate(availableBitrates[0] || "");
  };

  const handleBitrateChange = (bitrate: string) => {
    setSelectedBitrate(bitrate);

    // Find a match that has this bitrate
    // PRIORITIZE matches that keep the current Format and Quality
    const exactMatch = effectiveFormats.find(f =>
      bitrateMatches(f.bitrate, bitrate) &&
      f.ext === selectedFormat &&
      f.quality === selectedQuality
    );

    if (exactMatch) {
      // Best case: We found the bitrate in the current configuration. Do nothing else.
      return;
    }

    // Second priority: Keep the format, but allow quality to change
    const formatMatch = effectiveFormats.find(f =>
      bitrateMatches(f.bitrate, bitrate) &&
      f.ext === selectedFormat
    );

    if (formatMatch) {
      if (formatMatch.quality && formatMatch.quality !== selectedQuality) {
        setSelectedQuality(formatMatch.quality);
      }
      return;
    }

    // Third priority: Allow format to change (only if bitrate doesn't exist in current format)
    const anyMatch = effectiveFormats.find(f => bitrateMatches(f.bitrate, bitrate));
    if (anyMatch) {
      if (anyMatch.ext && anyMatch.ext !== selectedFormat) {
        setSelectedFormat(anyMatch.ext);
      }
      if (anyMatch.quality && anyMatch.quality !== selectedQuality) {
        setSelectedQuality(anyMatch.quality);
      }
    }
  };

  const handleDownload = async () => {
    if (!videoUrl || !selectedFormatId) return;
    setDownloading(true);
    setDownloadError(null);
    setProgress(0);
    setProgressStage('Initializing...');

    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

      // 1. Initiate Download Job
      setProgressStage('Requesting download job...');
      const initRes = await fetch(`${serverUrl}/api/download/init`, {
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

      if (!initRes.ok) {
        const errData = await initRes.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to start download");
      }

      const { jobId } = await initRes.json();
      setProgressStage('Waiting in queue...');

      // 2. Poll for status
      let jobStatus = 'pending';
      let attempts = 0;

      while (jobStatus !== 'completed' && jobStatus !== 'failed' && attempts < 600) { // Timeout after ~10 mins
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 800)); // Poll every 800ms

        const statusRes = await fetch(`${serverUrl}/api/download/status/${jobId}`);
        if (!statusRes.ok) continue; // Skip failed poll, try again

        const statusData = await statusRes.json();
        const job = statusData.job;

        if (job) {
          jobStatus = job.status;
          setProgress(job.progress);
          setProgressStage(job.stage);

          if (job.status === 'failed') {
            throw new Error(job.error || 'Download failed on server');
          }

          if (job.status === 'completed') {
            // 3. Download File
            setProgressStage('Downloading file to device...');
            const fileRes = await fetch(`${serverUrl}/api/download/file/${jobId}`);
            if (!fileRes.ok) throw new Error("File download failed");

            const blob = await fileRes.blob();
            const dlUrl = window.URL.createObjectURL(blob);
            const filename = job.filename || (videoTitle ? `${sanitizeFileName(videoTitle)}.${selectedFormat || 'mp4'}` : `video.${selectedFormat || 'mp4'}`);

            const a = document.createElement("a");
            a.href = dlUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(dlUrl);

            setOpen(false);
          }
        }
      }

      if (jobStatus !== 'completed') {
        throw new Error("Download timed out");
      }

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Network error";
      setDownloadError(msg);

      // If backend reports a specific format that failed, blacklist it for this session
      const m = msg.match(/Failed to download format\s+(\d+)/i);
      if (m && m[1]) {
        const badId = m[1];
        setBlockedFormatIds((prev) =>
          prev.includes(badId) ? prev : [...prev, badId]
        );
      }
    } finally {
      setDownloading(false);
      setProgress(0);
      setProgressStage('');
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    // Also reset progress
    setDownloading(false);
    setProgress(0);
    setProgressStage('');
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
    progress,
    progressStage,
    setSelectedFormat: handleFormatChange,
    setSelectedQuality: handleQualityChange,
    setSelectedBitrate: handleBitrateChange,
    handleOpenDownload,
    handleDownload,
    handleCloseDialog,
  };
}