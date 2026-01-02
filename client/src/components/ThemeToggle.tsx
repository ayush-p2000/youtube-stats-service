'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { LightMode, DarkMode } from '@mui/icons-material'

export default function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const isClient = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    )

    if (!isClient) {
        return <div className="h-9 w-9" />
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
            aria-label="Toggle theme"
        >
            {resolvedTheme === 'dark' ? (
                <LightMode className="h-5 w-5 text-yellow-500" />
            ) : (
                <DarkMode className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
        </button>
    )
}
