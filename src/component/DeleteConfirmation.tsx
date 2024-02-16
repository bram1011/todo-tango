'use client'

import { Button, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Modal, ModalDialog } from '@mui/joy'
import React from 'react'
import DeleteForever from '@mui/icons-material/DeleteForever'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import CancelIcon from '@mui/icons-material/Cancel'

export default function DeleteConfirmation ({ itemName, onDelete }: { itemName: string, onDelete: () => void }): React.JSX.Element {
    const [open, setOpen] = React.useState<boolean>(false)

    return (
        <React.Fragment>
            <IconButton variant='outlined' color='danger' onClick={() => { setOpen(true) }}><DeleteForever /></IconButton>
            <Modal color='danger' role='alertdialog' open={open} onClose={() => { setOpen(false) }}>
                <ModalDialog variant='outlined'>
                    <DialogTitle>
                        <WarningRoundedIcon />
                        Confirmation
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        Are you sure you want to delete {itemName}?
                    </DialogContent>
                    <DialogActions>
                        <Button variant='outlined' color='danger' onClick={() => { setOpen(false); onDelete() }}>Delete</Button>
                        <Button startDecorator={<CancelIcon />} variant='outlined' color='neutral' onClick={() => { setOpen(false) }}>Cancel</Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
        </React.Fragment>
    )
}
