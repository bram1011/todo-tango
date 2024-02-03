'use client'

import TodoListComponent from '@/component/TodoListComponent'
import { type TodoListWithTodos } from '@/types'
import { CircularProgress } from '@mui/joy'
import { useEffect, useState } from 'react'
import { WebSocketProvider } from 'next-ws/client'

export default function ListPage ({ params }: { params: { listId: string } }): React.JSX.Element {
    const [loading, setLoading] = useState(true)
    const [listData, setListData] = useState<TodoListWithTodos | null>(null)

    useEffect(() => {
        async function fetchList (): Promise<void> {
            try {
                const response = await fetch(`/api/list?todoListId=${params.listId}`)
                if (response.body == null || response.status !== 200) {
                    throw Error('Could not fetch list')
                }
                const todoList = await response.json()
                setListData(todoList as TodoListWithTodos)
            } finally {
                setLoading(false)
            }
        }
        void fetchList()
    }, [params.listId])

    if (loading) {
        return (
            <CircularProgress />
        )
    }

    if (listData == null) {
        return (
            <div>Could not find list</div>
        )
    }

    return (
        <WebSocketProvider url={process.env.NEXT_PUBLIC_WS_URL ?? ''}>
            <TodoListComponent listData={listData} />
        </WebSocketProvider>
    )
}
