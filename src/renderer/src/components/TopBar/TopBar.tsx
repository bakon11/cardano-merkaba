import { DarkLightToggle } from '../DarkLightToggle/DarkLightToggle'
import { Sheet, Typography } from '@mui/joy/'

export const TopBar = (): JSX.Element => {
  return (
    <>
      {/* Top App Bar */}
      <Sheet
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'background.body'
        }}
      >
        <Typography level="h4">Merkaba Wallet</Typography>
        <DarkLightToggle />
      </Sheet>
    </>
  )
}
