import { type NextRequest } from 'next/server'
import Todo from '@/entity/Todo'
import { AppDataSource, initializeDataSource } from '@/data-source'
import TodoList from '@/entity/TodoList'

export async function GET (req: NextRequest): Promise<Response> {
    await initializeDataSource()
    const todoId = req.nextUrl.searchParams.get('todoId')
    const todoListId = req.nextUrl.searchParams.get('todoListId')

    if (todoId != null) {
        const todo = await AppDataSource.manager.findOneBy(Todo, { id: todoId })
        return Response.json(todo)
    }

    if (todoListId != null) {
        const todoList = await AppDataSource.manager.findOneBy(TodoList, { id: todoListId })
        return Response.json(todoList?.todos)
    }

    return Response.json({ error: 'No todo found' }, { status: 404 })
}

export async function PUT (req: NextRequest): Promise<Response> {
    await initializeDataSource()
    const reqBody = await req.json()
    const todoListId = req.nextUrl.searchParams.get('todoListId')
    if (todoListId == null) {
        return Response.json({ error: 'No todo list given' }, { status: 400 })
    }
    const newTodo = new Todo()
    newTodo.name = reqBody.name
    newTodo.description = reqBody.description
    newTodo.completed = false
    const todoList = await AppDataSource.manager.findOneBy(TodoList, { id: todoListId })
    if (todoList == null) {
        return Response.json({ error: 'Todo list not found' }, { status: 400 })
    }
    newTodo.todoList = todoList
    const todo = await AppDataSource.manager.save(Todo, newTodo)
    return Response.json(todo)
}
