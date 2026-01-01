'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const isClient = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    )

    if (!isClient) {
        return <div className="p-2 h-10 w-10" />
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700 shadow-sm"
            aria-label="Toggle theme"
        >
            {resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            ) : (
                <Moon className="h-5 w-5 text-gray-700 fill-gray-700" />
            )}
        </button>
    )
}
