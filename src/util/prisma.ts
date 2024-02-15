import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = (): PrismaClient => {
    return new PrismaClient()
}

declare global {
    // eslint-disable-next-line no-var
    var prisma: ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
