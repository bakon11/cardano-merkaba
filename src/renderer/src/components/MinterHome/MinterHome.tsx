import * as React from 'react';
import { Sheet, Typography, Button, Input, Stack, List, ListItem, IconButton } from '@mui/joy';
import { Close } from '@mui/icons-material';
import { backendHook } from '../../hooks/backendHook';
import { networkSelectHook } from '../../hooks/networkSelectHook';
import { getProtocolParametersOgmios } from '../../API/ogmios';
// import { txBuilder_buildooor } from './txBuilder';
import { txBuilder_buildooor } from "../ProcessTxModal/txBuilder";
import { ProcessTxModal } from '../ProcessTxModal/ProcessTxModal';
import { fromAscii, toAscii } from '@harmoniclabs/uint8array-utils';
import { PubKeyHash, Value, DataConstr } from '@harmoniclabs/buildooor';
import { genPolicy, genPolicy2 } from './genPolicy';
import { professionalStyle, accentStyle } from './styles';
import { selectedAccountHook } from '../../hooks/selectedAccountHook';
import { SelectAccount } from '../SelectAccount/SelectAccount';

export const MinterHome: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = selectedAccountHook() as any
  // const account = JSON.parse(selectedAccount)
  // const [accountInfo, setAccountInfo] = React.useState<any>();
  const [backEnd, setBackEnd]: [string | null, (config: string) => Promise<void>] = backendHook();
  const [scriptHook, setScript] = React.useState<any>();
  const [scriptAddrHook, setScriptAddr] = React.useState<any>();
  const [policyIdHook, setPolicyId] = React.useState<PubKeyHash | string>();
  const [assetsToMint, setAssetsToMint] = React.useState<any>([]);
  const [mintedValue, setMintedValue] = React.useState<any>();
  const [mints, setMints] = React.useState<any>([]);
  const [assetName, setAssetName] = React.useState<string>('');
  const [assetQuantity, setAssetQuantity] = React.useState<number>(0);
  const [tokenPolicyNameHook, setTokenPolicyName] = React.useState<string>('');
  const [Metadata, setMetadata] = React.useState<any>([]);
  const [network, setNetwork] = networkSelectHook();

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
    const policyIdStr: string  = policyIdHook?.toString();

    const nftName = "DCL CARDANO NFT";
    const m = {
      [policyIdStr]: {
        [nftName]: {
          name: nftName,
          description: "This is an NFT from DeepchainLabs",
          image: "https://deepchainlabs.com/_next/image?url=/images/DCL_logo_header.png",
          id: "2",
        },
      },
    };

    setMetadata(m)
    return m
  }

  const genPolicyInfo = () => {
    const { scriptCompiled, scriptAddr, policyID } = genPolicy(tokenPolicyNameHook)
    setScript(scriptCompiled)
    setScriptAddr(scriptAddr)
    setPolicyId(policyID)
  }

  /*
  const genPolicyInfo2 = () => {
    const { scriptCompiled, scriptAddr, policyID } = genPolicy2(tokenPolicyNameHook)
    setScript(scriptCompiled)
    setScriptAddr(scriptAddr)
    setPolicyId(policyID)
  }
  */
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
    const tx = await txBuilder_buildooor(
      protocolParams,
      JSON.parse(selectedAccount).utxos,
      [],
      JSON.parse(selectedAccount).baseAddress_bech32,
      address_xprv,
      metadata,
      scriptHook,
      scriptAddrHook,
      mints,
      mintedValue
    )
    return tx
  }

  return (
    <>
      <Typography level="h4">Minter</Typography>
      <Sheet
        sx={{
          top: 30,
          left: 60,
          width: 1200,
          height: 'auto',
          maxHeight: 1250,
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
              <SelectAccount />
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
            <ProcessTxModal processTx={processTx} selectedAccount={JSON.parse(selectedAccount)} />
          </Stack>
        </Sheet>
      </Sheet>
    </>
  )
};