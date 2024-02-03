/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import '@fontsource/inter'
import './globals.css'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import 'reflect-metadata'
import { CssVarsProvider } from '@mui/joy/styles'
import { Sheet, Stack } from '@mui/joy'
import React from 'react'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import LogOutButton from '@/component/LogOutButton'
import Sidebar from '@/component/Sidebar'

export const metadata: Metadata = {
    title: "Bram's To-Do List"
}

export default function RootLayout ({
    children
}: {
    children: React.ReactNode
}): JSX.Element {
    return (
        <html lang="en">
            <body>
                <AppRouterCacheProvider>
                    <CssVarsProvider>
                        <UserProvider>
                            <Sheet variant='soft' className='h-screen w-screen flex justify-center align-center'>
                                <Stack direction='column' className='w-full'>
                                    <Sheet variant='plain' className='mb-32'>
                                        <Stack direction={{ md: 'row', sm: 'column' }} className='p-4' justifyContent='space-between' alignItems='center' spacing={2}>
                                            <Sidebar />
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
