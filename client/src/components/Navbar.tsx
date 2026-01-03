'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { PlayArrow } from '@mui/icons-material'
import { motion } from 'framer-motion'

export default function Navbar() {
    return (
        <nav className="sticky top-0 left-0 right-0 z-100 bg-white/70 dark:bg-black/40 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 transition-all duration-500 overflow-hidden">
            {/* Shimmer Border Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-red-500/50 to-transparent animate-[shimmer_3s_infinite] opacity-30" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-4 group"
                >
                    <div className="relative flex items-center justify-center">
                        {/* Orbital Rings / Futuristic Logo Base */}
                        <div className="absolute inset-0 bg-red-600/20 rounded-xl blur-md group-hover:bg-red-600/40 transition-colors duration-500" />

                        <motion.div
                            className="relative w-11 h-11 bg-linear-to-br from-red-600 to-rose-700 rounded-xl flex items-center justify-center shadow-xl shadow-red-600/20"
                            whileHover={{ scale: 1.05, rotate: -5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <PlayArrow className="h-6 w-6 text-white" />

                            {/* Technical Orbital Accents */}
                            <div className="absolute -inset-1 border border-red-500/30 rounded-xl animate-[spin_8s_linear_infinite]" />
                            <div className="absolute -inset-2 border border-red-500/10 rounded-xl animate-[spin_12s_linear_infinite_reverse]" />
                        </motion.div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-400 dark:text-zinc-500 leading-none mb-1">
                            Neural Node
                        </span>
                        <span className="font-black text-lg sm:text-xl tracking-tighter text-gray-900 dark:text-white group-hover:bg-linear-to-r group-hover:from-red-600 group-hover:to-rose-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                            YouTube Video Analytics
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-5">
                    <motion.div
                        className="h-10 w-px bg-linear-to-b from-transparent via-gray-200 dark:via-white/10 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                    <div className="bg-gray-100 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-inner">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    )
}