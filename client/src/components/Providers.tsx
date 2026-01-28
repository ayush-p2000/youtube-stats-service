'use client'

import React, { useState } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { ThemeProvider } from 'next-themes'

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [store] = useState(() => makeStore())

    return (
        <Provider store={store}>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem={false}
                disableTransitionOnChange={false}
                // Use a new storage key so old system-based values are ignored
                storageKey="yt-stats-theme-v2"
            >
                {children}
            </ThemeProvider>
        </Provider>
    )
}
