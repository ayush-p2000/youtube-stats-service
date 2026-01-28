'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { LightMode, DarkMode } from '@mui/icons-material'

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch: only render actual toggle on client
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-9 w-9" />
    }

    const currentTheme = theme === 'dark' ? 'dark' : 'light'

    return (
        <button
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
            aria-label="Toggle theme"
        >
            {currentTheme === 'dark' ? (
                <LightMode className="h-5 w-5 text-yellow-500" />
            ) : (
                <DarkMode className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
        </button>
    )
}
