import * as React from 'react'
import { Sheet, Typography, Button } from '@mui/joy'
import { compiledContract, script, scriptAddr } from '../../contracts/minting'
import { selectedAccountHook } from '../../hooks/selectedAccountHook'
import { backendHook } from '../../hooks/backendHook'
import {
  getProtocolParametersOgmios,
  getAccountUtxoInfoOgmios,
  parseOgmiosUtxosForWallet
} from '../../API/ogmios'
import { txBuilderMint } from './txBuilderMint'

export const MinterHome: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = selectedAccountHook() as any
  const account = JSON.parse(selectedAccount)
  const [accountInfo, setAccountInfo] = React.useState<any>()
  const [backEnd, setBackEnd]: [string | null, (config: string) => Promise<void>] = backendHook()

  const fetchAccountAddressUtxos = async () => {
    const backend = JSON.parse(backEnd as any)
    if (backend && backend[0] === 'ogmios') {
      const data: any = await getAccountUtxoInfoOgmios([account.baseAddress_bech32])
      const parssedAssets = parseOgmiosUtxosForWallet(data)
      const everything = { account, value: parssedAssets, utxos: data }
      console.log('everything', everything)
      setAccountInfo(everything)
    }
  }

  const getProtocolParams = async () => {
    const backend = JSON.parse(backEnd as any)
    let params: any
    backend && backend[0] === 'ogmios' && (params = await getProtocolParametersOgmios())
    return params
  }

  const genMetadata = () => {
    const metadata = {
      label: 420,
      properties: {
        type: 'Cardano Merkaba',
        message: 'Cardano Merkaba Minter IN THE HOUSE',
        message2: 'Mint TX Crafted With PLU-TS'
      }
    }
    return metadata
  }

  const genMintTx = async () => {
    console.log('Compiled contract: ', compiledContract)
    console.log('Script: ', script)
    console.log('Script address: ', scriptAddr)
    const protocolParams = await getProtocolParams()
    const metadata = genMetadata()
    const outputs = [
      {
        address:
          'addr_test1qrvzukfhkw98tdn68rtj0trm5hcufmk3nh67v5d0uqtm5d4xyxvrfcq5skqsac7avrpesga3pe3lf0adh3h6qysdkfus5jxhvn',
        value: {
          coins: 1500000,
          assets: {}
        }
      }
    ]

    const tx = await txBuilderMint(
      protocolParams,
      accountInfo.utxos,
      outputs,
      accountInfo.account.baseAddress_bech32,
      metadata,
      script,
      scriptAddr
    )
    const txCBOR = tx.toCbor().toString()
    const txHash = tx.hash.toString()
    console.log('tx', txCBOR)
  }

  React.useEffect(() => {
    fetchAccountAddressUtxos()
  }, [])

  return (
    <>
      <Typography level="h4">Minter</Typography>
      <Sheet
        sx={{
          top: 60,
          left: 60,
          width: 1200,
          height: 'auto',
          maxHeight: 800,
          overflowY: 'scroll',
          p: 4,
          bgcolor: 'background.body',
          color: 'text.primary'
        }}
      >
        Welcome and get ready to create your first assets on Cardano.
        <Button variant="outlined" color="primary" onClick={genMintTx}>
          Mint
        </Button>
      </Sheet>
    </>
  )
}
