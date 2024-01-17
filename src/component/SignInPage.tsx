import { Stack, Typography, Button } from '@mui/joy'
import { signIn } from 'next-auth/react'

export default function SignInPage (): React.JSX.Element {
    'use client'
    return (
        <Stack>
            <Typography level='title-lg'>You are not signed in</Typography>
            <Button variant='solid' onClick={() => { void signIn(undefined, { callbackUrl: '/' }) }}>Sign in</Button>
        </Stack>
    )
}
