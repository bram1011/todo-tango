'use client'

import React from 'react'
import { Drawer, IconButton, Box } from '@mui/joy'
import MenuIcon from '@mui/icons-material/Menu'
import ListOfLists from '@/component/ListOfLists'

export default function Sidebar (): React.JSX.Element {
    const [open, setOpen] = React.useState(false)

    return (
        <Box sx={{ display: 'flex' }}>
            <IconButton variant="outlined" color="neutral" onClick={() => { setOpen(true) }}><MenuIcon /></IconButton>
            <Drawer open={open} onClose={() => { setOpen(false) }} size='md'>
                <ListOfLists enableControls={false} />
            </Drawer>
        </Box>
    )
}
