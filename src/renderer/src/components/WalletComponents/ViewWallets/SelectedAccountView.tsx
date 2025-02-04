import * as React from 'react'
import { Sheet } from '@mui/joy'
import { selectedAccountHook } from '../../../hooks/selectedAccountHook'
import { getAccountUtxoInfoOgmios, parseOgmiosUtxosForWallet } from '../../../API/ogmios'
import { backendHook } from '../../../hooks/backendHook'
import { WalletAccountTabs } from './ViewWalletAccountTabs'
interface SelectedAccountViewProps {}

export const SelectedAccountView: React.FC<SelectedAccountViewProps> = () => {
  const [ selectedAccount, setSelectedAccount ] = selectedAccountHook() as any
  const account = JSON.parse(selectedAccount)
  const [ accountInfo, setAccountInfo ] = React.useState<any>()
  const [ backEnd, setBackEnd ]: [string | null, (config: string) => Promise<void>] = backendHook()

  const fetchAccountAddressUtxos = async () => {
    const backend = JSON.parse(backEnd as any)
    if (backend && backend[0] === 'ogmios') {
      const data: any = await getAccountUtxoInfoOgmios([account.baseAddress_bech32])
      const parssedAssets = parseOgmiosUtxosForWallet(data)
      const everything = { account, value: parssedAssets, utxos: data }
      console.log('everything', everything)
      setAccountInfo(everything)
    }
  };

  React.useEffect( () => {
    fetchAccountAddressUtxos()
  }, [selectedAccount])

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
        <WalletAccountTabs accountInfo={accountInfo} />
      </Sheet>
    </>
  )
}
