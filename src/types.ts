import { type Todo, type TodoList } from '@prisma/client'

export interface TodoListWithTodos extends TodoList {
    todos: Todo[]
}

export interface TodoDto {
    name: string
    description: string
    todoListId: string
}

export interface ActiveUser {
    email: string
    name: string
    picture: string | null
}

export enum ActionType {
    ADD_TODO = 'ADD_TODO',
    UPDATE_TODO = 'UPDATE_TODO',
    SET_TODOS = 'SET_TODOS',
    DELETE_TODO = 'DELETE_TODO',
    NEW_USER = 'NEW_USER',
    REMOVE_USER = 'REMOVE_USER',
    SET_USERS = 'SET_USERS',
    ORDER_TODOS = 'ORDER_TODOS',
    EDIT_TODO = 'EDIT_TODO'
}

export interface TodoAction {
    type: ActionType
    todo?: Todo
    todos?: Todo[]
    tempId?: string
    user?: ActiveUser
    email?: string
    users?: ActiveUser[]
}

export interface SocketAction {
    type: ActionType
    todo?: Todo
    todos?: Todo[]
    tempId?: string
    user?: ActiveUser
    email?: string
    todoId?: string
}
