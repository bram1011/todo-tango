'use client'

import TodoList from '@/component/TodoList'
import { type TodoListWithTodos } from '@/types'
import { Skeleton } from '@mui/joy'
import { useEffect, useState } from 'react'

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

    return (
        <Skeleton variant='rectangular' loading={loading} width='90%' height='20%' sx={{ alignSelf: 'center' }}>
            {(listData != null) && <TodoList listData={listData} />}
        </Skeleton>
    )
}
