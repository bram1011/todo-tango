import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET (req: NextRequest): Promise<Response> {
    const todoListId = req.nextUrl.searchParams.get('todoListId')
    const userId = req.nextUrl.searchParams.get('userId')

    if (todoListId != null) {
        const list = await prisma.todoList.findUnique({ where: { id: todoListId } })
        if (list == null) {
            return NextResponse.json('List not found', { status: 404 })
        }
        return NextResponse.json(list)
    }

    if (userId != null) {
        const lists = await prisma.todoList.findMany({ where: { users: { some: { id: userId } } } })
        if (lists == null || lists.length === 0) {
            return NextResponse.json('No lists found', { status: 404 })
        }
        return NextResponse.json(lists)
    }

    return NextResponse.json('Query parameters must be provided', { status: 400 })
}

export async function PUT (req: NextRequest): Promise<Response> {
    const todoList = await req.json()
    const session = await getServerSession({ req, ...authOptions })
    const user = await prisma.user.findUnique({ where: { id: session?.userId } })
    if (user == null) {
        return NextResponse.json('User not found', { status: 401 })
    }
    const todoListRecord = await prisma.todoList.create({
        data: {
            name: todoList.name,
            description: todoList.description,
            users: {
                connect: [{ id: user.id }]
            }
        }
    })
    return NextResponse.json(todoListRecord)
}
