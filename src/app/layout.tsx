/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import '@fontsource/inter'
import './globals.css'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import 'reflect-metadata'
import { CssVarsProvider } from '@mui/joy/styles'
import { Sheet, Stack, Typography } from '@mui/joy'
import React from 'react'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import LogOutButton from '@/component/LogOutButton'
import Sidebar from '@/component/Sidebar'
import DarkModeToggle from '@/component/DarkModeToggle'
import Image from 'next/image'
import logo from './todo-tango.png'
import theme from '@/util/theme'
import favicon from '@/favicon.ico'

export const metadata: Metadata = {
    title: 'Todo Tango'
}

export default function RootLayout ({
    children
}: {
    children: React.ReactNode
}): JSX.Element {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href={favicon.src} />
            </head>
            <body>
                <AppRouterCacheProvider>
                    <CssVarsProvider theme={theme}>
                        <UserProvider>
                            <Sheet variant='soft' sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
                                <Stack direction='column' sx={{ width: '100%', height: '100%' }}>
                                    <Sheet variant='plain' sx={{ marginBottom: '5%' }}>
                                        <Stack direction={{ md: 'row', sm: 'column', xs: 'column' }} className='p-4' justifyContent='space-between' alignItems='center' spacing={2}>
                                            <Stack direction='row' spacing={2}>
                                                <Sidebar />
                                                <DarkModeToggle />
                                            </Stack>
                                            <Stack direction='row' alignItems='center' spacing={2} display={{ sm: 'none', md: 'flex', xs: 'none' }}>
                                                <Image src={logo} alt='Todo Tango' width={70} />
                                                <Typography level='h1'>Todo Tango</Typography>
                                            </Stack>
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
