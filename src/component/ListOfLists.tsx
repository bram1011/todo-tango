'use client'

import SignInPage from './SignInPage'
import TodoList from '@/entity/TodoList'
import { Button, CircularProgress, DialogTitle, FormControl, FormLabel, IconButton, Input, Link, Modal, ModalDialog, Stack } from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function ListOfLists (): React.JSX.Element {
    const { data: session } = useSession()
    const [lists, setLists] = useState<TodoList[]>([])
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [newTodoListName, setNewTodoListName] = useState<string>('')
    const [creatingNewList, setCreatingNewList] = useState<boolean>(false)

    useEffect(() => {
        async function getLists (): Promise<void> {
            if (session?.userId == null) {
                return
            }
            const response = await fetch(`/api/list?userId=${session?.userId}`)
            const fetchedLists = await response.json() as TodoList[]
            setLists(fetchedLists)
        }
        void getLists()
    }, [session])

    if (session == null) {
        return (
            <SignInPage />
        )
    }

    async function addList (name: string): Promise<void> {
        let list = new TodoList()
        list.name = name
        const response = await fetch('/api/list', {
            method: 'PUT',
            body: JSON.stringify(list)
        })
        list = await response.json() as TodoList
        setLists([...lists, list])
    }

    return (
        <div>
            <Stack>
                {lists.length > 0 && lists.map((list) => (
                    <Link key={list.id} href={`/lists/${list.id}`}><Button>{list.name}</Button></Link>
                ))}
                <IconButton onClick={() => { setModalOpen(true) }}><AddIcon /></IconButton>
            </Stack>
            <Modal open={modalOpen}>
                <ModalDialog layout="center">
                    <DialogTitle>Make a New To-Do List</DialogTitle>
                    <form onSubmit={
                        (e) => {
                            e.preventDefault()
                            setCreatingNewList(true)
                            void addList(newTodoListName).then(() => {
                                setCreatingNewList(false)
                                setModalOpen(false)
                            })
                        }
                    }>
                        {creatingNewList
                            ? (
                                <CircularProgress />
                            )
                            : (
                                <Stack spacing={2}>
                                    <FormControl>
                                        <FormLabel>List Name</FormLabel>
                                        <Input autoFocus required onChange={(e) => { setNewTodoListName(e.target.value) }} />
                                    </FormControl>
                                    <IconButton type='submit' variant='solid' color='success'><CheckIcon /></IconButton>
                                </Stack>
                            )}

                    </form>
                </ModalDialog>
            </Modal>
        </div>

    )
}
