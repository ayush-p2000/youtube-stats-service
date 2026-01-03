import { AppDispatch } from "@/lib/store";
import { fetchVideoStats } from "@/lib/features/videoSlice";

interface FetchVideoStatsIfNeededParams {
  dispatch: AppDispatch;
  id: string;
  videoId: string | null;
  stats: any;
  statsLoading: boolean;
  fetchedVideoIdRef: React.MutableRefObject<string | null>;
}

/**
 * Fetches video stats only if necessary (on page reload or when data is missing)
 * Prevents duplicate fetches when navigating from UrlInput page
 */
export async function fetchVideoStatsIfNeeded({
  dispatch,
  id,
  videoId,
  stats,
  statsLoading,
  fetchedVideoIdRef,
}: FetchVideoStatsIfNeededParams): Promise<void> {
  if (!id || typeof id !== "string") return;

  // Extract the actual video ID from the URL parameter
  const lastDashIndex = id.lastIndexOf("-");
  const actualVideoId = lastDashIndex !== -1 ? id.substring(0, lastDashIndex) : id;
  
  // Check if we've already attempted to fetch this video ID
  const alreadyFetched = fetchedVideoIdRef.current === actualVideoId;
  
  // Check if we already have valid stats for this video
  const hasValidStats = stats && videoId === actualVideoId;
  
  // Check if stats are currently being loaded for this video
  const isLoadingStats = statsLoading && videoId === actualVideoId;

  // Only fetch if:
  // 1. We don't have valid stats AND
  // 2. It's not currently loading AND
  // 3. We haven't already fetched this ID in this session
  if (!hasValidStats && !isLoadingStats && !alreadyFetched) {
    fetchedVideoIdRef.current = actualVideoId;
    
    try {
      await dispatch(fetchVideoStats({ videoId: actualVideoId })).unwrap();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching video stats:", error);
      }
      // Error is handled by the Redux slice and displayed in the UI
    }
  }
}