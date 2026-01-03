"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { analyzeSentiment } from "@/lib/features/videoSlice";
import {
  Psychology,
  SentimentSatisfied,
  SentimentNeutral,
  SentimentDissatisfied,
  SmartToy,
  EmojiEmotions,
} from "@mui/icons-material";

export default function SentimentAnalysis() {
  const dispatch = useAppDispatch();
  const { videoId, stats, sentiment, sentimentLoading } = useAppSelector(
    (state) => state.video
  );

  // Show if we have a video and stats, even if comments aren't locally loaded
  if (!stats)
    return (
      <div className="w-full text-center py-20">
        <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">
          No statistics available for this video.
        </p>
      </div>
    );

  const handleRunAnalysis = () => {
    if (videoId) {
      dispatch(analyzeSentiment(videoId));
    }
  };

  const getSentimentLabel = (polarity: number) => {
    if (polarity > 0.2)
      return { text: "Very Positive", color: "text-green-600" };
    if (polarity > 0.05) return { text: "Positive", color: "text-green-500" };
    if (polarity < -0.2)
      return { text: "Very Negative", color: "text-red-600" };
    if (polarity < -0.05) return { text: "Negative", color: "text-red-500" };
    return { text: "Neutral", color: "text-gray-500" };
  };

  const label = sentiment
    ? getSentimentLabel(sentiment.average_polarity)
    : null;

  // Emotion icons and colors
  const emotionConfig = {
    joy: {
      icon: "fa-face-laugh-beam",
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/10",
      border: "border-yellow-200 dark:border-yellow-800/30",
    },
    anger: {
      icon: "fa-face-angry",
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/10",
      border: "border-red-200 dark:border-red-800/30",
    },
    sadness: {
      icon: "fa-face-sad-tear",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/10",
      border: "border-blue-200 dark:border-blue-800/30",
    },
    surprise: {
      icon: "fa-face-surprise",
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/10",
      border: "border-purple-200 dark:border-purple-800/30",
    },
    fear: {
      icon: "fa-face-flushed",
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/10",
      border: "border-indigo-200 dark:border-indigo-800/30",
    },
    excitement: {
      icon: "fa-face-grin-stars",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/10",
      border: "border-orange-200 dark:border-orange-800/30",
    },
  };

  // Calculate max emotion for bar scaling
  const maxEmotion = sentiment
    ? Math.max(...Object.values(sentiment.emotions), 1)
    : 1;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Psychology className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Audience Sentiment Analysis
          </h3>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={sentimentLoading}
          className="px-5 sm:px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg disabled:shadow-none flex items-center gap-2"
        >
          {sentimentLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Psychology className="h-4 w-4" />
              <span>{sentiment ? "Recalculate" : "Analyze audience mood"}</span>
            </>
          )}
        </button>
      </div>

      {sentiment && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
          {/* Main Sentiment Card */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Dashboard Style Gauge Meter */}
              <div className="relative w-72 h-44 md:w-96 md:h-52 flex items-center justify-center shrink-0 mx-auto">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 200 110"
                  fill="none"
                  className="absolute inset-0"
                >
                  {/* Arc track */}
                  <path
                    d="M 30 100 A 70 70 0 0 1 170 100"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Progress Arc */}
                  <path
                    d="M 30 100 A 70 70 0 0 1 170 100"
                    stroke="#2563eb"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="220"
                    strokeDashoffset={
                      220 - ((sentiment.average_polarity + 1) / 2) * 220
                    }
                    style={{
                      transition:
                        "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </svg>
                {/* Main Score Value & Dashboard Labels */}
                <div
                  className="absolute left-1/2 top-[54%] flex flex-col items-center w-full"
                  style={{ transform: "translateX(-50%)" }}
                >
                  <div
                    className="text-6xl md:text-7xl font-extrabold mb-1 text-[#06b94d]"
                    style={{ letterSpacing: "-1px" }}
                  >
                    {Math.round(((sentiment.average_polarity + 1) / 2) * 100)}
                  </div>
                  <div className="text-2xl font-extrabold text-[#757e8a] mb-1">
                    Sentiment Score
                  </div>
                </div>
              </div>

              {/* Analysis Content */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <h4
                    className={`text-4xl md:text-5xl font-black mb-2 transition-colors duration-500 ${label?.color}`}
                  >
                    {label?.text}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Based on the analysis of {sentiment.total} audience
                    interactions.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
                    <div className="flex items-center gap-1 mb-1">
                      <SentimentSatisfied className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-tighter">
                        Joy
                      </p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {((sentiment.positive / sentiment.total) * 100).toFixed(
                        0
                      )}
                      %
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/10 rounded-xl border border-gray-100 dark:border-gray-800/30">
                    <div className="flex items-center gap-1 mb-1">
                      <SentimentNeutral className="h-3 w-3 text-gray-500" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">
                        Neutral
                      </p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {((sentiment.neutral / sentiment.total) * 100).toFixed(0)}
                      %
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-800/30">
                    <div className="flex items-center gap-1 mb-1">
                      <SentimentDissatisfied className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-tighter">
                        Critical
                      </p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {((sentiment.negative / sentiment.total) * 100).toFixed(
                        0
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emotion Breakdown Card */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-3">
              <EmojiEmotions className="h-5 w-5 text-purple-500" />
              Emotion Breakdown
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(
                Object.keys(emotionConfig) as Array<keyof typeof emotionConfig>
              ).map((emotion) => {
                const config = emotionConfig[emotion];
                const count = sentiment.emotions[emotion];
                const percentage = ((count / sentiment.total) * 100).toFixed(1);
                const barWidth = (count / maxEmotion) * 100;

                return (
                  <div
                    key={emotion}
                    className={`p-4 rounded-2xl ${config.bg} border ${config.border} relative overflow-hidden`}
                  >
                    {/* Background bar */}
                    <div
                      className={`absolute bottom-0 left-0 h-1 ${config.color.replace(
                        "text-",
                        "bg-"
                      )} opacity-50 transition-all duration-700`}
                      style={{ width: `${barWidth}%` }}
                    />

                    <div className="flex items-center gap-2 mb-2">
                      <i
                        className={`fa-solid ${config.icon} ${config.color} text-lg`}
                      ></i>
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        {emotion}
                      </span>
                    </div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      {count}
                    </p>
                    <p className="text-xs text-gray-400">{percentage}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spam & Sarcasm Detection Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Spam Detection */}
            <div className="bg-white dark:bg-[#181818] rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <SmartToy className="h-5 w-5 text-amber-500" />
                Spam & Bot Detection
              </h4>

              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`text-4xl font-black ${sentiment.spam_count > sentiment.total * 0.1
                    ? "text-red-500"
                    : sentiment.spam_count > 0
                      ? "text-amber-500"
                      : "text-green-500"
                    }`}
                >
                  {sentiment.spam_count}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Suspicious comments detected
                  </p>
                  <p className="text-xs text-gray-400">
                    {((sentiment.spam_count / sentiment.total) * 100).toFixed(
                      1
                    )}
                    % of total
                  </p>
                </div>
              </div>

              {sentiment.spam_count > 0 &&
                sentiment.spam_comments.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-200 dark:border-amber-800/30">
                    <p className="text-xs font-bold text-amber-600 mb-2">
                      Sample flagged:
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate italic">
                      &quot;{sentiment.spam_comments[0]}&quot;
                    </p>
                  </div>
                )}

              {sentiment.spam_count === 0 && (
                <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-200 dark:border-green-800/30">
                  <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                    <i className="fa-solid fa-shield-check"></i>
                    No spam detected - Clean comment section!
                  </p>
                </div>
              )}
            </div>

            {/* Sarcasm Detection */}
            <div className="bg-white dark:bg-[#181818] rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <SentimentNeutral className="h-5 w-5 text-indigo-500" />
                Sarcasm Indicator
              </h4>

              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`text-4xl font-black ${sentiment.sarcasm_detected > sentiment.total * 0.15
                    ? "text-indigo-500"
                    : "text-gray-400"
                    }`}
                >
                  {sentiment.sarcasm_detected}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Potentially sarcastic comments
                  </p>
                  <p className="text-xs text-gray-400">
                    {(
                      (sentiment.sarcasm_detected / sentiment.total) *
                      100
                    ).toFixed(1)}
                    % of total
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-200 dark:border-indigo-800/30">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <i className="fa-solid fa-info-circle text-indigo-500 mr-1"></i>
                  Sarcasm is detected by analyzing mixed positive/negative
                  signals and linguistic patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
