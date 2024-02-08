'use client'

import { useColorScheme } from '@mui/joy/styles'
import Button from '@mui/joy/Button'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'

export default function ModeToggle (): React.JSX.Element {
    const { mode, setMode } = useColorScheme()
    return (
        <Button
            variant="outlined"
            color="neutral"
            onClick={() => { setMode(mode === 'dark' ? 'light' : 'dark') }}
            startDecorator={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        >
            {mode === 'dark' ? 'Turn light' : 'Turn dark'}
        </Button>
    )
}
