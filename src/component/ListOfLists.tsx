'use client'

import { Button, CircularProgress, DialogTitle, FormControl, FormLabel, IconButton, Input, Modal, ModalDialog, Stack } from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import { useEffect, useState } from 'react'
import { type TodoList } from '@prisma/client'

export default function ListOfLists (): React.JSX.Element {
    const [lists, setLists] = useState<TodoList[]>([])
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [newTodoListName, setNewTodoListName] = useState<string>('')
    const [creatingNewList, setCreatingNewList] = useState<boolean>(false)

    useEffect(() => {
        async function getLists (): Promise<void> {
            const response = await fetch('/api/list')
            if (response.body == null || response.status !== 200) {
                return
            }
            const fetchedLists = await response.json() as TodoList[]
            setLists(fetchedLists)
        }
        void getLists()
    }, [])

    async function addList (name: string): Promise<void> {
        const response = await fetch('/api/list', {
            method: 'PUT',
            body: JSON.stringify({ name })
        })
        const newList = await response.json() as TodoList
        setLists([...lists, newList])
    }

    return (
        <Stack alignSelf='center' maxHeight='full' spacing={4} justifyItems='stretch' justifySelf='center' useFlexGap>
            {lists.length > 0 && lists.map((list) => (
                <Button size='md' color='neutral' component='a' key={list.id} href={`/lists/${list.id}`}>{list.name}</Button>
            ))}
            <Button sx={{ marginTop: '16rem' }} size='lg' color='success' startDecorator={<AddIcon />} aria-label='Create a To-do list' onClick={() => { setModalOpen(true) }}>Add a new List</Button>
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
        </Stack>

    )
}
