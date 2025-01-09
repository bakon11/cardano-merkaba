import * as React from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import { menuHook } from '../../hooks/menuHook'

export const WalletButtons = (): JSX.Element => {
  const [menu, setMenu] = menuHook()
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button variant="outlined" color="primary" onClick={() => setMenu('ViewWallets')}>
        View Wallets
      </Button>
      <Button variant="outlined" color="primary" onClick={() => setMenu('CreateWallet')}>
        Create Wallet
      </Button>
      <Button variant="outlined">Restore Wallet</Button>
    </Box>
  )
}
