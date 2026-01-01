'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchVideoStats } from '@/lib/features/videoSlice';

export default function StatsDisplay() {
    const { stats, comments, loading, videoId, nextPageToken } = useAppSelector((state) => state.video);
    const dispatch = useAppDispatch();

    if (loading && !stats) return (
        <div className="w-full text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-500 font-medium">Fetching video data...</p>
        </div>
    );

    if (!stats) return null;

    const handleLoadMore = () => {
        if (videoId && nextPageToken) {
            dispatch(fetchVideoStats({ videoId, pageToken: nextPageToken }));
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Hero Section */}
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-purple-500 to-rose-500" />
                <div className="p-8 md:p-12">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
                        {stats.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest mb-2">Total Views</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{Number(stats.viewCount).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col p-6 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100/50 dark:border-rose-800/30">
                            <span className="text-rose-600 dark:text-rose-400 text-sm font-bold uppercase tracking-widest mb-2">Total Likes</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{Number(stats.likeCount).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2">Comments</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{Number(stats.commentCount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Data Tables */}
            <div className="grid grid-cols-1 gap-10">

                {/* Metrics Table */}
                <section className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="w-2 h-8 bg-blue-600 rounded-full" />
                        Video Metrics Summary
                    </h3>
                    <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Metric</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Value</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                <tr>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">View Engagement</td>
                                    <td className="px-6 py-4 text-right font-mono">{Number(stats.viewCount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">High</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Like/View Ratio</td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        {((Number(stats.likeCount) / Number(stats.viewCount)) * 100).toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Stable</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Comment Density</td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        {((Number(stats.commentCount) / Number(stats.viewCount)) * 1000).toFixed(2)} per 1k views
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Active</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Comments Table */}
                <section className="space-y-4 pb-20">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <span className="w-2 h-8 bg-rose-600 rounded-full" />
                            Recent Comments Analysis
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                {comments.length} items
                            </span>
                        </h3>
                    </div>

                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Author</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Comment</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Likes</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {comments.map((comment) => (
                                    <tr key={comment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                            {comment.author}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 max-w-md">
                                            <p className="truncate hover:whitespace-normal cursor-default" title={comment.text}>
                                                &quot;{comment.text}&quot;
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 text-xs font-black bg-rose-50 text-rose-500 rounded-md">
                                                ♥ {comment.likeCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                            {new Date(comment.publishedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {nextPageToken && (
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-center bg-gray-50/30 dark:bg-gray-900/20">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl font-bold shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-all flex items-center gap-2 group"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                                            Loading Batch...
                                        </>
                                    ) : (
                                        <>
                                            Load Next 100 Comments
                                            <span className="group-hover:translate-y-1 transition-transform">↓</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
