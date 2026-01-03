'use client';

import React from "react";
import { useAppSelector } from '@/lib/hooks';
import {
    Visibility,
    ThumbUp,
    Comment,
    TrendingUp,
    ChatBubbleOutline,
    Bolt,
    BarChart,
    LocalFireDepartment
} from '@mui/icons-material';
import { motion } from "framer-motion";
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
`;

interface StatBoxProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: 'blue' | 'red' | 'emerald' | 'purple';
    subtitle?: string;
    description?: string;
}

const colorMap = {
    blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-500',
        icon: 'text-blue-600 dark:text-blue-500',
        glow: 'shadow-blue-500/10',
        beam: 'from-blue-500 via-blue-400/50 to-transparent'
    },
    red: {
        bg: 'bg-red-500/10',
        text: 'text-red-600 dark:text-red-500',
        icon: 'text-red-600 dark:text-red-500',
        glow: 'shadow-red-500/10',
        beam: 'from-red-500 via-rose-400/50 to-transparent'
    },
    emerald: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-500',
        icon: 'text-emerald-600 dark:text-emerald-500',
        glow: 'shadow-emerald-500/10',
        beam: 'from-emerald-500 via-emerald-400/50 to-transparent'
    },
    purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-600 dark:text-purple-500',
        icon: 'text-purple-600 dark:text-purple-500',
        glow: 'shadow-purple-500/10',
        beam: 'from-purple-500 via-violet-400/50 to-transparent'
    }
};

const StatBox: React.FC<StatBoxProps> = ({ title, value, icon: Icon, color, subtitle, description }) => (
    <motion.div variants={itemVariants} className="h-full relative group">
        <Paper
            elevation={0}
            sx={{ bgcolor: 'transparent' }}
            className={`p-7 h-full border border-gray-200/50 dark:border-white/10 bg-white/70 dark:bg-zinc-950/40 backdrop-blur-2xl rounded-4xl flex flex-col justify-between hover:shadow-2xl transition-all duration-500 ring-1 ring-inset ring-black/5 dark:ring-white/5 relative overflow-hidden ${colorMap[color].glow}`}
        >
            {/* Border Beam */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className={`absolute top-0 left-0 w-[40%] h-[2px] bg-linear-to-r ${colorMap[color].beam} animate-[moveBeam_3s_linear_infinite]`} />
                <div className={`absolute bottom-0 right-0 w-[40%] h-[2px] bg-linear-to-l ${colorMap[color].beam} animate-[moveBeam_3s_linear_infinite]`} />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-3 rounded-2xl ${colorMap[color].bg} ${colorMap[color].icon} shadow-inner backdrop-blur-sm`}>
                    <Icon sx={{ fontSize: 24 }} />
                </div>
                <div className="flex flex-col items-end">
                    <Typography className="text-gray-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 opacity-80">
                        {title}
                    </Typography>
                    <Typography variant="h4" className="text-gray-900 dark:text-white font-black tracking-tighter tabular-nums">
                        {value}
                    </Typography>
                </div>
            </div>

            <div className="relative z-10 space-y-2">
                {subtitle && (
                    <Typography component="div" className="text-gray-600 dark:text-zinc-400 text-xs font-bold flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${colorMap[color].bg.replace('/10', '')}`} />
                        {subtitle}
                    </Typography>
                )}
                {description && (
                    <Typography className="text-[10px] text-gray-500 dark:text-zinc-500 font-medium leading-relaxed italic opacity-80">
                        &quot;{description}&quot;
                    </Typography>
                )}
            </div>
        </Paper>
    </motion.div>
);

