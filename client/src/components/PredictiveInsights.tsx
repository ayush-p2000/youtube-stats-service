"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { predictMetrics } from "@/lib/features/videoSlice";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import {
  TrendingUp,
  AutoAwesome,
  Lightbulb,
  ShowChart,
  ArrowForward,
  Timeline
} from "@mui/icons-material";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Line,
  ComposedChart
} from "recharts";
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

export default function PredictiveInsights() {
  const dispatch = useAppDispatch();
  const { videoId, stats, sentiment, prediction, predictionLoading, comments } =
    useAppSelector((state) => state.video);
  const { resolvedTheme } = useTheme();

  const isClient = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );

  if (!isClient || !stats) return null;

  const handleRunPrediction = () => {
    if (videoId && stats) {
      dispatch(
        predictMetrics({
          videoId,
          stats,
          sentiment: sentiment || undefined,
          comments: comments || undefined,
        })
      );
    }
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div className="w-full max-w-7xl mx-auto p-6 sm:p-10 space-y-12 sm:space-y-16 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-2000">
      <style jsx global>{borderBeamAnimation}</style>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative">
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-5 bg-blue-500/10 rounded-4xl text-blue-600 dark:text-blue-500 border border-blue-500/20 shadow-2xl shadow-blue-500/10 backdrop-blur-md">
            <TrendingUp sx={{ fontSize: 36 }} />
          </div>
          <div>
            <h3 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-4">
              Predictive <span className="text-blue-600 dark:text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Analytics</span>
            </h3>
            <p className="text-gray-500 dark:text-zinc-500 font-black uppercase text-[11px] tracking-[0.4em] mt-2 flex items-center gap-2">
              Temporal Projection <span className="w-8 h-px bg-zinc-800 dark:bg-white/10" /> Heuristic Models
            </p>
          </div>
        </div>

        <div className="relative group p-[2.5px] rounded-3xl overflow-hidden w-[320px]">
          <div className="absolute -inset-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#3b82f6_360deg)] animate-[spin_3s_linear_infinite] opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
          <button
            onClick={handleRunPrediction}
            disabled={predictionLoading}
            className="relative w-full px-10 py-5 cursor-pointer bg-white dark:bg-zinc-950 text-black dark:text-white rounded-[1.4rem] font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 transform active:scale-95 disabled:opacity-50 overflow-hidden flex items-center justify-center gap-4"
          >
            <div className="absolute inset-0 w-1/4 h-full bg-linear-to-r from-transparent via-blue-500/20 to-transparent skew-x-[-30deg] animate-[shimmer_2s_infinite]" />

            <div className="flex items-center gap-3 relative z-10">
              {predictionLoading ? (
                <>
                  <div className="h-5 w-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="animate-pulse">Synthesizing...</span>
                </>
              ) : (
                <>
                  <AutoAwesome sx={{ fontSize: 24 }} className="text-blue-600 dark:text-blue-500 animate-pulse" />
                  <span>{prediction ? "Recalculate Vision" : "Predict Growth"}</span>
                  <ArrowForward sx={{ fontSize: 18 }} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {prediction && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12 sm:space-y-16"
          >
            {/* Chart Card */}
            <motion.div variants={itemVariants} className="relative group">
              <Paper
                elevation={0}
                sx={{ bgcolor: 'transparent' }}
                className="p-10 border border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl ring-1 ring-inset ring-black/5 dark:ring-white/5 relative overflow-hidden"
              >
                {/* Border Beam */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute top-0 left-0 w-[40%] h-[2px] bg-linear-to-r from-blue-500 via-indigo-400 to-transparent animate-[moveBeam_3s_linear_infinite]" />
                  <div className="absolute bottom-0 right-0 w-[40%] h-[2px] bg-linear-to-l from-blue-500 via-indigo-400 to-transparent animate-[moveBeam_3s_linear_infinite]" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 mb-12 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-500">
                        <ShowChart sx={{ fontSize: 24 }} />
                      </div>
                      <Typography variant="h5" className="text-gray-900 dark:text-white font-black tracking-tight">
                        Growth Trajectory
                      </Typography>
                    </div>
                    <Typography className="text-[10px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-[0.3em] ml-11 opacity-80">
                      Historical View Matrix & Regression Trend
                    </Typography>
                  </div>

                  <div className="flex items-center gap-8 bg-gray-100 dark:bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span className="text-[9px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Est. Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-px bg-indigo-400 border-t border-dashed border-indigo-400" />
                      <span className="text-[9px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Regression Model</span>
                    </div>
                  </div>
                </div>

                <div className="h-[400px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={prediction.chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="8 8" stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"} vertical={false} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 10, fontWeight: "900", letterSpacing: "0.1em" }}
                        dy={15}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 10, fontWeight: "900" }}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                          borderRadius: '2rem',
                          border: '1px solid rgba(0,0,0,0.1)',
                          boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
                          color: isDark ? '#fff' : '#18181b',
                          padding: '24px'
                        }}
                        itemStyle={{ color: '#3b82f6', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}
                        cursor={{ stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#2563eb"
                        strokeWidth={5}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                        animationDuration={3000}
                      />
                      <Line
                        type="linear"
                        dataKey="regression"
                        stroke="#818cf8"
                        strokeWidth={2}
                        strokeDasharray="8 8"
                        dot={false}
                        animationDuration={4000}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </motion.div>

            {/* Virality and Forecast Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Virality Gauge */}
              <motion.div variants={itemVariants} className="lg:col-span-4">
                <Paper
                  elevation={0}
                  sx={{ bgcolor: 'transparent' }}
                  className="p-10 border border-gray-200 dark:border-white/5 bg-white/70 dark:bg-zinc-950/20 backdrop-blur-3xl rounded-[3rem] h-full flex flex-col items-center justify-center text-center ring-1 ring-inset ring-black/5 dark:ring-white/5 relative overflow-hidden group/vir"
                >
                  <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-blue-500/20 to-transparent group-hover/vir:opacity-100 opacity-0 transition-opacity duration-1000" />

                  <div className="relative w-48 h-48 mb-8">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Background Track - 270 degree arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        className="text-gray-100 dark:text-white/5"
                        strokeWidth="8"
                        strokeDasharray="198 264"
                        strokeLinecap="round"
                        transform="rotate(135 50 50)"
                      />
                      {/* Progress Track - 270 degree arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="url(#gradVir)"
                        strokeWidth="10"
                        strokeDasharray={`${(prediction.virality_score / 100) * 198} 264`}
                        strokeLinecap="round"
                        transform="rotate(135 50 50)"
                        style={{
                          transition: "stroke-dasharray 2s cubic-bezier(0.4, 0, 0.2, 1)",
                          filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))"
                        }}
                      />
                      <defs>
                        <linearGradient id="gradVir" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                      <Typography variant="h2" className="font-black text-gray-900 dark:text-white tracking-tighter tabular-nums drop-shadow-sm">
                        {prediction.virality_score}%
                      </Typography>
                      <Typography className="text-[10px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-[0.3em]">
                        Virality Sigma
                      </Typography>
                    </div>
                  </div>

                  <Typography variant="h5" className="font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight">
                    {prediction.virality_score > 70 ? "Viral Vector Active" : prediction.virality_score > 40 ? "Elevated Momentum" : "Stable Growth Signal"}
                  </Typography>
                  <Typography className="text-xs text-gray-600 dark:text-zinc-500 font-bold leading-relaxed max-w-[200px]">
                    Cross-platform engagement delta analysis confirmed.
                  </Typography>
                </Paper>
              </motion.div>

              {/* Data Cards & Recommendations */}
              <div className="lg:col-span-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: "7D MOMENTUM FORECAST", val: prediction.forecast.views_7d, icon: Timeline, color: "blue", sub: "Projected Node Views" },
                    { label: "30D STRATEGIC PROJECTION", val: prediction.forecast.views_30d, icon: TrendingUp, color: "indigo", sub: "Network Growth Apex" }
                  ].map((f, i) => (
                    <Paper key={i} elevation={0} sx={{ bgcolor: 'transparent' }} className={`p-8 border border-gray-200/50 dark:border-white/5 bg-${f.color}-500/5 dark:bg-${f.color}-500/10 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden group/f ring-1 ring-inset ring-black/5 dark:ring-white/5`}>
                      <div className="absolute inset-0 opacity-0 group-hover/f:opacity-100 transition-opacity duration-700">
                        <div className={`absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-${f.color}-400 to-transparent`} />
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <Typography className={`text-[10px] font-black text-${f.color}-600 dark:text-${f.color}-500 uppercase tracking-[0.3em]`}>{f.label}</Typography>
                        <f.icon sx={{ fontSize: 20 }} className={`text-${f.color}-600 dark:text-${f.color}-500 opacity-60`} />
                      </div>
                      <Typography variant="h3" className="text-gray-900 dark:text-white font-black tracking-tighter tabular-nums mb-1">
                        +{f.val.toLocaleString()}
                      </Typography>
                      <Typography className="text-[10px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-widest opacity-60">
                        {f.sub}
                      </Typography>
                    </Paper>
                  ))}
                </div>

                {/* Recommendations */}
                <Paper elevation={0} sx={{ bgcolor: 'transparent' }} className="p-10 border border-gray-200/50 dark:border-white/5 bg-white/70 dark:bg-zinc-950/20 backdrop-blur-3xl rounded-[3rem] ring-1 ring-inset ring-black/5 dark:ring-white/5 relative overflow-hidden group/rec">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-500 border border-amber-500/20">
                      <Lightbulb sx={{ fontSize: 28 }} />
                    </div>
                    <Typography variant="h5" className="font-black text-gray-900 dark:text-white tracking-tight uppercase">Strategic Directives</Typography>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {prediction.recommendations.map((rec, i) => (
                      <motion.div key={i} whileHover={{ x: 10 }} className="p-6 bg-gray-50 dark:bg-white/5 hover:bg-blue-500/5 border border-gray-100 dark:border-white/5 hover:border-blue-500/20 rounded-3xl transition-all duration-300 flex gap-5 items-start">
                        <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] shrink-0" />
                        <Typography className="text-sm font-bold text-gray-600 dark:text-zinc-300 leading-relaxed tracking-tight italic">
                          {rec}
                        </Typography>
                      </motion.div>
                    ))}
                  </div>
                </Paper>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
