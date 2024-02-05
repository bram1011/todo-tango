import { type Todo } from '@prisma/client'
import { type IncomingMessage } from 'http'
import { type WebSocket, type WebSocketServer } from 'ws'
import prisma from '@/util/prisma'
import { type TodoAction } from '@/types'

export function SOCKET (
    client: WebSocket,
    request: IncomingMessage,
    server: WebSocketServer
): void {
    client.on('message', (message) => {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const messageJson = JSON.parse(message.toString())
        if (messageJson.action == null) {
            client.send('Invalid action')
            return
        }
        if (messageJson.action === 'ping') {
            client.send('pong')
        }
        if (messageJson.action === 'addTodo') {
            const todo = messageJson.todo as Todo
            addTodo(todo).then((todoRecord) => {
                notifyClients(server, JSON.stringify({ todo: todoRecord, tempId: todo.id, type: 'ADD_TODO' } satisfies TodoAction))
            }).catch((error) => { console.error(error) })
        }
        if (messageJson.action === 'completeTodo') {
            const todoId = messageJson.todoId as string
            completeTodo(todoId).then((todoRecord) => {
                notifyClients(server, JSON.stringify({ type: 'UPDATE_TODO', todo: todoRecord } satisfies TodoAction))
            }).catch((error) => { console.error(error) })
        }
        if (messageJson.action === 'uncompleteTodo') {
            const todoId = messageJson.todoId as string
            uncompleteTodo(todoId).then((todoRecord) => {
                notifyClients(server, JSON.stringify({ type: 'UPDATE_TODO', todo: todoRecord } satisfies TodoAction))
            }).catch((error) => { console.error(error) })
        }
        if (messageJson.action === 'editTodo') {
            const todo = messageJson.todo as Todo
            editTodo(todo).then((todoRecord) => {
                notifyClients(server, JSON.stringify({ type: 'UPDATE_TODO', todo: todoRecord } satisfies TodoAction))
            }).catch((error) => { console.error(error) })
        }
        if (messageJson.action === 'deleteTodo') {
            const todoId = messageJson.todoId as string
            deleteTodo(todoId).then((todoRecord) => {
                notifyClients(server, JSON.stringify({ type: 'DELETE_TODO', todo: todoRecord } satisfies TodoAction))
            }).catch((error) => { console.error(error) })
        }
        if (messageJson.action === 'orderTodos') {
            const todos = messageJson.todos as Todo[]
            updateOrder(todos).then(() => {
                notifyClients(server, JSON.stringify({ type: 'SET_TODOS', todos } satisfies TodoAction))
            }).catch((error) => { console.error(error) })
        }
    })
}

function notifyClients (server: WebSocketServer, message: string): void {
    server.clients.forEach((client) => {
        client.send(message)
    })
}

async function updateOrder (todos: Todo[]): Promise<void> {
    for (const todo of todos) {
        await prisma.todo.update({
            where: { id: todo.id },
            data: { order: todo.order }
        })
    }
}

async function editTodo (todo: Todo): Promise<Todo> {
    const todoRecord = await prisma.todo.update({
        where: { id: todo.id },
        data: {
            name: todo.name,
            description: todo.description,
            completed: todo.completed,
            order: todo.order,
            todoList: {
                connect: { id: todo.todoListId }
            }
        }
    })
    return todoRecord
}

async function deleteTodo (todoId: string): Promise<Todo> {
    const todoRecord = await prisma.todo.delete({
        where: { id: todoId }
    })
    return todoRecord
}

async function completeTodo (todoId: string): Promise<Todo> {
    const todoRecord = await prisma.todo.update({
        where: { id: todoId },
        data: { completed: true }
    })
    return todoRecord
}

async function uncompleteTodo (todoId: string): Promise<Todo> {
    const todoRecord = await prisma.todo.update({
        where: { id: todoId },
        data: { completed: false }
    })
    return todoRecord
}

async function addTodo (todo: Todo): Promise<Todo> {
    const todoRecord = await prisma.todo.create({
        data: {
            name: todo.name,
            description: todo.description,
            completed: false,
            order: todo.order,
            todoList: {
                connect: { id: todo.todoListId }
            }
        }
    })
    return todoRecord
}
