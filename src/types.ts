import { type Todo, type TodoList } from '@prisma/client'

export interface TodoListWithTodos extends TodoList {
    todos: Todo[]
}
