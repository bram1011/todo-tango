import { NextResponse, type NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'

const prisma = new PrismaClient()

export async function GET (req: NextRequest): Promise<Response> {
    const response = new NextResponse()
    const session = await getSession(req, response)
    const todoListId = req.nextUrl.searchParams.get('todoListId')
    let userId = req.nextUrl.searchParams.get('userId')

    if (todoListId != null) {
        const list = await prisma.todoList.findUnique({ where: { id: todoListId }, include: { todos: true } })
        if (list == null) {
            return NextResponse.json('List not found', { status: 404 })
        }
        return NextResponse.json(list)
    }

    if (userId != null || session?.idToken != null) {
        if (userId == null && session?.idToken != null) userId = session.idToken
        const lists = await prisma.todoList.findMany({ where: { users: { has: userId } } })
        if (lists == null || lists.length === 0) {
            return NextResponse.json('No lists found', { status: 404 })
        }
        return NextResponse.json(lists)
    }

    return NextResponse.json('Query parameters must be provided', { status: 400 })
}

export async function PUT (req: NextRequest): Promise<Response> {
    const response = new NextResponse()
    const todoList = await req.json()
    const session = await getSession(req, response)
    if (session?.idToken == null) {
        return NextResponse.json('Session not found', { status: 401 })
    }
    const todoListRecord = await prisma.todoList.create({
        data: {
            name: todoList.name,
            description: todoList.description,
            users: [session.idToken]
        }
    })
    return NextResponse.json(todoListRecord)
}
