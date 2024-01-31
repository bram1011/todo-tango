import { type NextRequest } from 'next/server'
import prisma from '@/util/prisma'

export async function GET (req: NextRequest): Promise<Response> {
    const todoId = req.nextUrl.searchParams.get('todoId')
    const todoListId = req.nextUrl.searchParams.get('todoListId')

    if (todoId != null) {
        const todo = await prisma.todo.findUnique({ where: { id: todoId } })
        return Response.json(todo ?? {})
    }

    if (todoListId != null) {
        const todoList = await prisma.todoList.findUnique({ where: { id: todoListId }, include: { todos: true } })
        if (todoList?.todos == null || todoList.todos.length === 0) {
            return Response.json('Todo items not found', { status: 404 })
        }
        return Response.json(todoList.todos)
    }

    return Response.json('No todo found', { status: 404 })
}

export async function PUT (req: NextRequest): Promise<Response> {
    const todo = await req.json()
    const todoListId = req.nextUrl.searchParams.get('todoListId')
    if (todoListId == null) {
        return Response.json('No todo list given', { status: 400 })
    }
    const todoListRecord = await prisma.todoList.findUnique({ where: { id: todoListId } })
    if (todoListRecord == null) {
        return Response.json('Todo list not found', { status: 400 })
    }
    const todoRecord = await prisma.todo.create({
        data: {
            name: todo.name,
            description: todo.description,
            completed: false,
            todoList: {
                connect: { id: todoListRecord.id }
            }
        },
        include: { todoList: true }
    })
    return Response.json(todoRecord)
}

export async function POST (req: NextRequest): Promise<Response> {
    const todo = await req.json()
    const todoId = req.nextUrl.searchParams.get('todoId')
    if (todoId == null && todo.id == null) {
        return Response.json('No todo given', { status: 400 })
    }
    const todoRecord = await prisma.todo.update({
        where: { id: todoId ?? todo.id },
        data: {
            name: todo.name,
            description: todo.description,
            completed: todo.completed
        }
    })
    return Response.json(todoRecord)
}
