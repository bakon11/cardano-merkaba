import * as React from 'react'
import { Sheet, Box, Typography, Divider, Button, Input } from '@mui/joy'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts' // You would need to install recharts for this

const data = [
  { name: 'E181', rewards: 0 },
  { name: 'E182', rewards: 0 },
  { name: 'E183', rewards: 0 },
  { name: 'E184', rewards: 0 },
  { name: 'E185', rewards: 0 },
  { name: 'E186', rewards: 0 },
  { name: 'E187', rewards: 0 },
  { name: 'E188', rewards: 0 }
]

interface AccountDashboardProps {
  accountInfo: any
}
export const AccountDashboard: React.FC<AccountDashboardProps> = ({ accountInfo }) => {
  return (
    <Sheet sx={{ width: '100%', bgcolor: 'background.level1', borderRadius: 'sm', p: 2 }}>
      {/* Account Information */}
      <Box>
        <Typography level="body-md">
          (m/1852'/1815'/{accountInfo ? accountInfo.account.accountIndex : '****'}')
        </Typography>
        <Divider />
        <Typography>
          Total funds: ₳ {accountInfo ? accountInfo.value.lovelace / 1000000 : '****'}{' '}
        </Typography>
        <Typography>Balance: ₳ ****</Typography>
        <Typography>Rewards: ₳ ****</Typography>
      </Box>

      {/* Available Funds Breakdown */}
      <Box mt={2}>
        <Typography level="h4">Available Funds Breakdown</Typography>
        <Divider />
        <Typography color="success">
          Est. available: ₳ {accountInfo ? accountInfo.value.lovelace / 1000000 : '****'}
        </Typography>
        <Typography color="warning">Est. locked: ₳ ****</Typography>
        <Typography>Collateral UTXO: ₳ ****</Typography>
      </Box>

      {/* Rewards History */}
      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
        <Typography level="h4">Rewards History</Typography>
        <Divider />
        <BarChart width={500} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="rewards" fill="#8884d8" />
        </BarChart>
      </Box>

      {/* Withdraw Rewards */}
      <Box mt={2}>
        <Typography level="h4">Withdraw Rewards</Typography>
        <Typography level="body-md">
          There is no need to withdraw, your rewards are automatically part of your delegated stake.
        </Typography>
        <Button variant="outlined" color="neutral" sx={{ mt: 1 }}>
          Withdraw Rewards
        </Button>
      </Box>


      {/* Receive Address */}
      <Box mt={2}>
        <Typography level="h4">Base Address</Typography>
        <Input
          fullWidth
          value={accountInfo ? accountInfo.account.baseAddress_bech32 : '****'}
          readOnly
          endDecorator={
            <Button variant="outlined" color="neutral">
              Copy
            </Button>
          }
        />
      </Box>
      {/* Stake Address */}
      <Box mt={2}>
        <Typography level="h4">Stake Address</Typography>
        <Input
          fullWidth
          value={accountInfo ? accountInfo.account.stakeAddress_bech32 : '****'}
          readOnly
          endDecorator={
            <Button variant="outlined" color="neutral">
              Copy
            </Button>
          }
        />
      </Box>
    </Sheet>
  )
}