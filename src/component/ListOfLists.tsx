'use client'

import { Button, FormControl, FormHelperText, FormLabel, IconButton, Input, Skeleton, Stack } from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import EmailIcon from '@mui/icons-material/Email'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import { useEffect, useState } from 'react'
import { type TodoList } from '@prisma/client'

export default function ListOfLists (): React.JSX.Element {
    const [lists, setLists] = useState<TodoList[]>([])
    const [newTodoListName, setNewTodoListName] = useState<string>('')
    const [isAddingNewList, setIsAddingNewList] = useState<boolean>(false)
    const [editingList, setEditingList] = useState<TodoList | null>(null)
    const [inviteEmail, setInviteEmail] = useState<string>('')
    const [invitingUser, setInvitingUser] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    async function getLists (): Promise<void> {
        const response = await fetch('/api/list')
        if (response.body == null || response.status !== 200) {
            return
        }
        const fetchedLists = await response.json() as TodoList[]
        setLists(fetchedLists)
    }

    useEffect(() => {
        setIsLoading(true)
        void getLists().finally(() => { setIsLoading(false) })
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

    async function inviteUser (email: string, listId: string): Promise<void> {
        setInviteEmail('')
        setInvitingUser(null)
        const response = await fetch(`/api/list/${listId}/invite`, {
            method: 'POST',
            body: JSON.stringify({ email })
        })
        if (response.status !== 200) {
            throw new Error(`Could not invite user: ${response.statusText}`)
        }
    }

    return (
        <Stack alignSelf='center' marginX={8} maxHeight='full' minWidth={0.5} spacing={4} justifyItems='stretch' alignContent='start' justifySelf='center' direction='column'>
            <Button sx={{ justifySelf: 'center', maxWidth: 'fit-content', alignSelf: 'center' }} variant='plain' size='lg' color='success' startDecorator={<AddIcon />} onClick={() => { setIsAddingNewList(true) }}>Add a new List</Button>
            {isAddingNewList && (
                <form onSubmit={(e) => {
                    e.preventDefault()
                    void upsertList(newTodoListName, null)
                }}>
                    <Stack direction='row' spacing={2} alignContent='center' justifyItems='center'>
                        <Input autoFocus required value={newTodoListName} onChange={(e) => { setNewTodoListName(e.target.value) }} placeholder='List Name' />
                        <IconButton type='submit' variant='solid' color='success'><CheckIcon /></IconButton>
                    </Stack>
                </form>
            )}
            {isLoading && (
                <Skeleton sx={{ alignSelf: 'center', justifySelf: 'center' }} variant='rectangular' width={200} height={400} />
            )}
            {!isLoading && lists.length > 0 && lists.map((list) => (
                editingList?.id === list.id
                    ? (
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const passesRegex = emailRegex.test(inviteEmail)
                            if (!passesRegex) {
                                setError('Invalid email')
                                return
                            }
                            void upsertList(newTodoListName, list.id)
                        }} key={list.id}>
                            <Stack direction='row' spacing={2} alignContent='center' justifyItems='center'>
                                <FormControl>
                                    <FormLabel>Invite user by email</FormLabel>
                                    <Input error={error !== null} autoFocus required defaultValue={list.name} onChange={(e) => { setNewTodoListName(e.target.value) }} />
                                    <FormHelperText>
                                        <InfoOutlined />
                                        {error}
                                    </FormHelperText>
                                    <IconButton type='submit' variant='solid' color='success'><CheckIcon /></IconButton>
                                </FormControl>
                            </Stack>
                        </form>
                    )
                    : (
                        <Stack direction='row' key={list.id} spacing={2} alignContent='center' justifyItems='center'>
                            <Button variant='soft' size='md' color='primary' component='a' href={`/lists/${list.id}`} sx={{ flexGrow: 1 }}>{list.name}</Button>
                            <Stack direction='row' spacing={1}>
                                <IconButton variant='outlined' color='neutral' onClick={() => { setEditingList(list); setNewTodoListName(list.name); setIsAddingNewList(false) }}><EditIcon /></IconButton>
                                {invitingUser === list.id
                                    ? (
                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            void inviteUser(inviteEmail, list.id)
                                        }}>
                                            <Stack direction='row' spacing={2} alignContent='center' justifyItems='center'>
                                                <Input autoFocus required type='email' value={inviteEmail} onChange={(e) => { setInviteEmail(e.target.value) }} placeholder='Email' />
                                                <IconButton type='submit' variant='solid' color='success'><CheckIcon /></IconButton>
                                                <IconButton variant='solid' color='danger' onClick={() => { setInvitingUser(null) }}><CancelIcon /></IconButton>
                                            </Stack>
                                        </form>
                                    )
                                    : (
                                        <IconButton variant='outlined' color='neutral' onClick={() => { setInvitingUser(list.id) }}><EmailIcon /></IconButton>
                                    )}
                                <IconButton variant='outlined' color='danger' onClick={ () => { void deleteList(list.id) }}><DeleteIcon /></IconButton>
                            </Stack>
                        </Stack>
                    )
            ))}
        </Stack>
    )
}
