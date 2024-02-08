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
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <body>
                <AppRouterCacheProvider>
                    <CssVarsProvider theme={theme}>
                        <UserProvider>
                            <Sheet variant='soft' className='h-screen w-screen flex justify-center align-center'>
                                <Stack direction='column' className='w-full'>
                                    <Sheet variant='plain' className='mb-32'>
                                        <Stack direction={{ md: 'row', sm: 'column', xs: 'column' }} className='p-4' justifyContent='space-between' alignItems='center' spacing={2}>
                                            <Stack direction='row' spacing={2}>
                                                <Sidebar />
                                                <DarkModeToggle />
                                            </Stack>
                                            <Stack direction='row' spacing={2} display={{ sm: 'none', md: 'flex', xs: 'none' }}>
                                                <Image src={logo} alt='Todo Tango' width={50} />
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
