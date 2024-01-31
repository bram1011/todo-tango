'use client'

import Sheet from '@mui/joy/Sheet'
import React, { useState, useEffect } from 'react'
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
import { type TodoListWithTodos } from '@/types'

export default function TodoListComponent ({ listData }: { listData: TodoListWithTodos }): React.JSX.Element {
    const [todos, setTodos] = useState<Todo[]>(listData.todos)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [newTaskName, setNewTaskName] = useState<string>('')
    const [newTaskDescription, setNewTaskDescription] = useState<string>('')

    async function addTodo (name: string, description: string): Promise<void> {
        const response = await fetch(`/api/todo?todoListId=${listData.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name,
                description,
                completed: false
            })
        })
        const todo = await response.json() as Todo
        setTodos([...todos, todo])
    }

    async function updateTodo (todo: Todo): Promise<void> {
        const response = await fetch('/api/todo', {
            method: 'POST',
            body: JSON.stringify(todo)
        })
        const updatedTodo = await response.json() as Todo
        const updatedTodoList = todos
        updatedTodoList[updatedTodoList.findIndex((t) => t.id === updatedTodo.id)] = updatedTodo
        setTodos([...updatedTodoList])
    }

    useEffect(() => {
        async function fetchTodos (): Promise<void> {
            const response = await fetch(`/api/list?todoListId=${listData.id}`)
            if (response.body == null || response.status !== 200) {
                return
            }
            const todoList = await response.json()
            setTodos(todoList.todos as Todo[])
        }
        void fetchTodos()
    }, [listData])

    return (
        <Sheet variant='plain'>
            <Stack direction='column' spacing={5}>
                <Button component='a' href='/lists' startDecorator={<ArrowBackIcon />}>Back to lists</Button>
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
