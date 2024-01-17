'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import ListOfLists from '@/component/ListOfLists'

export default function Home (): React.JSX.Element {
    return (
        <SessionProvider>
            <ListOfLists />
        </SessionProvider>
    )
}
