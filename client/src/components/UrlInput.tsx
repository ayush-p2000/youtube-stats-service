'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setVideoUrl, parseVideoUrl } from '@/lib/features/videoSlice';

export default function UrlInput() {
    const dispatch = useAppDispatch();
    const { url, loading, error, videoId } = useAppSelector((state) => state.video);
    const [inputUrl, setInputUrl] = useState(url);

    const handleAnalyze = () => {
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
            dispatch(parseVideoUrl(cleanedUrl));
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Paste YouTube Video URL here..."
                        className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                {videoId && (
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                        Video ID Found: <span className="font-mono font-bold">{videoId}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
