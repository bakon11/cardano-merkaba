import * as React from 'react'
import { Tab, Tabs, TabList, TabPanel } from '@mui/joy'
import { AccountDashboard } from './AccountDashboard'
import { AccountAssetsDashboard } from './AccountAssetsDashboard'
import { SendTxView } from './SendTxView'

interface WalletTabsProps {
  accountInfo: any
}

export const WalletAccountTabs: React.FC<WalletTabsProps> = ({ accountInfo }) => {
  return (
    <Tabs orientation="vertical" size="sm">
      <TabList>
        <Tab variant="outlined" color="neutral">
          Account: {accountInfo && accountInfo.account.accountName}
        </Tab>
        <Tab variant="outlined" color="neutral">
          Assets
        </Tab>
        <Tab variant="outlined" color="neutral">
          Send
        </Tab>
      </TabList>
      <TabPanel value={0}>
        {' '}
        <AccountDashboard accountInfo={accountInfo} />{' '}
      </TabPanel>
      <TabPanel value={1}>
         <AccountAssetsDashboard value={accountInfo && accountInfo.value && accountInfo.value} /> {' '} 
      </TabPanel>
      <TabPanel value={2}>
        <SendTxView accountInfo={accountInfo} />
      </TabPanel>
    </Tabs>
  )
}