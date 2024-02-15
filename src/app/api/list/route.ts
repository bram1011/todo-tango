import { NextResponse, type NextRequest } from 'next/server'
import prisma from '@/util/prisma'
import { getSession } from '@auth0/nextjs-auth0'

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

    if (userId != null || session?.user.email != null) {
        if (userId == null && session?.user.email != null) userId = session.user.email
        const lists = await prisma.todoList.findMany({
            orderBy: {
                updatedAt: 'desc'
            },
            where: {
                users: { has: userId }
            }
        })
        if (lists == null || lists.length === 0) {
            return NextResponse.json('No lists found', { status: 404 })
        }
        return NextResponse.json(lists)
    }

    return NextResponse.json('Query parameters must be provided', { status: 400 })
}

export async function DELETE (req: NextRequest): Promise<Response> {
    const response = new NextResponse()
    const session = await getSession(req, response)
    const todoListId = req.nextUrl.searchParams.get('todoListId')
    if (todoListId == null) {
        return NextResponse.json('todoListId must be provided', { status: 400 })
    }
    const todoList = await prisma.todoList.findUnique({ where: { id: todoListId } })
    if (todoList == null) {
        return NextResponse.json('List not found', { status: 404 })
    }
    if (todoList.users.some((email: string) => email === session?.user.email) as boolean) {
        const deletedRecord = await prisma.todoList.delete({ where: { id: todoListId } })
        return NextResponse.json(deletedRecord)
    }
    return NextResponse.json('User does not have permission to delete list', { status: 401 })
}

export async function PUT (req: NextRequest): Promise<Response> {
    const response = new NextResponse()
    const todoList = await req.json()
    const session = await getSession(req, response)
    if (session?.idToken == null || session?.user == null) {
        return NextResponse.json('Session not found', { status: 401 })
    }
    if (todoList.id == null) {
        const todoListRecord = await prisma.todoList.create({
            data: {
                name: todoList.name,
                description: todoList.description,
                users: [session.user.email]
            }
        })
        return NextResponse.json(todoListRecord)
    }
    const todoListRecord = await prisma.todoList.update({
        data: {
            name: todoList.name,
            description: todoList.description,
            users: [session.user.email]
        },
        where: { id: todoList.id }
    })
    return NextResponse.json(todoListRecord)
}
