'use client'

import Sheet from '@mui/joy/Sheet'
import React, { useState, useEffect, useCallback, useReducer } from 'react'
import {
    Table,
    Checkbox,
    Typography,
    IconButton,
    Input,
    Stack,
    Button
} from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { type Todo } from '@prisma/client'
import { type TodoAction, type TodoListWithTodos } from '@/types'
import { useWebSocket } from 'next-ws/client'
import { v4 as uuidv4 } from 'uuid'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function TodoList ({ listData }: { listData: TodoListWithTodos }): React.JSX.Element {
    const [todos, dispatch] = useReducer(todosReducer, listData.todos)
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
    const ws = useWebSocket()

    function todosReducer (state: Todo[], action: TodoAction): Todo[] {
        switch (action.type) {
            case 'ADD_TODO':
                if ('tempId' in action) {
                    return state.map(todo => todo.id === action.tempId ? action.todo : todo)
                }
                return [...state, action.todo]
            case 'UPDATE_TODO':
                return state.map(todo => todo.id === action.todo.id ? action.todo : todo)
            case 'SET_TODOS':
                return action.todos
            case 'DELETE_TODO':
                return state.filter(todo => todo.id !== action.todo.id)
            default:
                return state
        }
    }

    const onMessage = useCallback((event: MessageEvent) => {
        const data = event.data
        if (typeof data === 'string') {
            const message = JSON.parse(data) as TodoAction
            dispatch(message)
        } else if (data instanceof Blob) {
            void event.data.text().then((text: string) => {
                const message = JSON.parse(text) as TodoAction
                dispatch(message)
            })
        }
    }, [])

    async function updateTodo (todo: Todo): Promise<void> {
        dispatch({ type: 'UPDATE_TODO', todo }) // Optimistic update
        if (editingTodo?.id === todo.id) {
            setEditingTodo(null)
            ws?.send(JSON.stringify({ action: 'addTodo', todo }))
        } else {
            ws?.send(JSON.stringify({ action: 'editTodo', todo }))
        }
    }

    async function deleteTodo (todo: Todo): Promise<void> {
        dispatch({ type: 'DELETE_TODO', todo }) // Optimistic update
        ws?.send(JSON.stringify({ action: 'deleteTodo', todoId: todo.id }))
    }

    async function fetchTodos (todoListId: string): Promise<void> {
        try {
            const response = await fetch(`/api/list?todoListId=${todoListId}`)
            if (!response.ok) throw new Error('Failed to fetch todos')
            const todoList = await response.json()
            dispatch({ type: 'SET_TODOS', todos: todoList.todos })
        } catch (error) {
            console.error('Error fetching todos:', error)
        }
    }

    function createNewTodo (): Todo {
        let order = 0
        if (todos.length > 0) {
            const orders: number[] = todos.map((todo) => todo.order)
            order = Math.max(...orders) + 1
        }
        const newTodo: Todo = {
            id: uuidv4(),
            name: '',
            description: '',
            todoListId: listData.id,
            completed: false,
            order
        }
        setEditingTodo(newTodo)
        return newTodo
    }

    const handleEditInputChange = (field: string, value: string): void => {
        if (editingTodo != null) {
            setEditingTodo({
                ...editingTodo,
                [field]: value
            })
        }
    }

    const handleOnDragEnd = (result: any): void => {
        const items = Array.from(todos)
        const [reorderedItem] = items.splice(result.source.index as number, 1)
        items.splice(result.destination.index as number, 0, reorderedItem)

        // Update state with the new todos order
        dispatch({ type: 'SET_TODOS', todos: items })

        ws?.send(JSON.stringify({ action: 'orderTodos', todos: items }))
    }

    useEffect(() => {
        ws?.addEventListener('message', onMessage)
        void fetchTodos(listData.id)
        return () => ws?.removeEventListener('message', onMessage)
    }, [ws, onMessage, listData.id])

    return (
        <Sheet variant='plain'>
            <Stack direction='column' spacing={5}>
                <Button component='a' href='/' startDecorator={<ArrowBackIcon />}>Back to lists</Button>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Table size='lg' sx={{ '.complete-true': { backgroundColor: (theme) => theme.palette.success.plainActiveBg } }}>
                        <thead>
                            <tr>
                                <th><Checkbox className='align-middle' disabled/></th>
                                <th>Name</th>
                                <th>Description</th>
                                <th></th>
                            </tr>
                        </thead>
                        <Droppable droppableId='todos'>
                            {(provided: any) => (
                                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                    <tr>{provided.placeholder}</tr>
                                    {
                                        todos.length > 0
                                            ? (
                                                todos.map((todo, index) => (
                                                    <Draggable key={todo.id} draggableId={todo.id} index={index} isDragDisabled={editingTodo !== null}>
                                                        {(provided: any) => (
                                                            <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`complete-${todo.completed}`}>
                                                                <td><Checkbox className='align-middle' defaultChecked={todo.completed} onChange={
                                                                    (e) => {
                                                                        todo.completed = e.target.checked
                                                                        void updateTodo(todo)
                                                                    }
                                                                } /></td>
                                                                <td>
                                                                    {editingTodo?.id === todo.id
                                                                        ? (
                                                                            <Input
                                                                                defaultValue={todo.name}
                                                                                onChange={(e) => { handleEditInputChange('name', e.target.value) }}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        const target = e.target as HTMLInputElement
                                                                                        void updateTodo({ ...editingTodo, name: target.value })
                                                                                    }
                                                                                }}
                                                                                autoFocus
                                                                            />
                                                                        )
                                                                        : (
                                                                            <Typography level='title-md'>{todo.name}</Typography>
                                                                        )}
                                                                </td>
                                                                <td>
                                                                    {editingTodo?.id === todo.id
                                                                        ? (
                                                                            <Input
                                                                                defaultValue={todo.description ?? ''}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        const target = e.target as HTMLInputElement
                                                                                        void updateTodo({ ...editingTodo, description: target.value })
                                                                                    }
                                                                                }}
                                                                                onChange={(e) => { handleEditInputChange('description', e.target.value) }}
                                                                            />
                                                                        )
                                                                        : (
                                                                            <Typography level='body-md'>{todo.description}</Typography>
                                                                        )}
                                                                </td>
                                                                <td>
                                                                    <Stack direction='row' spacing={2}>
                                                                        {editingTodo?.id === todo.id
                                                                            ? (
                                                                                <IconButton variant='plain' onClick={() => { void updateTodo(editingTodo) }}><CheckIcon /></IconButton>
                                                                            )
                                                                            : (
                                                                                <IconButton variant='plain' onClick={() => { setEditingTodo(todo) }}><EditIcon /></IconButton>
                                                                            )}
                                                                        <IconButton variant='plain' onClick={() => { void deleteTodo(todo) }}><DeleteIcon /></IconButton>
                                                                    </Stack>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )
                                            : (<tr><td colSpan={3}><Typography level='body-md'>No tasks</Typography></td></tr>)
                                    }
                                </tbody>
                            )}
                        </Droppable>
                    </Table>
                </DragDropContext>
                <IconButton variant='solid' onClick={() => { dispatch({ type: 'ADD_TODO', todo: createNewTodo() }) }}><AddIcon /></IconButton>
            </Stack>
        </Sheet>
    )
}
