'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setVideoUrl, parseVideoUrl, clearRedirectId, resetVideoState, fetchVideoStats } from "@/lib/features/videoSlice";
import { useRouter } from "next/navigation";
import { Search, PlayArrow, CheckCircle, ErrorOutline } from '@mui/icons-material';

export default function UrlInput() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { statsLoading, error, redirectId, videoId } = useAppSelector((state) => state.video);
    const [inputUrl, setInputUrl] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        // Reset state on mount to ensure a clean slate
        dispatch(resetVideoState());
    }, [dispatch]);

    useEffect(() => {
        if (redirectId) {
            const uniqueId = `${redirectId}-${Date.now()}`;
            router.push(`/results/${uniqueId}`);
            // Clear the trigger immediately after redirection
            dispatch(clearRedirectId());
        }
    }, [redirectId, router, dispatch]);

    const handleAnalyze = async () => {
        if (inputUrl) {
            // Basic cleaning: extract the first valid-looking URL pattern
            // Only allow RFC 3986 valid characters in the URL part (excluding single quotes as requested)
            const urlMatch = inputUrl.match(/(https?:\/\/[a-zA-Z0-9\-\._~:\/?#\[\]@!$&()*+,;=%]+)/);
            let cleanedUrl = urlMatch ? urlMatch[0] : inputUrl.trim();

            // Remove trailing punctuation that often gets copied by mistake (e.g. "Check this out: url.")
            cleanedUrl = cleanedUrl.replace(/[.,;)>\]]+$/, '');

            if (cleanedUrl !== inputUrl) {
                setInputUrl(cleanedUrl);
            }

            dispatch(setVideoUrl(cleanedUrl));
            const parsedVideoId = await dispatch(parseVideoUrl(cleanedUrl)).unwrap();
            if (parsedVideoId) {
                dispatch(fetchVideoStats({ videoId: parsedVideoId })).catch((error) => {
                    if (process.env.NODE_ENV === "development") {
                        console.error("Error fetching video stats:", error);
                    }
                });
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !statsLoading) {
            handleAnalyze();
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4">
                <div className={`relative flex gap-3 items-center p-1 rounded-xl bg-white dark:bg-gray-800 border-2 transition-all duration-300 ${isFocused
                        ? 'border-red-500 dark:border-red-600 shadow-lg shadow-red-500/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${error ? 'border-red-500 dark:border-red-600' : ''}`}>
                    <div className="pl-4 pr-2">
                        <Search className={`h-5 w-5 transition-colors duration-300 ${isFocused ? 'text-red-500' : 'text-gray-400'
                            }`} />
                    </div>
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyPress={handleKeyPress}
                        placeholder="Paste YouTube Video URL here..."
                        className="flex-1 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-base font-normal"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={statsLoading || !inputUrl.trim()}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2 min-w-[110px] justify-center self-stretch"
                        style={{ alignSelf: 'stretch', marginRight: 2, marginLeft: 2, marginTop: 2, marginBottom: 2 }}
                    >
                        {statsLoading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <PlayArrow className="h-5 w-5" />
                                <span>Analyze</span>
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 rounded-xl animate-in slide-in-from-top-2 duration-300">
                        <ErrorOutline className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {videoId && !error && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-300 rounded-xl animate-in slide-in-from-top-2 duration-300">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">
                            Video ID Found: <span className="font-mono font-bold">{videoId}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
