"use client";

import React from "react";
import { useAppSelector } from "@/lib/hooks";
import { Tag, Info } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Paper, Typography } from "@mui/material";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8 }
  }
};

const borderBeamAnimation = `
    @keyframes moveBeam {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
    }
`;

export default function TopicExtraction() {
  const { sentiment, sentimentLoading } = useAppSelector(
    (state) => state.video
  );

  if (!sentiment || !sentiment.topics || sentiment.topics.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 sm:p-10 space-y-12 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-2000">
      <style jsx global>{borderBeamAnimation}</style>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-600 dark:text-cyan-500 border border-cyan-500/20 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
            <Tag sx={{ fontSize: 28 }} />
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3">
              Conversation <span className="text-cyan-600 dark:text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">Clusters</span>
            </h3>
            <p className="text-gray-500 dark:text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em] mt-1 flex items-center gap-2">
              Keyword Extraction <span className="w-8 h-px bg-gray-200 dark:bg-white/10" /> Semantic Map
            </p>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`relative group ${sentimentLoading ? "opacity-30 blur-sm pointer-events-none transition-all duration-700" : "opacity-100 transition-all duration-700"}`}
      >
        <Paper
          elevation={0}
          sx={{ bgcolor: 'transparent' }}
          className="p-10 border border-gray-200/50 dark:border-white/10 bg-white/70 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl ring-1 ring-inset ring-black/5 dark:ring-white/5 relative overflow-hidden"
        >
          {/* Border Beam */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute top-0 left-0 w-[40%] h-[2px] bg-linear-to-r from-cyan-500 via-teal-400 to-transparent animate-[moveBeam_4s_linear_infinite]" />
            <div className="absolute bottom-0 right-0 w-[40%] h-[2px] bg-linear-to-l from-cyan-500 via-teal-400 to-transparent animate-[moveBeam_4s_linear_infinite]" />
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center md:justify-start relative z-10">
            {sentiment.topics.map((topic) => (
              <motion.div
                key={topic.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group/tag relative"
              >
                <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-teal-500 rounded-2xl blur opacity-0 group-hover/tag:opacity-30 transition duration-500" />
                <div className="relative flex items-center gap-3 px-6 py-4 bg-gray-50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/5 hover:border-cyan-500/50 rounded-2xl transition-all duration-300 cursor-default shadow-lg">
                  <Tag sx={{ fontSize: 16 }} className="text-cyan-600 dark:text-cyan-500 group-hover/tag:animate-pulse" />
                  <Typography className="text-sm sm:text-base font-black text-gray-800 dark:text-zinc-200 uppercase tracking-widest">
                    {topic.name}
                  </Typography>
                  <div className="flex items-center justify-center min-w-[28px] h-[28px] bg-cyan-500/10 rounded-xl px-2.5 border border-cyan-500/20">
                    <Typography className="text-[10px] font-black text-cyan-600 dark:text-cyan-500">
                      {topic.count}
                    </Typography>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-zinc-950/20 rounded-2rem border border-gray-200 dark:border-white/5 relative z-10 ring-1 ring-inset ring-black/5 dark:ring-white/5">
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-500 border border-cyan-500/20">
              <Info sx={{ fontSize: 20 }} />
            </div>
            <Typography className="text-[11px] font-bold text-gray-500 dark:text-zinc-500 leading-relaxed uppercase tracking-widest text-center md:text-left">
              These high-density keywords represent the core thematic clusters identified within the audience conversation matrix.
            </Typography>
          </div>
        </Paper>
      </motion.div>
    </div>
  );
}
