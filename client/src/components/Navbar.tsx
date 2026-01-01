'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { PlayArrow } from '@mui/icons-material'

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-3 group transition-all duration-200 hover:opacity-90"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-600 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-200" />
                        <div className="relative bg-red-600 p-2 rounded-lg group-hover:bg-red-700 transition-all duration-200 shadow-lg">
                            <PlayArrow className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors duration-200">
                        YouTube Studio Analytics
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}
