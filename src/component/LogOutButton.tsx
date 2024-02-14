'use client'

import { Button } from '@mui/joy'
import LogOutIcon from '@mui/icons-material/Logout'
import LoginIcon from '@mui/icons-material/Login'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function LogOutButton (): React.JSX.Element {
    const { user } = useUser()
    if (user == null) {
        return (
            <Button color='success' size='lg' component='a' href='/api/auth/login' startDecorator={<LoginIcon />}>Log In</Button>
        )
    }
    return (
        <Button color='danger' size='lg' component='a' href='/api/auth/logout' startDecorator={<LogOutIcon />}>Log Out</Button>
    )
}
