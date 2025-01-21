import * as React from 'react'
import { Sheet, Typography } from '@mui/joy'
import { selectedAccountHook } from '../../hooks/selectedAccountHook'
import { getAccountUtxoInfoOgmios, parseOgmiosUtxosForWallet } from '../../API/ogmios'
import { backendHook } from '../../hooks/backendHook'
import { Box, Divider, Button, Input } from '@mui/joy'

interface SelectedAccountViewProps {}

export const SelectedAccountView: React.FC<SelectedAccountViewProps> = () => {
  const [selectedAccount, setSelectedAccount] = selectedAccountHook() as any
  const account = JSON.parse(selectedAccount)
  const [accountInfo, setAccountInfo] = React.useState<any>()
  const [backEnd, setBackEnd]: [string | null, (config: string) => Promise<void>] = backendHook()

  React.useEffect(() => {
    console.log('account', account)
    const backend = JSON.parse(backEnd as any)
    console.log('backend', backend)
    backend && backend[0] === 'ogmios' ?
      getAccountUtxoInfoOgmios([account.baseAddress_bech32]).then((data: any) => {
        console.log('data', data)
        const parssedAssets = parseOgmiosUtxosForWallet(data)
        console.log('parssedAssets', parssedAssets)
        const everything = { account, assets: parssedAssets }
        console.log('everything', everything)
        setAccountInfo(everything)
      }  ) : console.log('backend not set')
  }, [])

  return (
    <>

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
        <WalletTabs accountInfo={accountInfo} />
      </Sheet>
    </>
  )
}

import { Tab, Tabs, TabList, TabPanel } from '@mui/joy'

interface WalletTabsProps {
  accountInfo: any
}

export const WalletTabs: React.FC<WalletTabsProps> = ({ accountInfo }) => {
  return (
    <Tabs orientation="vertical" size="sm">
      <TabList>
        <Tab variant="outlined" color="neutral">
          Account: {accountInfo && accountInfo.account.accountName}
        </Tab>
        <Tab variant="outlined" color="neutral">
          Assets
        </Tab>
      </TabList>
      <TabPanel value={0}>
        {' '}
        <AccountDashboard accountInfo={accountInfo} />{' '}
      </TabPanel>
      <TabPanel value={1}>
         <AccountAssetsDashboard assets={accountInfo && accountInfo.assets && accountInfo.assets} /> {' '} 
      </TabPanel>
    </Tabs>
  )
}

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
          Total funds: ₳ {accountInfo ? accountInfo.assets.lovelace / 1000000 : '****'}{' '}
        </Typography>
        <Typography>Balance: ₳ ****</Typography>
        <Typography>Rewards: ₳ ****</Typography>
      </Box>

      {/* Available Funds Breakdown */}
      <Box mt={2}>
        <Typography level="h4">Available Funds Breakdown</Typography>
        <Divider />
        <Typography color="success">
          Est. available: ₳ {accountInfo ? accountInfo.assets.lovelace / 1000000 : '****'}
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

import { List, ListItem, ListItemButton } from '@mui/joy';


interface Asset {
  policyId: string;
  tokenName: string;
  amount: number;
  tokenNameDecoded: string;
}

interface AccountAssetsDashboardProps {
  assets: { lovelace: number; assets: { [key: string]: { [key: string]: number } } };
}

export const AccountAssetsDashboard: React.FC<AccountAssetsDashboardProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [filteredAssets, setFilteredAssets] = React.useState<{ [key: string]: Asset[] }>({});

  // Convert hex to string for token names
  const hexToString = (hex: string): string => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  };

  // Filter and group assets by Policy ID
  const filterAssets = (term: string): { [key: string]: Asset[] } => {
    const flatAssets: Asset[] = Object.entries(assets.assets).flatMap(([policyId, tokens]) => 
      Object.entries(tokens).map(([tokenName, amount]) => ({
        policyId,
        tokenName,
        amount: amount as number,
        tokenNameDecoded: hexToString(tokenName)
      }))
    );

    if (term === '') {
      // If the search term is empty, return all assets
      return flatAssets.reduce((acc, asset) => {
        if (!acc[asset.policyId]) {
          acc[asset.policyId] = [];
        }
        acc[asset.policyId].push(asset);
        return acc;
      }, {} as { [key: string]: Asset[] });
    } else {
      // Filter assets based on search term
      return flatAssets.reduce((acc, asset) => {
        if (!acc[asset.policyId] && (asset.policyId.toLowerCase().includes(term.toLowerCase()) || asset.tokenNameDecoded.toLowerCase().includes(term.toLowerCase()))) {
          acc[asset.policyId] = [];
        }
        if (acc[asset.policyId] && asset.tokenNameDecoded.toLowerCase().includes(term.toLowerCase())) {
          acc[asset.policyId].push(asset);
        }
        return acc;
      }, {} as { [key: string]: Asset[] });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    setFilteredAssets(filterAssets(term));
  };

  React.useEffect(() => {
    // Initial load with all assets
    setFilteredAssets(filterAssets(''));
  }, [assets]); // This effect runs when 'assets' prop changes

  return (
    <Sheet sx={{ width: '100%', bgcolor: 'background.level1', borderRadius: 'sm', p: 2 }}>
      <Typography level="h3" sx={{ mb: 2 }}>Your Assets</Typography>

      <Input 
        placeholder="Search by Policy ID or Token Name"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />

      <List>
        {Object.entries(filteredAssets).map(([policyId, tokens]) => (
          <React.Fragment key={policyId}>
            <Typography level="h5" sx={{ mt: 2 }}>Poliocy ID: {policyId}</Typography>
            {tokens.map((asset, index) => (
              <ListItem key={index} sx={{ p: 0 }}>
                <ListItemButton 
                  component="div" 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 'sm',
                    p: 1,
                    mb: 1,
                    width: '100%'
                  }}
                  onClick={() => console.log('View metadata for:', asset.tokenNameDecoded)}
                >
                  {/* Placeholder for asset image */}
                  <div style={{ width: '50px', height: '50px', backgroundColor: '#e0e0e0', marginRight: '10px' }}></div>
                  <div>
                    <Typography level="body-md">{asset.tokenNameDecoded}</Typography>
                    <Typography level="body-md">{`Amount: ${asset.amount}`}</Typography>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outlined" 
                    sx={{ ml: 'auto' }}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      console.log('More info for:', asset.tokenNameDecoded);
                    }}
                  >
                    More Info
                  </Button>
                </ListItemButton>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
        {Object.keys(filteredAssets).length === 0 && (
          <ListItem><Typography>No assets match your search.</Typography></ListItem>
        )}
      </List>
    </Sheet>
  );
}