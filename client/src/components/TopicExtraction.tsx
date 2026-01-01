'use client';

import { useAppSelector } from '@/lib/hooks';

export default function TopicExtraction() {
    const { sentiment, loading } = useAppSelector((state) => state.video);

    if (!sentiment || !sentiment.topics || sentiment.topics.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="w-2 h-8 bg-blue-600 rounded-full" />
                    Trending Conversation Themes
                </h3>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className={`bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-700 ${loading ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {sentiment.topics.map((topic, index) => (
                        <div
                            key={topic.name}
                            className="group relative flex items-center gap-3 px-6 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-blue-600 dark:hover:bg-blue-600 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-105 cursor-default shadow-sm hover:shadow-blue-500/20"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <i className="fa-solid fa-hashtag text-blue-500 group-hover:text-white transition-colors"></i>
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-white transition-colors capitalize">
                                {topic.name}
                            </span>
                            <div className="flex items-center justify-center min-w-[24px] h-[24px] bg-blue-100 dark:bg-blue-900/50 group-hover:bg-white/20 rounded-lg px-2">
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 group-hover:text-white">
                                    {topic.count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-8 text-center md:text-left text-sm font-medium text-gray-400">
                    <i className="fa-solid fa-circle-info mr-2"></i>
                    These keywords represent the most frequently discussed subjects in the entire comment section.
                </p>
            </div>
        </div>
    );
}
