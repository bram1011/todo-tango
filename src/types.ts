import { type Todo, type TodoList } from '@prisma/client'

export interface TodoListWithTodos extends TodoList {
    todos: Todo[]
}

export interface TodoDto {
    name: string
    description: string
    todoListId: string
}

export type TodoAction =
  | { type: 'ADD_TODO', todo: Todo }
  | { type: 'ADD_TODO', todo: Todo, tempId: string }
  | { type: 'UPDATE_TODO', todo: Todo }
  | { type: 'SET_TODOS', todos: Todo[] }
  | { type: 'DELETE_TODO', todo: Todo }
