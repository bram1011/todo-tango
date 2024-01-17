/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import NextAuth from 'next-auth/next'
import { authOptions } from '@/util/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
