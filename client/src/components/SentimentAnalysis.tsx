"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { analyzeSentiment } from "@/lib/features/videoSlice";
import {
  Psychology,
  SentimentSatisfied,
  SentimentNeutral,
  SentimentDissatisfied,
  SmartToy,
  EmojiEmotions,
  ArrowForward,
  AutoAwesome
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { Paper, Typography } from "@mui/material";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0 }
  }
};

const borderBeamAnimation = `
    @keyframes moveBeam {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
    }
    @keyframes shimmer {
        0% { transform: translateX(-150%) skewX(-30deg); }
        100% { transform: translateX(300%) skewX(-30deg); }
    }
`;

export default function SentimentAnalysis() {
  const dispatch = useAppDispatch();
  const { videoId, stats, sentiment, sentimentLoading } = useAppSelector(
    (state) => state.video
  );

  if (!stats) return null;

  const handleRunAnalysis = () => {
    if (videoId) {
      dispatch(analyzeSentiment(videoId));
    }
  };

  const getSentimentLabel = (polarity: number) => {
    if (polarity > 0.2) return { text: "Optimal", color: "text-emerald-600 dark:text-emerald-500", beam: "from-emerald-500 via-emerald-400/50 to-transparent" };
    if (polarity > 0.05) return { text: "Positive", color: "text-blue-600 dark:text-blue-500", beam: "from-blue-500 via-blue-400/50 to-transparent" };
    if (polarity < -0.2) return { text: "Critical", color: "text-rose-600 dark:text-rose-500", beam: "from-rose-500 via-rose-400/50 to-transparent" };
    if (polarity < -0.05) return { text: "Negative", color: "text-amber-600 dark:text-amber-500", beam: "from-amber-500 via-amber-400/50 to-transparent" };
    return { text: "Neutral", color: "text-zinc-600 dark:text-zinc-500", beam: "from-zinc-500 via-zinc-400/50 to-transparent" };
  };

  const label = sentiment ? getSentimentLabel(sentiment.average_polarity) : null;

  const emotionConfig = {
    joy: { icon: "fa-face-laugh-beam", color: "text-emerald-600 dark:text-emerald-500", bg: "bg-emerald-500/10", beam: "from-emerald-500 via-emerald-400/50 to-transparent" },
    anger: { icon: "fa-face-angry", color: "text-rose-600 dark:text-rose-500", bg: "bg-rose-500/10", beam: "from-rose-500 via-rose-400/50 to-transparent" },
    sadness: { icon: "fa-face-sad-tear", color: "text-blue-600 dark:text-blue-500", bg: "bg-blue-500/10", beam: "from-blue-500 via-blue-400/50 to-transparent" },
    surprise: { icon: "fa-face-surprise", color: "text-purple-600 dark:text-purple-500", bg: "bg-purple-500/10", beam: "from-purple-500 via-violet-400/50 to-transparent" },
    fear: { icon: "fa-face-flushed", color: "text-indigo-600 dark:text-indigo-500", bg: "bg-indigo-500/10", beam: "from-indigo-500 via-blue-400/50 to-transparent" },
    excitement: { icon: "fa-face-grin-stars", color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", beam: "from-amber-500 via-amber-400/50 to-transparent" },
  };

  const maxEmotion = sentiment ? Math.max(...Object.values(sentiment.emotions), 1) : 1;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 sm:p-10 space-y-12 sm:space-y-16 mb-20">
      <style jsx global>{borderBeamAnimation}</style>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative">
        <div className="flex items-center gap-4 sm:gap-5 relative z-10 max-w-full">
          <div className="p-3 sm:p-5 bg-purple-500/10 rounded-3xl sm:rounded-4xl text-purple-600 dark:text-purple-500 border border-purple-500/20 shadow-2xl shadow-purple-500/10 backdrop-blur-md shrink-0">
            <Psychology className="text-2xl sm:text-4xl" />
          </div>
          <div className="min-w-0">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter flex flex-wrap items-center gap-x-3 gap-y-1">
              Audience <span className="text-purple-600 dark:text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">Sentiment</span>
            </h3>
            <p className="text-gray-500 dark:text-zinc-500 font-black uppercase text-[9px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] mt-1 sm:mt-2 flex flex-wrap items-center gap-2">
              Neural Mood Analysis <span className="hidden sm:block w-8 h-px bg-zinc-800 dark:bg-white/10" /> Engagement Sigma
            </p>
          </div>
        </div>

        <div className="relative group p-[2.5px] rounded-3xl overflow-hidden w-full max-w-sm lg:w-[320px]">
          <div className="absolute -inset-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#a855f7_360deg)] animate-[spin_3s_linear_infinite] opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
          <button
            onClick={handleRunAnalysis}
            disabled={sentimentLoading}
            className="relative w-full px-6 sm:px-10 py-4 sm:py-5 cursor-pointer bg-white dark:bg-zinc-950 text-black dark:text-white rounded-[1.4rem] font-black text-xs sm:text-sm uppercase tracking-[0.2em] transition-all duration-500 transform active:scale-95 disabled:opacity-50 overflow-hidden flex items-center justify-center gap-3 sm:gap-4"
          >
            <div className="absolute inset-0 w-1/4 h-full bg-linear-to-r from-transparent via-purple-500/20 to-transparent skew-x-[-30deg] animate-[shimmer_2s_infinite]" />

            <div className="flex items-center gap-3 relative z-10">
              {sentimentLoading ? (
                <>
                  <div className="h-5 w-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="animate-pulse">Decoding Emotions...</span>
                </>
              ) : (
                <>
                  <AutoAwesome sx={{ fontSize: 24 }} className="text-purple-600 dark:text-purple-500 animate-pulse" />
                  <span>{sentiment ? "Recalculate Mood" : "Analyze Audience"}</span>
                  <ArrowForward sx={{ fontSize: 18 }} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {sentiment && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12 sm:space-y-16"
          >
            {/* Main Score & Gauge Card */}
            <motion.div variants={itemVariants} className="relative group">
              <Paper
                elevation={0}
                sx={{ bgcolor: 'transparent' }}
                className="p-6 sm:p-10 border border-gray-200/50 dark:border-white/10 bg-white/70 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] shadow-2xl ring-1 ring-inset ring-black/5 dark:ring-white/5 relative overflow-hidden"
              >
                {/* Border Beam */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className={`absolute top-0 left-0 w-[40%] h-[2px] bg-linear-to-r ${label?.beam} animate-[moveBeam_3s_linear_infinite]`} />
                  <div className={`absolute bottom-0 right-0 w-[40%] h-[2px] bg-linear-to-l ${label?.beam} animate-[moveBeam_3s_linear_infinite]`} />
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                  {/* Gauge Section */}
                  <div className="relative w-72 h-44 md:w-96 md:h-52 flex items-center justify-center shrink-0">
                    <svg width="100%" height="100%" viewBox="0 0 200 110" fill="none" className="absolute inset-0">
                      <path d="M 30 100 A 70 70 0 0 1 170 100" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="14" fill="none" strokeLinecap="round" />
                      <path
                        d="M 30 100 A 70 70 0 0 1 170 100"
                        stroke={sentiment.average_polarity > 0 ? "#10b981" : "#f43f5e"}
                        strokeWidth="14"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="220"
                        strokeDashoffset={220 - ((sentiment.average_polarity + 1) / 2) * 220}
                        style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)" }}
                      />
                    </svg>
                    <div className="absolute left-1/2 top-[58%] -translate-x-1/2 flex flex-col items-center">
                      <Typography variant="h2" className={`font-black tracking-tighter tabular-nums ${label?.color} drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                        {Math.round(((sentiment.average_polarity + 1) / 2) * 100)}
                      </Typography>
                      <Typography className="text-[10px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-[0.3em] mt-1">
                        Neural Score
                      </Typography>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 space-y-8 text-center lg:text-left">
                    <div>
                      <Typography variant="h3" className={`font-black tracking-tighter mb-2 ${label?.color}`}>
                        {label?.text} Vibe Detected
                      </Typography>
                      <Typography className="text-gray-600 dark:text-zinc-500 font-bold tracking-tight">
                        Aggregated from <span className="text-gray-900 dark:text-white font-black">{sentiment.total}</span> audience interaction signals across the matrix.
                      </Typography>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      {[
                        { label: "Positive", val: sentiment.positive, color: "emerald", icon: SentimentSatisfied },
                        { label: "Neutral", val: sentiment.neutral, color: "zinc", icon: SentimentNeutral },
                        { label: "Negative", val: sentiment.negative, color: "rose", icon: SentimentDissatisfied }
                      ].map((s, i) => (
                        <div key={i} className={`p-5 rounded-2xl bg-${s.color}-500/5 dark:bg-${s.color}-500/10 border border-${s.color}-500/20 backdrop-blur-md`}>
                          <div className="flex items-center gap-2 mb-2 opacity-60">
                            <s.icon sx={{ fontSize: 14 }} className={`text-${s.color}-600 dark:text-${s.color}-500`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest text-${s.color}-600 dark:text-${s.color}-500`}>{s.label}</span>
                          </div>
                          <Typography className="text-2xl font-black text-gray-900 dark:text-white">
                            {((s.val / sentiment.total) * 100).toFixed(0)}%
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Paper>
            </motion.div>

            {/* Emotion Breakdown */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-500">
                  <EmojiEmotions sx={{ fontSize: 24 }} />
                </div>
                <Typography variant="h5" className="text-gray-900 dark:text-white font-black tracking-tight uppercase">
                  Emotion Sigma Matrix
                </Typography>
                <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {(Object.keys(emotionConfig) as Array<keyof typeof emotionConfig>).map((emotion) => {
                  const config = emotionConfig[emotion];
                  const count = sentiment.emotions[emotion];
                  const percentage = ((count / sentiment.total) * 100).toFixed(1);
                  const barWidth = (count / maxEmotion) * 100;

                  return (
                    <motion.div key={emotion} whileHover={{ y: -5 }} className="relative group/card h-full">
                      <Paper
                        elevation={0}
                        sx={{ bgcolor: 'transparent' }}
                        className="p-6 h-full border border-gray-200/50 dark:border-white/5 bg-white/70 dark:bg-zinc-950/20 backdrop-blur-2xl rounded-4xl flex flex-col justify-between overflow-hidden relative ring-1 ring-inset ring-black/5 dark:ring-white/5"
                      >
                        {/* Edge highlight on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700">
                          <div className={`absolute top-0 left-0 w-full h-px bg-linear-to-r ${config.beam}`} />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4">
                            <i className={`fa-solid ${config.icon} ${config.color} text-lg`} />
                            <span className="text-[9px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-widest">{emotion}</span>
                          </div>
                          <Typography className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                            {count}
                          </Typography>
                          <Typography className="text-[10px] font-bold text-gray-500 dark:text-zinc-600 mt-1">{percentage}%</Typography>
                        </div>

                        {/* Progress Bar background style */}
                        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100 dark:bg-zinc-800/20">
                          <div className={`h-full ${config.color.replace('text', 'bg')} opacity-60 transition-all duration-1000`} style={{ width: `${barWidth}%` }} />
                        </div>
                      </Paper>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Anomaly Detection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Spam Matrix */}
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={0}
                  sx={{ bgcolor: 'transparent' }}
                  className="p-8 border border-gray-200/50 dark:border-white/5 bg-white/70 dark:bg-zinc-950/20 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden group/spam ring-1 ring-inset ring-black/5 dark:ring-white/5"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-500 border border-amber-500/20">
                        <SmartToy sx={{ fontSize: 24 }} />
                      </div>
                      <Typography variant="h6" className="font-black text-gray-900 dark:text-white tracking-tight">Spam Heuristics</Typography>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mb-8">
                    <Typography variant="h2" className={`font-black ${sentiment.spam_count > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                      {sentiment.spam_count}
                    </Typography>
                    <div>
                      <Typography className="text-xs font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Flagged Nodes</Typography>
                      <Typography className="text-[10px] font-bold text-gray-400 dark:text-zinc-600">{((sentiment.spam_count / sentiment.total) * 100).toFixed(1)}% of signal density</Typography>
                    </div>
                  </div>

                  {sentiment.spam_count > 0 ? (
                    <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10 italic">
                      <Typography className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2 opacity-60">Sample Payload Identified:</Typography>
                      <Typography className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-2">&quot;{sentiment.spam_comments[0]}&quot;</Typography>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse" />
                      <Typography className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Signal Clean: No anomalies detected</Typography>
                    </div>
                  )}
                </Paper>
              </motion.div>

              {/* Sarcasm Variance */}
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={0}
                  sx={{ bgcolor: 'transparent' }}
                  className="p-8 border border-gray-200/50 dark:border-white/5 bg-white/70 dark:bg-zinc-950/20 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden group/sarcasm ring-1 ring-inset ring-black/5 dark:ring-white/5"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-500 border border-indigo-500/20">
                        <SentimentNeutral sx={{ fontSize: 24 }} />
                      </div>
                      <Typography variant="h6" className="font-black text-gray-900 dark:text-white tracking-tight">Sarcasm Variance</Typography>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mb-8">
                    <Typography variant="h2" className="font-black text-indigo-600 dark:text-indigo-500">
                      {sentiment.sarcasm_detected}
                    </Typography>
                    <div>
                      <Typography className="text-xs font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Paradoxical Signals</Typography>
                      <Typography className="text-[10px] font-bold text-gray-400 dark:text-zinc-600">{((sentiment.sarcasm_detected / sentiment.total) * 100).toFixed(1)}% linguistic irony detected</Typography>
                    </div>
                  </div>

                  <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                    <Typography className="text-[11px] text-gray-600 dark:text-zinc-500 font-bold leading-relaxed">
                      Syntactic analysis identifies mixed emotive payloads often associated with irony or satirical critique.
                    </Typography>
                  </div>
                </Paper>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
