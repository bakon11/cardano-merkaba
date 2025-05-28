import * as React from 'react'
import { Tab, Tabs, TabList, TabPanel, Box } from '@mui/joy'
import { AccountDashboard } from './AccountDashboard'
import { AccountAssetsDashboard } from './AccountAssetsDashboard'
import { SendTxView } from '../SendTxView/SendTxView'
import { ViewStakePools } from '../../StakePools/ViewStakePools'

interface WalletTabsProps {
  accountInfo: any
}

export const WalletAccountTabs: React.FC<WalletTabsProps> = ({ accountInfo }) => {
  return (
    <Box
     sx={{
        height: '85vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden' 
      }}
    >
      <Tabs orientation="horizontal" size="sm" sx={{ flexShrink: 0 }}>
        <TabList
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            bgcolor: 'background.surface',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tab variant="outlined" color="neutral">
            Account: {accountInfo && accountInfo.account.accountName}
          </Tab>
          <Tab variant="outlined" color="neutral">
            Assets
          </Tab>
          <Tab variant="outlined" color="neutral">
            Send
          </Tab>
          <Tab variant="outlined" color="neutral">
            Stake Pools
          </Tab>
        </TabList>
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <TabPanel value={0}>
            <AccountDashboard accountInfo={accountInfo} />
          </TabPanel>
          <TabPanel value={1}>
            <AccountAssetsDashboard value={accountInfo && accountInfo.value && accountInfo.value} />
          </TabPanel>
          <TabPanel value={2}>
            <SendTxView accountInfo={accountInfo} />
          </TabPanel>
          <TabPanel value={3}>
            <ViewStakePools />
          </TabPanel>
        </Box>
      </Tabs>
    </Box>
  )
}