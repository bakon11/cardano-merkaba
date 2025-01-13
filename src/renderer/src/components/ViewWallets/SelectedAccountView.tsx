import * as React from 'react'
import { Sheet, Typography } from '@mui/joy'
import { selectedAccountHook } from '../../hooks/selectedAccountHook'
import { getAccountUtxoInfoOgmios } from '../../API/ogmios'


interface SelectedAccountViewProps {}

export const SelectedAccountView: React.FC<SelectedAccountViewProps> = () => {
  const [selectedAccount, setSelectedAccount] = selectedAccountHook() as any
  const account = JSON.parse(selectedAccount)
  const [accountInfo, setAccountInfo] = React.useState<any>()

  
  React.useEffect(() => {
    getAccountUtxoInfoOgmios([account.baseAddress_bech32]).then((data) => {
      console.log('data', data)
      setAccountInfo(data)})
  }, [])

  return (
    <>
      <Typography level="h4">{account.accountName}</Typography>
      <Sheet
        sx={{
          top: 20,
          left: 60,
          width: '100%',
          height: 'auto',
          minWidth: 1600,
          maxHeight: 1000,
          minHeight: 800,
          overflowY: 'scroll',
          p: 4,
          bgcolor: 'background.body',
          color: 'text.primary'
        }}
      >
        <TabsSegmentedControls />
      </Sheet>
    </>
  )
}

import { Tab, Tabs, TabList, TabPanel } from '@mui/joy'

export const TabsSegmentedControls = () => {
  return (
    <Tabs orientation="vertical" size="sm">
      <TabList>
        <Tab variant="outlined" color="neutral">
          Account
        </Tab>
        <Tab variant="outlined" color="neutral">
          Transactions
        </Tab>
      </TabList>
      <TabPanel value={0}>
        {' '}
        <AccountDashboard />{' '}
      </TabPanel>
      <TabPanel value={1}> Cool tab 2 </TabPanel>
    </Tabs>
  )
}

import { CssVarsProvider, Box, Divider, Button, Input } from '@mui/joy'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts' // You would need to install recharts for this

const data = [
  { name: 'e181', rewards: 10 },
  { name: 'e182', rewards: 12 },
  { name: 'e183', rewards: 15 },
  { name: 'e184', rewards: 14 },
  { name: 'e185', rewards: 16 },
  { name: 'e186', rewards: 13 },
  { name: 'e187', rewards: 14 },
  { name: 'e188', rewards: 15 }
]

export const AccountDashboard: React.FC = () => {
  return (
    <Sheet sx={{ width: '100%', bgcolor: 'background.level1', borderRadius: 'sm', p: 2 }}>
      {/* Account Information */}
      <Box>
        <Typography level="h4">Account #0</Typography>
        <Typography level="body-md">(m/1852'/1815'/0')</Typography>
        <Divider />
        <Typography>Total funds: ₳ 20,088.905364</Typography>
        <Typography>Balance: ₳ 19,997.812191</Typography>
        <Typography>Rewards: ₳ 91.093173</Typography>
      </Box>

      {/* Available Funds Breakdown */}
      <Box mt={2}>
        <Typography level="h4">Available Funds Breakdown</Typography>
        <Divider />
        <Typography color="success">Est. available: ₳ 20,088.905364</Typography>
        <Typography color="warning">Est. locked: ₳ 0</Typography>
        <Typography>Collateral UTXO: ₳ 5</Typography>
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

      {/* Stake Address */}
      <Box mt={2}>
        <Typography level="h4">Stake Address</Typography>
        <Input
          fullWidth
          value="stake_test1uznrrxppx6q2tgqwqu8wkpsucywcsucL5h/kmcmaqzgxmy/g09pswg"
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
