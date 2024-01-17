/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import Google from 'next-auth/providers/google'
import { type AuthOptions } from 'next-auth'
import { TypeORMAdapter } from '@auth/typeorm-adapter'
import type { Adapter } from 'next-auth/adapters'
import { dataSourceOptions } from '@/data-source'

// Extend the Session interface with custom properties
declare module 'next-auth' {
    interface Session {
        userId?: string
    }
}

export const authOptions: AuthOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_OAUTH_CLIENT as string,
            clientSecret: process.env.GOOGLE_OAUTH_SECRET as string
        })
    ],
    adapter: TypeORMAdapter(dataSourceOptions) as Adapter,
    callbacks: {
        async session ({ session, user }) {
            session.userId = user.id
            return session
        }
    }
}
