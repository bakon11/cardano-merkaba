import * as React from 'react'
import { Sheet, Typography, Button, Input, Stack, List, ListItem, IconButton } from '@mui/joy'
import { Close } from '@mui/icons-material'
import { selectedAccountHook } from '../../hooks/selectedAccountHook'
import { backendHook } from '../../hooks/backendHook'
import {
  getProtocolParametersOgmios,
  getAccountUtxoInfoOgmios,
  parseOgmiosUtxosForWallet
} from '../../API/ogmios'
import { txBuilderMint } from './txBuilderMint'
import { toUtf8, fromHex, toHex, fromAscii, toAscii } from '@harmoniclabs/uint8array-utils'
import {
  Address,
  PScriptContext,
  PTokenName,
  ScriptType,
  Credential,
  Script,
  compile,
  pfn,
  unit,
  PubKeyHash,
  Value,
  pBool,
  passert
} from '@harmoniclabs/plu-ts'
import { genRootPrivateKey, genAddressPrv, decrypt } from '../../lib/cryptoPLUTS'

export const MinterHome: React.FC = () => {
  // const [selectedAccount, setSelectedAccount] = selectedAccountHook() as any
  // const account = JSON.parse(selectedAccount)
  const getAllWallets = (): any => window.api.getAllWallets()
  const [allWallets, setAllWallets] = React.useState<any>([])
  const [mintingAccount, setMintingAccount] = React.useState()
  const [accountInfo, setAccountInfo] = React.useState<any>()
  const [backEnd, setBackEnd]: [string | null, (config: string) => Promise<void>] = backendHook()
  const [scriptHook, setScript] = React.useState<any>()
  const [scriptAddrHook, setScriptAddr] = React.useState<any>()
  const [policyIdHook, setPolicyId] = React.useState<PubKeyHash>()
  const [assetsToMint, setAssetsToMint] = React.useState<any>([])
  const [mintedValue, setMintedValue] = React.useState<any>()
  const [assetName, setAssetName] = React.useState<string>('')
  const [assetQuantity, setAssetQuantity] = React.useState<number>(0)
  const [tokenPolicyNameHook, setTokenPolicyName] = React.useState<string>('')

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
    const namedTokenPolicy = pfn(
      [PTokenName.type, PScriptContext.type],
      unit
    )((tn, { redeemer, tx, purpose }) => {
      return passert.$(true);
    })
    const aTn = fromAscii(tokenPolicyNameHook)
    const aPolicySrc = namedTokenPolicy.$(aTn)

    const aPolicy = new Script(ScriptType.PlutusV3, compile(aPolicySrc))
    console.log('Script: ', aPolicy)

    const scriptAddr = new Address('testnet', Credential.script(aPolicy.hash))
    console.log('Script address: ', scriptAddr)

    setScript(aPolicy)
    setScriptAddr(scriptAddr)
    setPolicyId(scriptAddr.paymentCreds.hash)
  }

  const genPolicyInfo2 = () => {
    const contract = pfn([
      PScriptContext.type
    ], unit)
    (({ redeemer, tx, purpose }) => {
      return passert.$(true);
    });
    
    const compiledContract = compile(contract);
    
    const script = new Script(
      ScriptType.PlutusV3,
      compiledContract
    );
    
    const scriptTestnetAddr = new Address(
      "testnet",
      Credential.script(script.hash)
    );

    setScript(script)
    setScriptAddr(scriptTestnetAddr)
    setPolicyId(scriptTestnetAddr.paymentCreds.hash)
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
        policy: policyIdHook as any,
        assets: currentAssets
      }
    ])
    setAssetsToMint(currentAssets)
    setMintedValue(mintedValue)
    console.log('currentAssets', currentAssets)
    setAssetName('')
    setAssetQuantity(0)
  }

  const removeAsset = (index: number) => {
    const newAssets = [...assetsToMint]
    newAssets.splice(index, 1)
    setAssetsToMint(newAssets)
  }

  const genMintTx = async () => {
    const protocolParams = await getProtocolParams()
    const metadata = genMetadata()
    const outputs = []
    console.log('accountInfo', accountInfo)
    const getWalletEntropy = (walletId: string): any => window.api.getWalletEntropy(walletId)
    const walletEntropy = await getWalletEntropy(accountInfo.account.walletId)
    console.log('walletEntropy', walletEntropy.entropyEncrypt)
    const entropyDecrypted = decrypt(walletEntropy.entropyEncrypt, 'baca1983')
    console.log('entropyDecrypted', entropyDecrypted)
    const root_xprv: any = genRootPrivateKey(entropyDecrypted)
    console.log('root_xprv', root_xprv)
    // const account_xprv = genAccountPrivatekey(root_xprv, accountInfo.account.accountIndex)
    // console.log('account_xprv', account_xprv)
    const address_xprv = genAddressPrv(
      root_xprv,
      accountInfo.account.accountIndex,
      0,
      accountInfo.account.addressIndex
    )

    const tx = await txBuilderMint(
      protocolParams,
      accountInfo.utxos,
      outputs,
      accountInfo.account.baseAddress_bech32,
      address_xprv,
      metadata,
      scriptHook,
      scriptAddrHook,
      mintedValue
    )
    const txCBOR = tx.toCbor().toString()
    const txHash = tx.hash.toString()
    console.log('tx', txCBOR)
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
          maxHeight: 9000,
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
            <Typography level="h5">Select Minting Account:</Typography>
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
                setMintingAccount={setMintingAccount}
                fetchAccountAddressUtxos={fetchAccountAddressUtxos}
              />
            </Sheet>
            <Typography level="h5">Policy Info:</Typography>
            <Sheet
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 'sm',
                border: '1px solid white'
              }}
            >
              {/* Minting Contract Hash */}
              <Input startDecorator="Compiled Contract HASH:" value={''} disabled />
              {/* Script Hash */}
              <Input startDecorator="Script Hash:" value={scriptHook && scriptHook.hash} disabled />
              {/* Script Address */}
              <Input
                startDecorator="Script Address:"
                value={scriptAddrHook && scriptAddrHook}
                disabled
              />
              {/* Policy Id */}
              <Input startDecorator="Policy Id:" value={policyIdHook && policyIdHook} disabled />

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <Button onClick={() => genPolicyInfo()} disabled={!tokenPolicyNameHook}>
                  Generate Policy
                </Button>
                <Input
                  startDecorator="Token Policy Name:"
                  value={tokenPolicyNameHook}
                  onChange={(e) => setTokenPolicyName(e.target.value)}
                  sx={{ maxWidth: '400px' }}
                />
              </Stack>
            </Sheet>

            <Typography level="h5">Add Assets:</Typography>
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
                />
                <Input
                  startDecorator="Asset Quantity:"
                  value={assetQuantity}
                  type="number"
                  onChange={(e) => setAssetQuantity(Number(e.target.value))}
                />
                <Button onClick={genAssets} disabled={!policyIdHook}>
                  Add Assets
                </Button>
              </Stack>
            </Sheet>

            <Typography level="h5">Assets to Mint:</Typography>
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

            <Typography level="h5">Assets Metadata:</Typography>
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

            <Button
              variant="outlined"
              color="primary"
              onClick={genMintTx}
              disabled={assetsToMint.length === 0}
            >
              Mint
            </Button>
          </Stack>
        </Sheet>
      </Sheet>
    </>
  )
}

import { Select, Option } from '@mui/joy'

interface SelectMintingAccountProps {
  allWallets: any[]
  setMintingAccount: React.Dispatch<React.SetStateAction<any | null>>
  fetchAccountAddressUtxos: (selectedAccount: any) => Promise<void>
}

const SelectMintingAccount: React.FC<SelectMintingAccountProps> = ({
  allWallets,
  setMintingAccount,
  fetchAccountAddressUtxos
}) => {
  const [selectedWalletId, setSelectedWalletId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (selectedWalletId) {
      const selectedWallet = allWallets.find((wallet) => wallet.walletId === selectedWalletId)
      console.log('selectedWallet', selectedWallet)
      if (selectedWallet) {
        setMintingAccount(selectedWallet)
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
