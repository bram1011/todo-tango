'use client'

import React, { useState, useEffect, useCallback, useReducer } from 'react'
import {
    Table,
    Checkbox,
    Typography,
    IconButton,
    Input,
    Stack,
    Button,
    AvatarGroup,
    Avatar,
    Tooltip,
    Card
} from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { type Todo } from '@prisma/client'
import { type SocketAction, type ActiveUser, type TodoAction, type TodoListWithTodos, ActionType } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function TodoList ({ listData }: { listData: TodoListWithTodos }): React.JSX.Element {
    const [todos, dispatchTodo] = useReducer(todosReducer, listData.todos)
    const [users, dispatchUser] = useReducer(userReducer, [])
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
    const [showDescription, setShowDescription] = useState<boolean>(true)
    const [avatarSurplus, setAvatarSurplus] = useState<number>(0)
    const [makingNewTodo, setMakingNewTodo] = useState<boolean>(false)
    const [ws, setWs] = useState<WebSocket | null>(null)
    const { user } = useUser()
    const MAX_AVATARS = 5

    function todosReducer (state: Todo[], action: TodoAction): Todo[] {
        if (action.todo == null) return state
        switch (action.type) {
            case ActionType.ADD_TODO:
                if (action.tempId != null) {
                    return state.map(todo => todo.id === action.tempId ? action.todo : todo) as Todo[]
                }
                return [...state, action.todo]
            case ActionType.EDIT_TODO:
            case ActionType.UPDATE_TODO:
                return state.map(todo => todo.id === action.todo?.id ? action.todo : todo)
            case ActionType.SET_TODOS:
                if (action.todos == null) return state
                return action.todos
            case ActionType.DELETE_TODO:
                return state.filter(todo => todo.id !== action.todo?.id)
            default:
                return state
        }
    }

    const sendSocketAction = useCallback((action: SocketAction): void => {
        if (user != null) {
            action.user = { name: user.name ?? '', email: user.email ?? '', picture: user.picture ?? null }
        }
        ws?.send(JSON.stringify(action))
    }, [ws, user])

    function userReducer (state: ActiveUser[], action: TodoAction): ActiveUser[] {
        const users = state
        switch (action.type) {
            case 'NEW_USER':
                if (action.user == null) return state
                if (users.length > 0 && users.some(user => user.email === action.user?.email)) return state
                return [...users, action.user]
            case 'SET_USERS':
                if (action.users == null) return state
                return action.users
            case 'REMOVE_USER':
                if (action.user == null) return state
                return users.filter(user => user.email !== action.user?.email)
            default:
                return state
        }
    }

    const onMessage = useCallback((event: MessageEvent) => {
        const data = event.data
        if (typeof data === 'string') {
            const message = JSON.parse(data) as TodoAction
            if (message.type.includes('USER')) {
                dispatchUser(message)
            } else {
                dispatchTodo(message)
            }
        } else if (data instanceof Blob) {
            void event.data.text().then((text: string) => {
                const message = JSON.parse(text) as TodoAction
                dispatchTodo(message)
            })
        }
    }, [])

    async function updateTodo (todo: Todo): Promise<void> {
        dispatchTodo({ type: ActionType.UPDATE_TODO, todo }) // Optimistic update
        if (editingTodo?.id === todo.id) {
            setEditingTodo(null)
            if (makingNewTodo) {
                setMakingNewTodo(false)
                sendSocketAction({ type: ActionType.ADD_TODO, todo, tempId: todo.id })
            } else {
                sendSocketAction({ type: ActionType.EDIT_TODO, todo })
            }
        } else {
            sendSocketAction({ type: ActionType.EDIT_TODO, todo })
        }
    }

    async function deleteTodo (todo: Todo): Promise<void> {
        dispatchTodo({ type: ActionType.DELETE_TODO, todo }) // Optimistic update
        sendSocketAction({ type: ActionType.DELETE_TODO, todoId: todo.id })
    }

    async function fetchTodos (todoListId: string): Promise<void> {
        try {
            const response = await fetch(`/api/list?todoListId=${todoListId}`)
            if (!response.ok) throw new Error('Failed to fetch todos')
            const todoList = await response.json()
            dispatchTodo({ type: ActionType.SET_TODOS, todos: todoList.todos })
        } catch (error) {
            console.error('Error fetching todos:', error)
        }
    }

    async function deleteDoneTodos (): Promise<void> {
        const doneTodos = todos.filter((todo) => todo.completed)
        for (const todo of doneTodos) {
            dispatchTodo({ type: ActionType.DELETE_TODO, todo }) // Optimistic update
            sendSocketAction({ type: ActionType.DELETE_TODO, todoId: todo.id })
        }
    }

    function createNewTodo (): Todo {
        const newTodo: Todo = {
            id: uuidv4(),
            name: '',
            description: '',
            todoListId: listData.id,
            completed: false,
            order: 0
        }
        todos.splice(0, 0, newTodo)
        for (let i = 0; i < todos.length; i++) {
            todos[i].order = i
        }
        setEditingTodo(newTodo)
        dispatchTodo({ type: ActionType.SET_TODOS, todos })
        setMakingNewTodo(true)
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

        for (let i = 0; i < items.length; i++) {
            items[i].order = i
        }

        // Update state with the new todos order
        dispatchTodo({ type: ActionType.SET_TODOS, todos: items })

        sendSocketAction({ type: ActionType.ORDER_TODOS, todos: items })
    }

    useEffect(() => {
        const localShowDescription = window.localStorage.getItem('showDescription')
        if (localShowDescription != null) {
            setShowDescription(JSON.parse(localShowDescription) as boolean)
        }
        setWs(new WebSocket(process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000/api/socket'))
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            if (ws?.readyState === ws?.OPEN) {
                // Keep socket alive
                sendSocketAction({ type: ActionType.NEW_USER })
            }
        }, 500)
        return () => { clearInterval(interval) }
    }, [sendSocketAction, ws])

    function toggleDescription (): void {
        setShowDescription(!showDescription)
        window.localStorage.setItem('showDescription', JSON.stringify(!showDescription))
    }

    useEffect(() => {
        if (users.length > MAX_AVATARS) {
            dispatchUser({ type: ActionType.SET_USERS, users: users.slice(0, MAX_AVATARS) })
            setAvatarSurplus(users.length - MAX_AVATARS)
        }
    }, [users])

    useEffect(() => {
        const onOpen = (): void => {
            console.log('Connected to server')
            sendSocketAction({ type: ActionType.NEW_USER })
        }
        ws?.addEventListener('message', onMessage)
        ws?.addEventListener('open', onOpen)
        void fetchTodos(listData.id)
        if (user != null) {
            dispatchUser({ type: ActionType.SET_USERS, users: [{ name: user.name ?? '', email: user.email ?? '', picture: user.picture ?? null }] })
        }
        return () => {
            ws?.removeEventListener('message', onMessage)
            ws?.removeEventListener('open', onOpen)
        }
    }, [ws, onMessage, listData.id, user, sendSocketAction])

    return (
        <Card invertedColors sx={{ margin: '2%', width: showDescription ? '98%' : '70%', alignSelf: 'center' }}>
            <Stack direction='column' spacing={5} sx={{ maxWidth: 'fit-content' }} alignContent='center' alignItems='center'>
                {users.length > 0 && (
                    <AvatarGroup sx={{ alignSelf: 'center' }}>
                        {users.map((user) => (
                            <Tooltip key={user.email} title={user.name} variant='outlined' placement='top'>
                                <Avatar size='lg' src={user.picture ?? undefined} alt={user.name} />
                            </Tooltip>
                        ))}
                        {avatarSurplus > 0 && <Avatar size='lg'>+{avatarSurplus}</Avatar>}
                    </AvatarGroup>
                )}
                <Button component='a' href='/' startDecorator={<ArrowBackIcon />}>Back to lists</Button>
                <Typography level='h2'>{listData.name}</Typography>
                <Stack direction='row' spacing={2} justifyContent='space-between' sx={{ width: '100%', 'button:nth-child(2)': { display: { xs: 'none', md: 'inline-flex' } } }}>
                    <Button variant='solid' startDecorator={<AddIcon />} onClick={() => { createNewTodo() }}>Add task</Button>
                    <Button variant='solid' startDecorator={ showDescription ? <VisibilityOffIcon /> : <VisibilityIcon /> } onClick={() => { toggleDescription() }}>
                        {showDescription ? 'Hide description' : 'Show description'}
                    </Button>
                    {todos.filter((todo) => todo.completed).length > 0
                        ? (
                            <Button variant='solid' color='danger' startDecorator={<DeleteIcon />} onClick={() => { void deleteDoneTodos() }}>Delete done tasks</Button>
                        )
                        : <div />
                    }
                </Stack>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Table size='lg' sx={{
                        '.complete-true': { backgroundColor: (theme) => theme.palette.success.plainActiveBg, textDecoration: 'line-through' },
                        '& thead th:nth-child(1)': { width: '10%' },
                        '& thead th:nth-child(2)': { width: '30%' },
                        '& thead th:nth-child(3)': { width: '40%', display: { xs: 'none', md: showDescription ? 'table-cell' : 'none' } },
                        '& tbody td:nth-child(3)': { display: { xs: 'none', md: showDescription ? 'table-cell' : 'none' } },
                        '& thead th:nth-child(4)': { width: '10%' },
                        overflow: 'auto'
                    }}>
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
                                                todos.sort((a, b) => a.order - b.order).map((todo, index) => (
                                                    <Draggable key={todo.id} draggableId={todo.id} index={index} isDragDisabled={editingTodo !== null}>
                                                        {(provided: any) => (
                                                            <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`complete-${todo.completed}`}>
                                                                <td><Checkbox className='align-middle' checked={todo.completed} onChange={
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
                                                                            <Typography level={ showDescription ? 'title-md' : 'title-lg' }>{todo.name}</Typography>
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
                                                                    <Stack direction={{ sm: 'column', xs: 'column', md: 'row' }} spacing={2}>
                                                                        {editingTodo?.id === todo.id
                                                                            ? (
                                                                                <IconButton variant='plain' onClick={() => { void updateTodo(editingTodo) }}><CheckIcon /></IconButton>
                                                                            )
                                                                            : (
                                                                                <IconButton variant='plain' onClick={() => { setEditingTodo(todo) }}><EditIcon /></IconButton>
                                                                            )}
                                                                        <IconButton variant='plain' color='danger' onClick={() => { void deleteTodo(todo) }}><DeleteIcon /></IconButton>
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
            </Stack>
        </Card>
    )
}
