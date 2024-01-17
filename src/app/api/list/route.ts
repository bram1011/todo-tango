import TodoList from '@/entity/TodoList'
import { AppDataSource, initializeDataSource } from '@/data-source'
import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { UserEntity } from '@/entity/userEntities'

export async function GET (req: NextRequest): Promise<Response> {
    await initializeDataSource()
    const todoListId = req.nextUrl.searchParams.get('todoListId')
    const userId = req.nextUrl.searchParams.get('userId')

    if (todoListId != null) {
        const list = await AppDataSource.manager.findOneBy(TodoList, { id: todoListId })
        if (list == null) {
            return NextResponse.json('List not found', { status: 404 })
        }
        return NextResponse.json(list)
    }

    if (userId != null) {
        const lists = await AppDataSource.manager.findBy(TodoList, { users: { id: userId } })
        return NextResponse.json(lists)
    }

    return NextResponse.json('Query parameters must be provided', { status: 400 })
}

export async function PUT (req: NextRequest): Promise<Response> {
    await initializeDataSource()
    const todoList = await req.json() as TodoList
    const session = await getServerSession({ req, ...authOptions })
    const user = await AppDataSource.manager.findOneBy(UserEntity, { id: session?.userId })
    if (user == null) {
        return NextResponse.json('User not found', { status: 401 })
    }
    todoList.users = [user]
    const todoListRecord = await AppDataSource.manager.save(TodoList, todoList)
    return NextResponse.json(todoListRecord)
}
