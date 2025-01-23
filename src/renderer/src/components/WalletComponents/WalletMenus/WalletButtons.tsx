import * as React from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import { menuHook } from '../../../hooks/menuHook'

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
      <Button variant="outlined" color="primary" onClick={() => setMenu('RestoreWallet')}>
        Restore Wallet
      </Button>
    </Box>
  )
}

export const AccountButtons = (): JSX.Element => {
  const [menu, setMenu] = menuHook()
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button variant="outlined" color="primary" onClick={() => setMenu('SelectedAccountView')}>
        Account
      </Button>
      <Button variant="outlined" color="primary" onClick={() => setMenu('Send')}>
        Transactions
      </Button>
      <Button variant="outlined" color="primary" onClick={() => setMenu('Receive')}>
        Send
      </Button>
    </Box>
  )
}