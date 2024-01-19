import React from 'react'
import { Button, Link } from '@mui/joy'

export default function Home (): React.JSX.Element {
    return (
        <Link href='/lists'><Button>View Lists</Button></Link>
    )
}
