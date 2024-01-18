/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import Google from 'next-auth/providers/google'
import { type AuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { type Adapter } from 'next-auth/adapters'

// Extend the Session interface with custom properties
declare module 'next-auth' {
    interface Session {
        userId?: string
    }
}

export const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_OAUTH_CLIENT as string,
            clientSecret: process.env.GOOGLE_OAUTH_SECRET as string
        })
    ],
    adapter: PrismaAdapter(prisma) as Adapter,
    callbacks: {
        async session ({ session, user }) {
            session.userId = user.id
            return session
        }
    }
}
