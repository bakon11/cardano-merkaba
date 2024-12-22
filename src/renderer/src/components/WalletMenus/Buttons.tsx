import * as React from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'

export const WalletButtons = (): JSX.Element => {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button variant="outlined">View Wallets</Button>
      <Button variant="outlined">Create Wallet</Button>
      <Button variant="outlined">Restore Wallet</Button>
    </Box>
  )
}
