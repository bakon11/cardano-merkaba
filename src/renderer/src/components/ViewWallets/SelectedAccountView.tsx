import * as React from 'react'
import { Sheet,  } from '@mui/joy'
import { selectedAccountHook } from '../../hooks/selectedAccountHook'
import { getAccountUtxoInfoOgmios, parseOgmiosUtxosForWallet } from '../../API/ogmios'
import { backendHook } from '../../hooks/backendHook'
import { WalletAccountTabs } from './ViewWalletAccountTabs'
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
        <WalletAccountTabs accountInfo={accountInfo} />
      </Sheet>
    </>
  )
}