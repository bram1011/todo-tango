import { IconButton, Link } from '@mui/joy'
import LogOutIcon from '@mui/icons-material/Logout'

export default function LogOutButton (): React.JSX.Element {
    return (
        <Link href='/api/auth/logout'><IconButton size='lg'><LogOutIcon /></IconButton></Link>
    )
}
