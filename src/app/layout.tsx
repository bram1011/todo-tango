/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@fontsource/inter'
import './globals.css'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import 'reflect-metadata'
import { CssVarsProvider } from '@mui/joy/styles'
import { Divider, Link, Sheet, Stack, Typography } from '@mui/joy'
import React from 'react'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import LogOutButton from '@/component/LogOutButton'

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
                        <UserProvider>
                            <Sheet variant='soft' className='h-screen w-screen flex justify-center align-center'>
                                <Stack direction='column'>
                                    <Sheet variant='outlined' className='w-screen max-h-36 mb-32'>
                                        <Stack className='p-4' direction='row' justifyContent='space-between' alignItems='center' divider={<Divider orientation="vertical" />}>
                                            <Link href='https://bramhampton.com'>Visit my website</Link>
                                            <Typography level='h1'>Bram's To-Do List</Typography>
                                            <LogOutButton />
                                        </Stack>
                                    </Sheet>
                                    {children}
                                </Stack>
                            </Sheet>
                        </UserProvider>
                    </CssVarsProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    )
}
