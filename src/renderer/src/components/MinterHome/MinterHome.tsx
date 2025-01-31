import * as React from 'react'
import { Sheet, Typography, Button, Input, Stack, List, ListItem, IconButton } from '@mui/joy'
import { Close } from '@mui/icons-material'
import { backendHook } from '../../hooks/backendHook'
import { networkSelectHook } from '../../hooks/networkSelectHook'
import {
  getProtocolParametersOgmios,
  getAccountUtxoInfoOgmios,
  parseOgmiosUtxosForWallet
} from '../../API/ogmios'
import { txBuilderMint } from './txBuilderMint'
import { ProcessTxModal } from '../ProcessTxModal/ProcessTxModal'
import { fromAscii, toAscii } from '@harmoniclabs/uint8array-utils'
import { PubKeyHash, Value, DataConstr } from '@harmoniclabs/buildooor'
import { genPolicy, genPolicy2 } from './genPolicy'
import { professionalStyle, accentStyle } from './styles'

export const MinterHome: React.FC = () => {
  // const [selectedAccount, setSelectedAccount] = selectedAccountHook() as any
  // const account = JSON.parse(selectedAccount)
  const getAllWallets = (): any => window.api.getAllWallets()
  const [allWallets, setAllWallets] = React.useState<any>([])
  const [accountInfo, setAccountInfo] = React.useState<any>()
  const [backEnd, setBackEnd]: [string | null, (config: string) => Promise<void>] = backendHook()
  const [scriptHook, setScript] = React.useState<any>()
  const [scriptAddrHook, setScriptAddr] = React.useState<any>()
  const [policyIdHook, setPolicyId] = React.useState<PubKeyHash>()
  const [assetsToMint, setAssetsToMint] = React.useState<any>([])
  const [mintedValue, setMintedValue] = React.useState<any>()
  const [mints, setMints] = React.useState<any>([])
  const [assetName, setAssetName] = React.useState<string>('')
  const [assetQuantity, setAssetQuantity] = React.useState<number>(0)
  const [tokenPolicyNameHook, setTokenPolicyName] = React.useState<string>('')
  const [network, setNetwork] = networkSelectHook()
  const [txCBOR, setTXCBOR] = React.useState<string>('')

  const getWalletAccounts = async () => {
    const data = await getAllWallets()
    console.log('data', data)
    setAllWallets(data)
  }
  const fetchAccountAddressUtxos = async (selectedAccount: any) => {
    console.log('selectedAccount', selectedAccount)
    const backend = JSON.parse(backEnd as any)
    if (backend && backend[0] === 'ogmios') {
      const data: any = await getAccountUtxoInfoOgmios([selectedAccount.baseAddress_bech32])
      const parssedAssets = parseOgmiosUtxosForWallet(data)
      const everything = { account: selectedAccount, value: parssedAssets, utxos: data }
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

  const genPolicyInfo = () => {
    const { scriptCompiled, scriptAddr, policyID } = genPolicy(tokenPolicyNameHook)
    setScript(scriptCompiled)
    setScriptAddr(scriptAddr)
    setPolicyId(policyID)
  }

  const genPolicyInfo2 = () => {
    const { scriptCompiled, scriptAddr, policyID } = genPolicy2(tokenPolicyNameHook)
    setScript(scriptCompiled)
    setScriptAddr(scriptAddr)
    setPolicyId(policyID)
  }

  const genAssets = () => {
    const currentAssets = assetsToMint
    currentAssets.push({
      name: fromAscii(assetName),
      quantity: Number(assetQuantity)
    })
    console.log('currentAssets', currentAssets)
    const mintedValue = new Value([
      {
        // policy: scriptAddr.paymentCreds.hash,
        policy: policyIdHook as PubKeyHash,
        assets: currentAssets
      }
    ])
    const mints = [
      {
        script: {
          inline: scriptHook,
          redeemer: new DataConstr(0, [])
        },
        value: mintedValue
      }
    ]
    setAssetsToMint(currentAssets)
    setMintedValue(mintedValue)
    setMints(mints)
    setAssetName('')
    setAssetQuantity(0)
    console.log('mintedValue', mintedValue.toJson())
  }

  const removeAsset = (index: number) => {
    const newAssets = [...assetsToMint]
    newAssets.splice(index, 1)
    setAssetsToMint(newAssets)
  }

  // This will pull protcol params, encrypted entropy for selected account, and generate the minting transaction
  //And sign it then give you ready CBOR and option to send it off.
  const processTx = async (address_xprv) => {
    const protocolParams = await getProtocolParams()
    console.log('protocolParams', protocolParams)
    const metadata = genMetadata()
    const tx = await txBuilderMint(
      protocolParams,
      accountInfo.utxos,
      accountInfo.account.baseAddress_bech32,
      address_xprv,
      metadata,
      scriptHook,
      scriptAddrHook,
      mints,
      mintedValue
    )
    return tx
  }

  React.useEffect(() => {
    getWalletAccounts()
  }, [])

  return (
    <>
      <Typography level="h4">Minter</Typography>
      <Sheet
        sx={{
          top: 30,
          left: 60,
          width: 1200,
          height: 'auto',
          maxHeight: 950,
          overflowY: 'scroll',
          p: 4,
          bgcolor: 'background.body',
          color: 'text.primary',
          m: 4
        }}
      >
        <Sheet
          sx={{
            height: 'auto',
            p: 2
          }}
        >
          <Stack spacing={2} direction="column">
            <Typography level="body-md">Select Minting Account:</Typography>
            <Sheet
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 'sm',
                border: '1px solid white'
              }}
            >
              <SelectMintingAccount
                allWallets={allWallets}
                setAccountInfo={setAccountInfo}
                fetchAccountAddressUtxos={fetchAccountAddressUtxos}
              />
            </Sheet>
            <Typography level="body-md">Policy Info:</Typography>
            <Sheet
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 'sm',
                border: '1px solid white'
              }}
            >
              {/* Minting Contract Hash */}
              <Input
                startDecorator="Compiled Contract CBOR:"
                value={scriptHook && scriptHook.toCbor().toString()}
                sx={{
                  ...professionalStyle,
                  color: '#E0E0E0',
                  borderColor: '#212121',
                  width: '100%'
                }}
                disabled
              />
              {/* Script Hash */}
              <Input
                startDecorator="Script Hash:"
                value={scriptHook && (scriptHook.hash as string)}
                disabled
                sx={{
                  ...professionalStyle,
                  color: '#E0E0E0',
                  borderColor: '#212121',
                  width: '100%'
                }}
              />
              {/* Script Address */}
              <Input
                startDecorator="Script Address:"
                value={scriptAddrHook && scriptAddrHook}
                disabled
                sx={{
                  ...professionalStyle,
                  color: '#E0E0E0',
                  borderColor: '#212121',
                  width: '100%'
                }}
              />
              {/* Policy Id */}
              <Input
                startDecorator="Policy Id:"
                value={policyIdHook && (policyIdHook as unknown as string)}
                disabled
                sx={{
                  ...professionalStyle,
                  color: '#E0E0E0',
                  borderColor: '#212121',
                  width: '100%'
                }}
              />

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <Button
                  onClick={() => genPolicyInfo()}
                  disabled={!tokenPolicyNameHook}
                  sx={{ m: 2, cursor: 'pointer', ...accentStyle, color: '#121212' }}
                >
                  Generate Policy
                </Button>
                <Input
                  startDecorator="Token Policy Name:"
                  value={tokenPolicyNameHook}
                  onChange={(e) => setTokenPolicyName(e.target.value)}
                  sx={{
                    ...professionalStyle,
                    color: '#E0E0E0',
                    borderColor: '#212121',
                    width: '100%'
                  }}
                />
              </Stack>
            </Sheet>

            <Typography level="body-md">Add Assets:</Typography>
            <Sheet
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 'sm',
                border: '1px solid white'
              }}
            >
              <Stack spacing={2}>
                <Input
                  startDecorator="Asset Name:"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  sx={{
                    ...professionalStyle,
                    color: '#E0E0E0',
                    borderColor: '#212121',
                    width: '100%'
                  }}
                />
                <Input
                  startDecorator="Asset Quantity:"
                  value={assetQuantity}
                  type="number"
                  onChange={(e) => setAssetQuantity(Number(e.target.value))}
                  sx={{
                    ...professionalStyle,
                    color: '#E0E0E0',
                    borderColor: '#212121',
                    width: '100%'
                  }}
                />
                <Button
                  onClick={genAssets}
                  disabled={!policyIdHook}
                  sx={{ m: 2, cursor: 'pointer', ...accentStyle, color: '#121212' }}
                >
                  Add Assets
                </Button>
              </Stack>
            </Sheet>

            <Typography level="body-md">Assets to Mint:</Typography>
            <Sheet
              sx={{
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 'sm',
                border: '1px solid white'
              }}
            >
              {assetsToMint.length > 0 ? (
                <List
                  sx={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    bgcolor: 'background.default'
                  }}
                >
                  {assetsToMint.map((asset: any, index: number) => (
                    <ListItem
                      key={index}
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography>
                        {toAscii(asset.name)} - Quantity: {asset.quantity}
                      </Typography>
                      <IconButton onClick={() => removeAsset(index)}>
                        <Close />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No assets to mint yet.</Typography>
              )}
            </Sheet>

            <Typography level="body-md">Assets Metadata:</Typography>
            <Sheet
              sx={{
                height: '100px',
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 'sm',
                border: '1px solid white'
              }}
            >
              {/* Placeholder for future metadata display */}
              <Typography>Metadata will be shown here...</Typography>
            </Sheet>
            <ProcessTxModal processTx={processTx} accountInfo={accountInfo} />
          </Stack>
        </Sheet>
      </Sheet>
    </>
  )
}

import { Select, Option } from '@mui/joy'

interface SelectMintingAccountProps {
  allWallets: any[]
  setAccountInfo: React.Dispatch<React.SetStateAction<any | null>>
  fetchAccountAddressUtxos: (selectedAccount: any) => Promise<void>
}

const SelectMintingAccount: React.FC<SelectMintingAccountProps> = ({
  allWallets,
  setAccountInfo,
  fetchAccountAddressUtxos
}) => {
  const [selectedWalletId, setSelectedWalletId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (selectedWalletId) {
      const selectedWallet = allWallets.find((wallet) => wallet.walletId === selectedWalletId)
      console.log('selectedWallet', selectedWallet)
      if (selectedWallet) {
        setAccountInfo(selectedWallet)
        fetchAccountAddressUtxos(selectedWallet)
      }
    }
  }, [selectedWalletId])

  return (
    <Select
      placeholder="Select a wallet"
      value={selectedWalletId}
      onChange={(event, newValue) => {
        setSelectedWalletId(newValue)
      }}
    >
      {allWallets.map((wallet) => (
        <Option key={wallet.walletId} value={wallet.walletId}>
          {wallet.walletName} - {wallet.accountName}
        </Option>
      ))}
    </Select>
  )
}
