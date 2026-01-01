'use client';

import { useAppSelector } from '@/lib/hooks';
import { Tag, Info } from '@mui/icons-material';

export default function TopicExtraction() {
    const { sentiment, sentimentLoading } = useAppSelector((state) => state.video);

    if (!sentiment || !sentiment.topics || sentiment.topics.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Tag className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Trending Conversation Themes
                </h3>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className={`bg-white dark:bg-[#181818] rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200/50 dark:border-gray-800/50 transition-all duration-500 ${sentimentLoading ? 'opacity-50 grayscale' : 'opacity-100 hover:shadow-xl'}`}>
                <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
                    {sentiment.topics.map((topic, index) => (
                        <div
                            key={topic.name}
                            className="group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-red-600 dark:hover:bg-red-600 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-red-500 dark:hover:border-red-500 transition-all duration-300 hover:scale-105 cursor-default shadow-sm hover:shadow-lg"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Tag className="h-4 w-4 text-red-500 group-hover:text-white transition-colors" />
                            <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 group-hover:text-white transition-colors capitalize">
                                {topic.name}
                            </span>
                            <div className="flex items-center justify-center min-w-[24px] h-[24px] bg-red-100 dark:bg-red-900/50 group-hover:bg-white/20 rounded-lg px-2">
                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 group-hover:text-white">
                                    {topic.count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-6 sm:mt-8 text-center md:text-left text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2">
                    <Info className="h-4 w-4" />
                    These keywords represent the most frequently discussed subjects in the entire comment section.
                </p>
            </div>
        </div>
    );
}
