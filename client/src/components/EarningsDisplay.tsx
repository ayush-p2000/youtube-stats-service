"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../lib/store";
import { fetchEarnings, VideoStats, SentimentData, Comment } from "../lib/features/videoSlice";
import {
    motion,
    AnimatePresence
} from "framer-motion";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import {
    AccountBalanceWallet,
    AttachMoney,
    TrendingUp,
    CalendarMonth,
    InfoOutlined,
    AutoAwesome,
    BarChart,
    Bolt,
    ArrowForward
} from "@mui/icons-material";
import {
    Paper,
    Typography
} from "@mui/material";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    color: 'emerald' | 'blue' | 'amber';
}

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 1.0 }
    }
};

const colorMap = {
    emerald: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        icon: 'text-emerald-600 dark:text-emerald-500',
        glow: 'shadow-emerald-500/10 dark:shadow-emerald-500/15',
        border: 'border-emerald-500/20',
        beam: 'from-emerald-500 via-emerald-400/50 to-transparent'
    },
    blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-600 dark:text-blue-500',
        glow: 'shadow-blue-500/10 dark:shadow-blue-500/15',
        border: 'border-blue-500/20',
        beam: 'from-blue-500 via-blue-400/50 to-transparent'
    },
    amber: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        icon: 'text-amber-600 dark:text-amber-500',
        glow: 'shadow-amber-500/10 dark:shadow-amber-500/15',
        border: 'border-amber-500/20',
        beam: 'from-amber-500 via-amber-400/50 to-transparent'
    }
};

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color }) => (
    <motion.div variants={itemVariants} className="h-full relative group">
        <Paper
            elevation={0}
            sx={{ bgcolor: 'transparent', transition: 'all 0.5s ease' }}
            className={`p-7 h-full border border-gray-200/50 dark:border-white/10 bg-white/70 dark:bg-zinc-950/40 backdrop-blur-2xl rounded-4xl flex flex-col justify-between hover:shadow-2xl ${colorMap[color].glow} relative overflow-hidden ring-1 ring-inset ring-black/5 dark:ring-white/5`}
        >
            {/* Border Beam Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}>
                <div className={`absolute top-0 left-0 w-[40%] h-[2px] bg-linear-to-r ${colorMap[color].beam} animate-[moveBeam_3s_linear_infinite]`} />
                <div className={`absolute bottom-0 right-0 w-[40%] h-[2px] bg-linear-to-l ${colorMap[color].beam} animate-[moveBeam_3s_linear_infinite]`} />
            </div>

            <div className={`absolute -top-12 -right-12 w-32 h-32 ${colorMap[color].bg} blur-3xl rounded-full transition-opacity duration-700 opacity-20 group-hover:opacity-50`} />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-3 rounded-2xl ${colorMap[color].bg} ${colorMap[color].icon} shadow-inner backdrop-blur-sm`}>
                    <Icon sx={{ fontSize: 24 }} />
                </div>
                <div className="flex flex-col items-end">
                    <Typography className="text-gray-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1.5">
                        {title}
                    </Typography>
                    <Typography variant="h4" className="text-gray-900 dark:text-white font-black tracking-tighter tabular-nums">
                        {value}
                    </Typography>
                </div>
            </div>

            <div className="relative z-10">
                <Typography className="text-gray-600 dark:text-zinc-400 text-xs font-bold flex items-center gap-2.5">
                    <TrendingUp sx={{ fontSize: 16 }} className={colorMap[color].icon} />
                    {subtitle}
                </Typography>
            </div>
        </Paper>
    </motion.div>
);

const EarningsDisplay: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        videoId,
        stats,
        sentiment,
        comments,
        earnings,
        earningsLoading
    } = useSelector((state: RootState) => state.video);

    const handleFetchEarnings = () => {
        if (videoId && stats) {
            dispatch(fetchEarnings({
                videoId,
                stats: stats as VideoStats,
                sentiment: (sentiment || undefined) as SentimentData | undefined,
                comments: (comments || undefined) as Comment[] | undefined
            }));
        }
    };

    if (!stats) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 1.5, staggerChildren: 0.2 }
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 sm:p-10 space-y-10 sm:space-y-16 mb-32">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative">
                <div className="flex items-center gap-5 relative z-10">
                    <div className="p-5 bg-emerald-500/10 rounded-4xl text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 backdrop-blur-md">
                        <AccountBalanceWallet sx={{ fontSize: 36 }} />
                    </div>
                    <div>
                        <h3 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-4">
                            AI Earnings <span className="text-emerald-600 dark:text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Forecast</span>
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-500 font-black uppercase text-[11px] tracking-[0.4em] mt-2 flex items-center gap-2">
                            Neural Network <span className="w-8 h-px bg-zinc-800 dark:bg-white/10" /> Revenue Matrix
                        </p>
                    </div>
                </div>

                <div className="relative group p-[2.5px] rounded-3xl overflow-hidden w-[320px]">
                    <div className="absolute -inset-full cursor-pointer bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#10b981_360deg)] animate-[spin_3s_linear_infinite] opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                    <button
                        onClick={handleFetchEarnings}
                        disabled={earningsLoading}
                        className="relative w-full px-10 cursor-pointer py-5 bg-white dark:bg-zinc-950 text-black dark:text-white rounded-[1.4rem] font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 transform active:scale-95 disabled:opacity-50 overflow-hidden flex items-center justify-center gap-4"
                    >
                        <div className="absolute inset-0 w-1/4 h-full bg-linear-to-r from-transparent via-emerald-500/20 to-transparent skew-x-[-30deg] animate-[shimmer_2s_infinite]" />

                        <div className="flex items-center gap-3 relative z-10">
                            {earningsLoading ? (
                                <>
                                    <div className="h-5 w-5 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="animate-pulse">Analyzing Streams...</span>
                                </>
                            ) : (
                                <>
                                    <AutoAwesome sx={{ fontSize: 24 }} className="text-emerald-600 dark:text-emerald-500 animate-pulse" />
                                    <span>{earnings ? "Recalculate Matrix" : "Compute Forecast"}</span>
                                    <ArrowForward sx={{ fontSize: 18 }} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {earnings && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="space-y-12 sm:space-y-16"
                    >
                        {/* Top Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                            <StatCard
                                title="Net Lifetime"
                                value={`$${earnings.total_earnings}`}
                                subtitle="Estimated Gross Potential"
                                icon={AttachMoney}
                                color="emerald"
                            />
                            <StatCard
                                title="Impression CPM"
                                value={`$${earnings.estimated_cpm}`}
                                subtitle="Global Audience Weight"
                                icon={BarChart}
                                color="blue"
                            />
                            <StatCard
                                title="Creator RPM"
                                value={`$${earnings.estimated_rpm}`}
                                subtitle="Network Average Return"
                                icon={Bolt}
                                color="amber"
                            />
                        </div>

                        {/* Analysis Detail Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Forecast Milestones */}
                            <motion.div variants={itemVariants} className="lg:col-span-5 h-full">
                                <Paper elevation={0} sx={{ bgcolor: 'transparent' }} className="p-10 border border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-[3rem] h-full shadow-2xl relative overflow-hidden group ring-1 ring-inset ring-black/5 dark:ring-white/5">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                    <div className="flex items-center justify-between mb-12 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 shadow-inner">
                                                <TrendingUp sx={{ fontSize: 28 }} />
                                            </div>
                                            <Typography variant="h5" className="text-gray-900 dark:text-white font-black tracking-tight">
                                                Revenue Nodes
                                            </Typography>
                                        </div>
                                        <div className="px-5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 backdrop-blur-md">
                                            CONFIDENCE: {earnings.confidence_score}%
                                        </div>
                                    </div>

                                    <div className="space-y-8 relative z-10">
                                        {[
                                            { label: "Daily Node", value: earnings.forecast.daily, period: "24H ACTIVE SNAPSHOT" },
                                            { label: "Weekly Wave", value: earnings.forecast.weekly, period: "7D MOMENTUM FORECAST", highlight: true },
                                            { label: "Monthly Peak", value: earnings.forecast.monthly, period: "30D STRATEGIC PROJECTION" }
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ scale: 1.01, x: 8 }}
                                                className={`p-7 rounded-4xl flex items-center justify-between transition-all duration-500 border ${item.highlight ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/10' : 'bg-transparent border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                            >
                                                <div>
                                                    <Typography className="text-gray-500 dark:text-zinc-400 text-[11px] font-black uppercase tracking-[0.25em]">{item.label}</Typography>
                                                    <Typography className="text-gray-400 dark:text-zinc-500 text-[9px] font-bold mt-1 opacity-60 tracking-widest">{item.period}</Typography>
                                                </div>
                                                <div className="text-right">
                                                    <Typography className={`text-3xl font-black tabular-nums ${item.highlight ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                                                        +${item.value}
                                                    </Typography>
                                                    <span className="text-[10px] text-zinc-500 font-black flex items-center justify-end gap-1.5 uppercase tracking-tighter mt-1 opacity-80">
                                                        COMPUTED <TrendingUp sx={{ fontSize: 12 }} />
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Paper>
                            </motion.div>

                            {/* Revenue Trend Area Chart */}
                            <motion.div variants={itemVariants} className="lg:col-span-7 h-full">
                                <Paper elevation={0} sx={{ bgcolor: 'transparent' }} className="p-10 border border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-[3rem] h-full shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden group ring-1 ring-inset ring-black/5 dark:ring-white/5">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                    <div className="flex items-center justify-between mb-12 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-500 border border-blue-500/20 shadow-inner">
                                                <CalendarMonth sx={{ fontSize: 28 }} />
                                            </div>
                                            <Typography variant="h5" className="text-gray-900 dark:text-white font-black tracking-tight">
                                                Revenue Momentum
                                            </Typography>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] opacity-80">30D HISTORICAL MATRIX</div>
                                    </div>

                                    <div className="flex-1 w-full relative z-10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={earnings.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="8 8" stroke="#e2e8f0" vertical={false} className="dark:hidden" />
                                                <CartesianGrid strokeDasharray="8 8" stroke="#ffffff" opacity={0.03} vertical={false} className="hidden dark:block" />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#94a3b8"
                                                    fontSize={10}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fill: '#71717a', fontWeight: '900', letterSpacing: '0.1em' }}
                                                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                                />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    fontSize={10}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fill: '#71717a', fontWeight: '900' }}
                                                    tickFormatter={(val) => `$${val}`}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        backdropFilter: 'blur(20px)',
                                                        borderColor: 'rgba(0, 0, 0, 0.05)',
                                                        borderRadius: '2rem',
                                                        border: '1px solid rgba(0,0,0,0.05)',
                                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                                                        color: '#18181b',
                                                        padding: '24px'
                                                    }}
                                                    itemStyle={{ color: '#059669', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}
                                                    cursor={{ stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="earnings"
                                                    stroke="#10b981"
                                                    strokeWidth={5}
                                                    fillOpacity={1}
                                                    fill="url(#colorEarnings)"
                                                    animationDuration={3000}
                                                    animationEasing="ease-in-out"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Paper>
                            </motion.div>
                        </div>

                        {/* Footer Disclaimer */}
                        <motion.div variants={itemVariants} className="p-10 bg-zinc-950/5 dark:bg-white/2 border border-gray-200/50 dark:border-white/5 backdrop-blur-3xl rounded-[3rem] flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden group ring-1 ring-inset ring-black/5 dark:ring-white/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />

                            <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500 shadow-2xl shadow-emerald-500/10 border border-emerald-500/20 backdrop-blur-md relative z-10">
                                <InfoOutlined sx={{ fontSize: 32 }} />
                            </div>
                            <div className="relative z-10">
                                <Typography className="text-gray-900 dark:text-zinc-100 font-black uppercase text-[12px] block mb-2 tracking-[0.4em] drop-shadow-sm">
                                    Neural Methodology & Dynamic Disclaimer
                                </Typography>
                                <Typography className="text-gray-600 dark:text-zinc-500 text-sm leading-relaxed font-bold max-w-5xl tracking-tight opacity-70">
                                    Projections are generated via temporal regression analysis across multi-dimensional engagement signals. This involves heavy heuristic modeling of ad fill rates and regional CPM fluctuations. Actual payouts are governed by individual YouTube Partner Program agreements and real-world ad inventory dynamics.
                                </Typography>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-200%) skewX(-30deg); }
                    100% { transform: translateX(300%) skewX(-30deg); }
                }
                @keyframes moveBeam {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(250%); }
                }
            `}</style>
        </div>
    );
};

export default EarningsDisplay;
