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
    FormLabel
} from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
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
        <Sheet variant="outlined" className='w-5/6 mx-auto my-4 py-3 px-2 flex flex-col gap-2 rounded-md shadow-md'>
            <Stack direction='column'>
                <div>
                    <Table size='lg'>
                        <thead>
                            <tr className='align-middle'>
                                <th className='w-12'><Checkbox className='align-middle' disabled/></th>
                                <th className='w-1/3 text-left'>Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                todos.length > 0
                                    ? (todos.map((todo) => (
                                        <tr className='align-middle' key={todo.id}>
                                            <td><Checkbox className='align-middle' defaultChecked={todo.completed} onChange={
                                                (e) => {
                                                    todo.completed = e.target.checked
                                                    todos[todos.findIndex((t) => t.id === todo.id)] = todo
                                                    setTodos([...todos])
                                                }
                                            } /></td>
                                            <td><Typography level='title-lg' className={todo.completed ? 'line-through' : ''}>{todo.name}</Typography></td>
                                            <td><Typography level='body-md' className={todo.completed ? 'line-through' : ''}>{todo.description}</Typography></td>
                                        </tr>
                                    )))
                                    : (<tr><td colSpan={3}><Typography level='body-md'>No tasks</Typography></td></tr>)
                            }
                        </tbody>
                    </Table>
                </div>
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
