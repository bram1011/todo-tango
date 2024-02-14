import { NextResponse, type NextRequest } from 'next/server'
import transporter from '@/util/mail'
import prisma from '@/util/prisma'

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export async function POST (req: NextRequest, { params }: { params: { listId: string } }): Promise<Response> {
    const { email }: { email: string } = await req.json()
    if (!emailRegex.test(email)) {
        return NextResponse.json(`Invalid email: ${email}`, { status: 400 })
    }
    const sentMessage = await transporter.sendMail({
        to: email,
        from: process.env.SMTP_USER,
        subject: 'You have been invited to a list',
        text: `You have been invited to a list. Click the link to accept the invitation: ${process.env.NEXT_PUBLIC_URL}/lists/${params.listId}`
    })
    console.log('Message sent: %s', sentMessage.messageId)
    const list = await prisma.todoList.findUnique({ where: { id: params.listId } })
    if (list !== null && list.users.includes(email) as boolean) {
        list.users.push(email)
        await prisma.todoList.update({
            where: { id: params.listId },
            data: {
                users: list.users
            }
        })
    }
    return NextResponse.json('Invitation sent')
}
