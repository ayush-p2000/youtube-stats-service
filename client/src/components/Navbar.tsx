'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { Youtube } from 'lucide-react'

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 group transition-transform hover:scale-105"
                >
                    <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                        <Youtube className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tight bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        YT Stats
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}
