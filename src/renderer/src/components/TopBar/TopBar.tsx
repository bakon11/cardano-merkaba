import { DarkLightToggle } from '../DarkLightToggle/DarkLightToggle'
import { Sheet, Typography } from '@mui/joy/'
import { menuHook } from '../../hooks/menuHook'
import { WalletButtons } from '../WalletMenus/Buttons'
import icon from '../../../../../resources/icon.png'

export const TopBar = (): JSX.Element => {
  const [menu, setMenu] = menuHook()

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
        <Typography level="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={icon} alt="Icon" height="25" style={{ marginRight: '0.5rem' }} /> Merkaba
        </Typography>
        {menu === 'WalletView' && <WalletButtons />}
        <DarkLightToggle />
      </Sheet>
    </>
  )
}
