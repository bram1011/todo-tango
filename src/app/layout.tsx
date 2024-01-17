import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@fontsource/inter'
import './globals.css'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import 'reflect-metadata'
import { CssVarsProvider } from '@mui/joy/styles'
import { Sheet } from '@mui/joy'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Bram\'s To-Do List'
}

export default function RootLayout ({
    children
}: {
    children: React.ReactNode
}): JSX.Element {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AppRouterCacheProvider>
                    <CssVarsProvider>
                        <Sheet variant='soft' className='h-screen w-screen flex justify-center align-center'>
                            {children}
                        </Sheet>
                    </CssVarsProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    )
}
