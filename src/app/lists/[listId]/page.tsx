'use client'

import TodoListComponent from '@/component/TodoListComponent'
import { SessionProvider } from 'next-auth/react'

export default function ListPage ({ params }: { params: { listId: string } }): React.JSX.Element {
    return (
        <SessionProvider>
            <TodoListComponent listData={{ listId: params.listId }} />
        </SessionProvider>
    )
}