export default function StatsDisplay() {
    const { stats, statsLoading } = useAppSelector((state) => state.video);

    if (statsLoading && !stats) return (
        <div className="w-full max-w-7xl mx-auto p-10 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-red-500/10 rounded-full animate-pulse">
                <div className="h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <Typography className="text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.4em] animate-pulse">
                Synchronizing Data Stream...
            </Typography>
        </div>
    );

    if (!stats) return (
        <div className="w-full max-w-7xl mx-auto p-10 text-center border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] bg-white/5 dark:bg-white/5 backdrop-blur-md">
            <Typography className="text-gray-400 dark:text-zinc-500 font-black uppercase tracking-[0.3em]">
                Empty Signal Detected.
            </Typography>
        </div>
    );

    const views = Number(stats.viewCount) || 0;
    const likes = Number(stats.likeCount) || 0;
    const comments = Number(stats.commentCount) || 0;

    const likabilityRatio = views > 0 ? (likes / views) * 100 : 0;
    const conversationDensity = views > 0 ? (comments / views) * 1000 : 0;
    const viralMomentum = views > 0 ? ((likes * 2 + comments * 5) / views) * 100 : 0;

    return (
        <div className="w-full max-w-7xl mx-auto p-6 sm:p-10 space-y-12 sm:space-y-20 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-2000">
            <style jsx global>{borderBeamAnimation}</style>

            {/* Header Content */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="space-y-6 relative"
            >
                <div className="flex flex-col sm:flex-row items-start gap-10 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="p-5 bg-linear-to-br from-red-500/10 to-rose-500/5 rounded-2xl text-red-600 dark:text-red-500 border border-red-500/20 shadow-xl shadow-red-500/10 backdrop-blur-md relative z-10">
                            <BarChart sx={{ fontSize: 40 }} className="animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-3 flex-1 min-w-0">
                        <Typography
                            variant="h3"
                            className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.05] wrap-break-word bg-linear-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent drop-shadow-sm group-hover:drop-shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all duration-1000 ease-out"
                        >
                            {stats.title}
                        </Typography>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                            className="flex mt-7 items-center gap-4"
                        >
                            <span className="h-px w-12 bg-red-500/30" />
                            <p className="text-gray-500 dark:text-zinc-500 font-bold uppercase text-[10px] sm:text-[12px] tracking-[0.5em] italic">
                                Video Engagement Matrix
                            </p>
                            <span className="h-px w-12 bg-red-500/30" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-10 sm:space-y-16"
            >
                {/* Core Engagement Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                    <StatBox
                        title="Total Reach"
                        value={views.toLocaleString()}
                        icon={Visibility}
                        color="blue"
                        subtitle="Unique View Impressions"
                    />
                    <StatBox
                        title="Fan Approval"
                        value={likes.toLocaleString()}
                        icon={ThumbUp}
                        color="red"
                        subtitle="Positive Feedback Signal"
                    />
                    <StatBox
                        title="Social Echo"
                        value={comments.toLocaleString()}
                        icon={Comment}
                        color="emerald"
                        subtitle="Active Comment Density"
                    />
                </div>

                {/* Performance Multipliers Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-500">
                            <TrendingUp sx={{ fontSize: 24 }} />
                        </div>
                        <Typography variant="h5" className="text-gray-900 dark:text-white font-black tracking-tight uppercase">
                            Heuristic Analytics
                        </Typography>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
                        <span className="text-[10px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-[0.3em] hidden sm:block">AI Models Active</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                        <StatBox
                            title="Likability Vector"
                            value={`${likabilityRatio.toFixed(2)}%`}
                            icon={LocalFireDepartment}
                            color="red"
                            subtitle="Core Audience Affinity"
                            description={likabilityRatio > 4 ? "Exceptional engagement! Fans are actively supporting." : likabilityRatio > 2 ? "Strong performance compared to average." : "Normal engagement levels for this view count."}
                        />
                        <StatBox
                            title="Interactive Density"
                            value={conversationDensity.toFixed(1)}
                            icon={ChatBubbleOutline}
                            color="blue"
                            subtitle="Interaction per 1K Views"
                            description={conversationDensity > 10 ? "Highly conversational. This video sparks deep debate." : conversationDensity > 3 ? "Good community interaction detected." : "Passive viewership. Less interaction than usual."}
                        />
                        <StatBox
                            title="Viral Momentum"
                            value={viralMomentum.toFixed(1)}
                            icon={Bolt}
                            color="purple"
                            subtitle="AI Propagation Score"
                            description={viralMomentum > 20 ? "Viral alert! The algorithm is likely pushing this hard." : viralMomentum > 10 ? "Gaining steady traction across the platform." : "Steady growth, but not currently hyper-viral."}
                        />
                    </div>
                </div>

                {/* Footer Matrix Status */}
                <div className="p-8 border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-zinc-950/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-between ring-1 ring-inset ring-black/5 dark:ring-white/5">
                    <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <Typography className="text-gray-500 dark:text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em]">
                            Matrix Synchronized: High-Fidelity
                        </Typography>
                    </div>
                    <div className="text-gray-400 dark:text-zinc-600 font-bold text-[9px] tracking-widest uppercase">
                        Ref: YT-API v3.0
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
