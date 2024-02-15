import { type Todo } from '@prisma/client'
import { type IncomingMessage } from 'http'
import { type WebSocket, type WebSocketServer } from 'ws'
import prisma from '@/util/prisma'
import { type SocketAction, type TodoAction, ActionType } from '@/types'

export function SOCKET (
    client: WebSocket,
    request: IncomingMessage,
    server: WebSocketServer
): void {
    client.on('message', (message) => {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const socketAction = JSON.parse(message.toString()) as SocketAction
        if (socketAction.type == null) {
            client.send('Invalid action')
            return
        }
        if (socketAction.user != null) {
            notifyClients(server, JSON.stringify({ type: ActionType.NEW_USER, user: socketAction.user } satisfies TodoAction))
        }
        switch (socketAction.type) {
            case ActionType.ADD_TODO:
                if (socketAction.todo == null) break
                addTodo(socketAction.todo).then((todoRecord) => {
                    notifyClients(server, JSON.stringify({ todo: todoRecord, tempId: socketAction.todo?.id, type: ActionType.ADD_TODO } satisfies TodoAction))
                }).catch((error) => { console.error(error) })
                break
            case ActionType.ORDER_TODOS:
                if (socketAction.todos == null) break
                updateOrder(socketAction.todos).then(() => {
                    notifyClients(server, JSON.stringify({ type: ActionType.SET_TODOS, todos: socketAction.todos } satisfies TodoAction))
                }).catch((error) => { console.error(error) })
                break
            case ActionType.UPDATE_TODO:
            case ActionType.EDIT_TODO:
                if (socketAction.todo == null) break
                editTodo(socketAction.todo).then((todoRecord) => {
                    notifyClients(server, JSON.stringify({ type: ActionType.EDIT_TODO, todo: todoRecord } satisfies TodoAction))
                }).catch((error) => { console.error(error) })
                break
            case ActionType.DELETE_TODO:
                if (socketAction.todoId == null) break
                deleteTodo(socketAction.todoId).then((todoRecord) => {
                    notifyClients(server, JSON.stringify({ type: ActionType.DELETE_TODO, todo: todoRecord } satisfies TodoAction))
                }).catch((error) => { console.error(error) })
                break
            case ActionType.NEW_USER:
                if (socketAction.user == null) break
                notifyClients(server, JSON.stringify({ type: ActionType.NEW_USER, user: socketAction.user } satisfies TodoAction))
                break
            case ActionType.REMOVE_USER:
                if (socketAction.email == null) break
                notifyClients(server, JSON.stringify({ type: ActionType.REMOVE_USER, email: socketAction.email } satisfies TodoAction))
                break
            default:
                client.send('Invalid action')
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
        console.log('Ordering todo ', todo.id)
        await prisma.todo.update({
            where: { id: todo.id },
            data: { order: todo.order }
        })
    }
}

async function editTodo (todo: Todo): Promise<Todo> {
    console.log('Editing todo ', todo.id)
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
    console.log('Deleting todo ', todoId)
    const todoRecord = await prisma.todo.delete({
        where: { id: todoId }
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
    console.log('Added todo ', todoRecord.id)
    return todoRecord
}
