'use client'

import { Button, IconButton, Input, Stack } from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState } from 'react'
import { type TodoList } from '@prisma/client'

export default function ListOfLists (): React.JSX.Element {
    const [lists, setLists] = useState<TodoList[]>([])
    const [newTodoListName, setNewTodoListName] = useState<string>('')
    const [isAddingNewList, setIsAddingNewList] = useState<boolean>(false)
    const [editingList, setEditingList] = useState<TodoList | null>(null)

    async function getLists (): Promise<void> {
        const response = await fetch('/api/list')
        if (response.body == null || response.status !== 200) {
            return
        }
        const fetchedLists = await response.json() as TodoList[]
        setLists(fetchedLists)
    }

    useEffect(() => {
        void getLists()
    }, [])

    async function upsertList (name: string, listId: string | null): Promise<void> {
        setNewTodoListName('')
        setEditingList(null)
        setIsAddingNewList(false)
        await fetch('/api/list', {
            method: 'PUT',
            body: JSON.stringify(listId === null ? { name } : { name, id: listId })
        })
        await getLists()
    }

    async function deleteList (id: string): Promise<void> {
        setLists(lists.filter((list) => list.id !== id))
        const response = await fetch(`/api/list?todoListId=${id}`, {
            method: 'DELETE'
        })
        if (response.status !== 200) {
            throw new Error(`Could not delete list: ${response.statusText}`)
        }
    }

    return (
        <Stack alignSelf='center' maxHeight='full' spacing={4} justifyItems='stretch' alignContent='start' justifySelf='center' direction='column'>
            <Button variant='plain' size='lg' color='success' startDecorator={<AddIcon />} onClick={() => { setIsAddingNewList(true) }}>Add a new List</Button>
            {isAddingNewList && (
                <form onSubmit={(e) => {
                    e.preventDefault()
                    void upsertList(newTodoListName, null)
                }}>
                    <Stack direction='row' spacing={2} alignContent='center' justifyItems='center'>
                        <Input autoFocus required value={newTodoListName} onChange={(e) => { setNewTodoListName(e.target.value) }} placeholder="List Name" />
                        <IconButton type='submit' variant='solid' color='success'><CheckIcon /></IconButton>
                    </Stack>
                </form>
            )}
            {lists.map((list) => (
                editingList?.id === list.id
                    ? (
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            void upsertList(newTodoListName, list.id)
                        }} key={list.id}>
                            <Stack direction='row' spacing={2} alignContent='center' justifyItems='center'>
                                <Input autoFocus required defaultValue={list.name} onChange={(e) => { setNewTodoListName(e.target.value) }} />
                                <IconButton type='submit' variant='solid' color='success'><CheckIcon /></IconButton>
                            </Stack>
                        </form>
                    )
                    : (
                        <Stack direction='row' key={list.id} spacing={2} alignContent='center' justifyItems='center'>
                            <Button variant='soft' size='md' color='primary' component='a' href={`/lists/${list.id}`} sx={{ flexGrow: 1 }}>{list.name}</Button>
                            <Stack direction='row' spacing={1}>
                                <IconButton variant='outlined' color='neutral' onClick={() => { setEditingList(list); setNewTodoListName(list.name); setIsAddingNewList(false) }}><EditIcon /></IconButton>
                                <IconButton variant='outlined' color='danger' onClick={ () => { void deleteList(list.id) }}><DeleteIcon /></IconButton>
                            </Stack>
                        </Stack>
                    )
            ))}
        </Stack>
    )
}
