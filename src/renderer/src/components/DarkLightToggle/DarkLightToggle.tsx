import React from 'react'
import { useColorScheme } from '@mui/joy/styles'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const DarkLightToggle = () => {
  const { mode, setMode } = useColorScheme()
  const [mounted, setMounted] = React.useState(false)

  // necessary for server-side rendering
  // because mode is undefined on the server
  React.useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) {
    return null
  }

  return (
    <>
      <Select
        value={mode}
        onChange={(_event, newMode) => {
          setMode(newMode)
        }}
        sx={{ width: 'max-content' }}
      >
        <Option value="system">System</Option>
        <Option value="light">Light</Option>
        <Option value="dark">Dark</Option>
      </Select>
    </>
  )
}
