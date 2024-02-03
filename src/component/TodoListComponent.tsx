'use client'

import Sheet from '@mui/joy/Sheet'
import React, { useState, useEffect, useCallback, useReducer } from 'react'
import {
    Table,
    Checkbox,
    Typography,
    IconButton,
    Modal,
    FormControl,
    Input,
    ModalDialog,
    DialogTitle,
    Stack,
    FormLabel,
    Button
} from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { type Todo } from '@prisma/client'
import { type TodoAction, type TodoListWithTodos } from '@/types'
import { useWebSocket } from 'next-ws/client'
import { v4 as uuidv4 } from 'uuid'

export default function TodoListComponent ({ listData }: { listData: TodoListWithTodos }): React.JSX.Element {
    const [todos, dispatch] = useReducer(todosReducer, listData.todos)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [newTaskName, setNewTaskName] = useState<string>('')
    const [newTaskDescription, setNewTaskDescription] = useState<string>('')
    const ws = useWebSocket()

    async function addTodo (name: string, description: string): Promise<void> {
        const tempId = uuidv4()
        const newTodo: Todo = { id: tempId, name, description, todoListId: listData.id, completed: false }
        dispatch({ type: 'ADD_TODO', todo: newTodo }) // Optimistic update
        ws?.send(JSON.stringify({ action: 'addTodo', todo: newTodo }))
    }

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
        ws?.send(JSON.stringify({ action: 'editTodo', todo }))
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

    useEffect(() => {
        ws?.addEventListener('message', onMessage)
        void fetchTodos(listData.id)
        return () => ws?.removeEventListener('message', onMessage)
    }, [ws, onMessage, listData.id])

    return (
        <Sheet variant='plain'>
            <Stack direction='column' spacing={5}>
                <Button component='a' href='/' startDecorator={<ArrowBackIcon />}>Back to lists</Button>
                <Table size='lg' sx={{ '.complete-true': { backgroundColor: (theme) => theme.palette.success.plainActiveBg } }}>
                    <thead>
                        <tr>
                            <th style={{ width: '5%' }}><Checkbox className='align-middle' disabled/></th>
                            <th>Name</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            todos.length > 0
                                ? (todos.map((todo) => (
                                    <tr key={todo.id} className={`complete-${todo.completed}`}>
                                        <td><Checkbox className='align-middle' defaultChecked={todo.completed} onChange={
                                            (e) => {
                                                todo.completed = e.target.checked
                                                void updateTodo(todo)
                                            }
                                        } /></td>
                                        <td><Typography level='title-md'>{todo.name}</Typography></td>
                                        <td><Typography level='body-md'>{todo.description}</Typography></td>
                                    </tr>
                                )))
                                : (<tr><td colSpan={3}><Typography level='body-md'>No tasks</Typography></td></tr>)
                        }
                    </tbody>
                </Table>
                <IconButton variant='solid' onClick={() => { setModalOpen(true) }}><AddIcon /></IconButton>
            </Stack>
            <Modal open={modalOpen} onClose={() => { setModalOpen(false) }}>
                <ModalDialog>
                    <DialogTitle>Add a new task</DialogTitle>
                    <form
                        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault()
                            setModalOpen(false)
                            void addTodo(newTaskName, newTaskDescription)
                            setNewTaskName('')
                            setNewTaskDescription('')
                        }}
                    >
                        <Stack spacing={2}>
                            <FormControl>
                                <FormLabel>Task name</FormLabel>
                                <Input autoFocus required onChange={(e) => { setNewTaskName(e.target.value) }} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Task description</FormLabel>
                                <Input onChange={(e) => { setNewTaskDescription(e.target.value) }} />
                            </FormControl>
                            <IconButton type='submit' variant='solid' color='success'><CheckIcon /></IconButton>
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>
        </Sheet>
    )
}
