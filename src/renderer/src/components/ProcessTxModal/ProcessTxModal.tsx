import * as React from 'react'
import {  Modal,  ModalClose,  ModalDialog,  Typography,  Sheet,  Button,  Input,  Stack,  List,  ListItem,  ListItemButton,  ListItemContent,  ListItemDecorator,  IconButton,  Box,  Grid} from '@mui/joy'
import { Close } from '@mui/icons-material'
import { genRootPrivateKey, genAddressPrv, decrypt } from '../../lib/buildooor'
import { professionalStyle, accentStyle, sectionTitleStyle, displayAssets } from './styles'
import { wsp } from '../../API/ogmios'

// Custom component for collapsible sections
const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children
}) => {
  const [open, setOpen] = React.useState(true)
  return (
    <List>
      <ListItemButton onClick={() => setOpen(!open)} sx={{ ...accentStyle, color: '#121212', height:"20px" }}>
        <ListItemDecorator>
          <IconButton>
            <Close sx={{ color: '#121212' }} />
          </IconButton>
        </ListItemDecorator>
        <ListItemContent>{title}</ListItemContent>
      </ListItemButton>
      {open && (
        <ListItem sx={{ bgcolor: '#1A1A1A', border: 'none', borderRadius: '8px', padding: '15px' }}>
          <Box sx={{ professionalStyle }}>{children}</Box>
        </ListItem>
      )}
    </List>
  )
}

interface ProcessTxModalProps {
  processTx: (address_xprv: any) => Promise<any>
  selectedAccount: any
}

export const ProcessTxModal: React.FC<ProcessTxModalProps> = ({ processTx, selectedAccount }) => {
  const [ open, setOpen ] = React.useState(false)
  const [ tx, setTX] = React.useState<any>()
  const [ txRaw, setTXRaw] = React.useState<any>()
  const [ spendingPassword, setSpendingPassword] = React.useState('')
  const [ signed, setSigned] = React.useState(false)
  const [ status, setStatus ] = React.useState('')

  const signTx = async () => {
    console.log('selectedAccount', selectedAccount)
    const getWalletEntropy = (walletId: string): any => window.api.getWalletEntropy(walletId)
    const walletEntropy = await getWalletEntropy(selectedAccount.walletId)
    console.log('walletEntropy', walletEntropy.entropyEncrypt)
    const entropyDecrypted = decrypt(walletEntropy.entropyEncrypt, spendingPassword)
    console.log('entropyDecrypted', entropyDecrypted)
    entropyDecrypted !== 'error' ? setSigned(true) : setSigned(false)
    entropyDecrypted !== 'error' ? setStatus('Press send to publish your tx to the Cardano blockchain.') : setStatus('Please enter your Spending Password to sign the transaction.')
    const root_xprv: any = genRootPrivateKey(entropyDecrypted !== 'error' && entropyDecrypted !=="" ? entropyDecrypted : '')
    console.log('root_xprv', root_xprv)
    const address_xprv = genAddressPrv(
      root_xprv,
      selectedAccount.accountIndex,
      0,
      selectedAccount.addressIndex
    )
    console.log('address_xprv', address_xprv)
    const txProcessed: any = await processTx(address_xprv)
    setTX(txProcessed.toJson())
    setTXRaw(txProcessed)
    // wsp('releaseMempool', {})
    // sendTx(txProcessed.toCbor().toString())
    // getMemoPool(txProcessed.hash.toString())
  }

  const sendTx = async () => {
    const txSend = wsp('submitTransaction', {
      transaction: {
        cbor: txRaw.toCbor().toString()
      }
    })

    txSend.onmessage = (e: MessageEvent) => {
      try {
        const results = JSON.parse(e.data)
        results.error && setStatus(results.error.message || "Error sending transaction. Please try again.")
        if (results.result) {
          setStatus("TX has been sent: " + 
            `<a href="https://preprod.cardanoscan.io/transaction/${results.result.transaction.id}" target="_blank">
              ${results.result.transaction.id}
            </a>`)}
        results.result && getMemoPool(results.result.transaction.id)
        console.log('WebSocket message received:', results)
      } catch (parseError) {
        console.log('Error parsing WebSocket message:', parseError)
      }
    }
  }

  const getMemoPool = async (txhash: string) => {
    const mempool = wsp('nextTransaction', { fields: 'all' })
    mempool.onmessage = (e: MessageEvent) => {
      try {
        const results = JSON.parse(e.data)
        results.result.transaction === null && setTimeout(() => getMemoPool(txhash), 1000)
        results.result.transaction !== null && wsp('nextTransaction', { pfields: 'all' })
        console.log('WebSocket message received:', results.result.transaction)
      } catch (parseError) {
        console.log('Error parsing WebSocket message:', parseError)
      }
    }
  }

  React.useEffect(() => {
    open === true && signTx()
    open === false && setSigned(false)
    open === false && setSpendingPassword('')
  }, [open === true])

  return (
    <>
      <Button
        sx={{ m: 2, cursor: 'pointer', ...accentStyle, color: '#121212' }}
        onClick={() => setOpen(true)}
      >
        PROCESS TX
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(18,18,18,0.8)'
        }}
      >
        <ModalDialog
          sx={{
            width: '2000px', // Increased width for a wider modal
            maxWidth: '95vw', // Max width to prevent overflow on smaller screens
            maxHeight: '1000px',
            overflowY: 'auto',
            p: 4,
            bgcolor: '#121212',
            color: '#E0E0E0',
            border: '1px solid #212121',
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
          }}
        >
          <ModalClose sx={{ color: '#E0E0E0' }} />
          <Typography level="h4" sx={sectionTitleStyle}>
            TRANSACTION DETAILS
          </Typography>
          <Sheet sx={{ height: 'auto', p: 2, ...professionalStyle }}>
            <Stack spacing={3} direction="column">
              {signed === false ? (
                <Stack spacing={3} direction="row">
                  <Input
                    type="password"
                    startDecorator="Spending Password:"
                    value={spendingPassword}
                    onChange={(e) => setSpendingPassword(e.target.value)}
                    sx={{
                      ...professionalStyle,
                      color: '#E0E0E0',
                      borderColor: '#212121',
                      width: '60%'
                    }}
                  />
                  <Button
                    sx={{ m: 2, cursor: 'pointer', ...accentStyle, color: '#121212', width: '40%' }}
                    onClick={() => signTx()}
                  >
                    Sign TX
                  </Button>
                </Stack>
              ) : (
                <>
                  {' '}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => sendTx()}
                    sx={{ ...accentStyle, color: '#121212', borderColor: '#121212' }}
                  >
                    Send
                  </Button>
                </>
              )}{' '}
              {status && 
                <Typography sx={{ ...professionalStyle, color: '#E0E0E0', borderColor: '#212121' }}>
                  {status}
                </Typography>
              }
              {/* Increased spacing for better visual separation */}
              {/* Transaction ID */}
              <Input
                startDecorator="ID:"
                value={tx?.body?.inputs?.[0]?.utxoRef?.id || 'N/A'}
                disabled
                sx={{ ...professionalStyle, color: '#E0E0E0', borderColor: '#212121' }}
              />
              {/* Transaction Size */}
              <Input
                startDecorator="SIZE:"
                value={
                  tx ? txRaw.toCbor().toBuffer().length + ' BYTES' : 'N/A'
                }
                disabled
                sx={{ ...professionalStyle, color: '#E0E0E0', borderColor: '#212121' }}
              />
              {/* Transaction Fee */}
              <Input
                startDecorator="FEE:"
                value={tx?.body?.fee + ' lovelaces' + " | ₳" + (tx?.body?.fee / 1000000) + " ADA" || 'N/A'}
                disabled
                sx={{ ...professionalStyle, color: '#E0E0E0', borderColor: '#212121' }}
              />
              {/* Witness Set, Plutus Contracts, and Mints */}
              <Grid container spacing={2}>
                <Grid xs={12} md={4}>
                  <CollapsibleSection title="WITNESS SET">
                    {tx && tx.witnesses.vkeyWitnesses && <VkeyWitnesses vkeyWitnesses={tx.witnesses.vkeyWitnesses} />}
                  </CollapsibleSection>
                </Grid>
                <Grid xs={12} md={4}>
                  <CollapsibleSection title="Scripts">
                    {tx && (
                      <PlutusContracts
                        nativeScripts={tx.witnesses?.nativeScripts}
                        plutusV3Scripts={tx.witnessess?.plutusV3Scripts}
                      />
                    )}
                  </CollapsibleSection>
                </Grid>
                <Grid xs={12} md={4}>
                  <CollapsibleSection title="MINT/BURN">
                    {tx && <Mints mint={tx.body?.mint} />}
                  </CollapsibleSection>
                </Grid>
              </Grid>
              {/* UTXO Inputs and Outputs side by side */}
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <CollapsibleSection title="UTXO INPUT(S)">
                    {tx && <UTXOInputs inputs={tx.body?.inputs} />}
                  </CollapsibleSection>
                </Grid>
                <Grid xs={12} md={6}>
                  <CollapsibleSection title="UTXO OUTPUT(S)">
                    {tx && <UTXOOutputs outputs={tx.body?.outputs} />}
                  </CollapsibleSection>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid xs={12} md={12}>
                  <CollapsibleSection title="TX CBOR">
                    {txRaw && <TXCBOR tx={txRaw} />}
                  </CollapsibleSection>
                </Grid>
              </Grid>
            </Stack>
          </Sheet>
        </ModalDialog>
      </Modal>
    </>
  )
}

// Component for displaying Witness Set
const VkeyWitnesses: React.FC<{ vkeyWitnesses: any }> = ({ vkeyWitnesses }) => {
  const mappedWitnessSet = Object.entries(vkeyWitnesses).map(([key, value], index) => (
    <React.Fragment key={index}>
      <Typography sx={professionalStyle}>
        {key}: {JSON.stringify(value, null, 2)}
      </Typography>
      <hr style={{ borderColor: '#E0E0E0', maxWidth: '500px' }} />
    </React.Fragment>
  ))

  return (
    <Sheet
      sx={{
        minHeight: '300px', // Set a minimum height
        maxHeight: '300px', // Set a maximum height
        overflowY: 'auto', // Add scroll if content exceeds maxHeight
        p: 2,
        bgcolor: '#1A1A1A',
        borderRadius: '8px',
        border: '1px solid #212121',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}
    >
      {mappedWitnessSet}
    </Sheet>
  )
}

// Component for displaying Plutus Contracts
const PlutusContracts: React.FC<{ nativeScripts: any; plutusV3Scripts: any }> = ({
  nativeScripts,
  plutusV3Scripts
}) => {
  return (
    <>
      {!nativeScripts || !plutusV3Scripts ? (
        <Typography sx={professionalStyle}>No Scripts</Typography>
      ) : (
        <Sheet
          sx={{
            minHeight: '300px', // Set a minimum height
            maxHeight: '300px', // Set a maximum height
            overflowY: 'auto', // Add scroll if content exceeds maxHeight
            p: 2,
            bgcolor: '#1A1A1A',
            borderRadius: '8px',
            border: '1px solid #212121',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          <br />
          <Typography sx={professionalStyle}>
            {nativeScripts !== undefined &&
              nativeScripts.map((script: any, index: number) => (
                <React.Fragment key={index}>
                  <Typography>Type: {script.type}</Typography>
                  <br />
                  <Typography>Description: {script.description}</Typography>
                  <br />
                  <Typography>cborHex: {script.cborHex}</Typography>
                  <hr style={{ borderColor: '#E0E0E0' }} />
                </React.Fragment>
              ))}
            {plutusV3Scripts !== undefined &&
              plutusV3Scripts.map((script: any, index: number) => (
                <React.Fragment key={index}>
                  <Typography>Type: {script.type}</Typography>
                  <br />
                  <Typography>Description: {script.description}</Typography>
                  <br />
                  <Typography>cborHex: {script.cborHex}</Typography>
                  <hr style={{ borderColor: '#E0E0E0' }} />
                </React.Fragment>
              ))}
          </Typography>
        </Sheet>
      )}
    </>
  )
}

// Component for displaying Mints
const Mints: React.FC<{ mint: any }> = ({ mint }) => {
  if (!mint) return <Typography sx={professionalStyle}>NO MINT DATA AVAILABLE</Typography>

  // Filter out empty policy IDs
  const filteredMint = Object.fromEntries(
    Object.entries(mint).filter(([policyId]) => policyId !== '')
  )

  return (
    <Sheet
      sx={{
        minHeight: '300px', // Set a minimum height
        maxHeight: '300px', // Set a maximum height
        overflowY: 'auto', // Add scroll if content exceeds maxHeight
        p: 2,
        bgcolor: '#1A1A1A',
        borderRadius: '8px',
        border: '1px solid #212121',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}
    >
      {mint !== undefined &&
        Object.entries(filteredMint).map(([policyId, assets]: any, index) => (
          <React.Fragment key={index}>
            <Typography sx={professionalStyle}>Policy ID: {policyId}</Typography>
            <Sheet sx={displayAssets}>
              {Object.entries(assets)
                .filter(([assetName]) => assetName !== '')
                .map(([assetName, quantity]: any) => (
                  <Typography key={assetName}>
                    {Buffer.from(assetName, 'hex').toString()}: {quantity}
                  </Typography>
                ))}
            </Sheet>
            <hr style={{ borderColor: '#E0E0E0', maxWidth: '500px' }} />
          </React.Fragment>
        ))}
    </Sheet>
  )
}

const UTXOInputs: React.FC<{ inputs: any[] }> = ({ inputs }) => {
  if (!inputs || inputs.length === 0)
    return <Typography sx={professionalStyle}>NO UTXO INPUTS AVAILABLE</Typography>

  return (
    <Sheet
      sx={{
        maxHeight: '400px', // Set a maximum height
        overflowY: 'auto', // Add scroll if content exceeds maxHeight
        p: 2,
        bgcolor: '#1A1A1A',
        borderRadius: '8px',
        border: '1px solid #212121',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}
    >
      {inputs !== undefined &&
        inputs.map((input, index) => (
          <Sheet
            key={index}
            sx={{
              mt: 1,
              p: 1,
              bgcolor: '#1E1E1E',
              borderRadius: '8px',
              border: '1px solid #212121',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              width: '100%'
            }}
          >
            <Typography sx={professionalStyle}>
              Address: {input?.resolved?.address || 'N/A'}
            </Typography>

            <Sheet sx={displayAssets}>
              <Typography>Lovelaces: {input?.resolved?.value?.['']?.[''] || 'N/A'}</Typography>
              {Object.entries(input?.resolved?.value || {})
                .filter(([k]) => k !== '')
                .map(([policyId, assets]) =>
                  Object.entries(assets || {}).map(([assetName, quantity]) => (
                    <Typography key={assetName}>
                      {Buffer.from(assetName, 'hex').toString()}: {quantity}
                    </Typography>
                  ))
                )}
            </Sheet>
          </Sheet>
        ))}
    </Sheet>
  )
}

const UTXOOutputs: React.FC<{ outputs: any[] }> = ({ outputs }) => {
  if (!outputs || outputs.length === 0)
    return <Typography sx={professionalStyle}>NO UTXO OUTPUTS AVAILABLE</Typography>

  return (
    <Sheet
      sx={{
        maxHeight: '400px',
        overflowY: 'auto',
        p: 2,
        bgcolor: '#1A1A1A',
        borderRadius: '8px',
        border: '1px solid #212121',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        margin: '0 auto',
        width: '100%'
      }}
    >
      <Typography level="body-md" sx={sectionTitleStyle}>
        UTXO OUTPUT(S)
      </Typography>
      {outputs.map((output, index) => (
        <Sheet
          key={index}
          sx={{
            mt: 1,
            p: 1,
            bgcolor: '#1E1E1E',
            borderRadius: '8px',
            border: '1px solid #212121',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
            <Typography sx={{ ...professionalStyle, flexGrow: 1, fontSize: '1em' }}>
              Address: {output?.address || 'N/A'}
            </Typography>
          </div>

          <Sheet sx={displayAssets}>
            <Typography sx={{ fontSize: '0.9em', marginLeft: '15px' }}>
              Lovelaces: {output?.value?.['']?.[''] || 'N/A'}
            </Typography>

            {Object.entries(output?.value || {})
              .filter(([k]) => k !== '')
              .map(([policyId, assets]) =>
                Object.entries(assets || {}).map(([assetName, quantity]) => (
                  <Typography key={assetName} sx={{ fontSize: '0.9em', marginLeft: '15px' }}>
                    {Buffer.from(assetName, 'hex').toString()}: {quantity}
                  </Typography>
                ))
              )}
          </Sheet>
        </Sheet>
      ))}
    </Sheet>
  )
}

const TXCBOR: React.FC<{ tx: any }> = ({ tx }) => {
  if (!tx) return <Typography sx={professionalStyle}>NO UTXO OUTPUTS AVAILABLE</Typography>

  return (
    <Sheet
      sx={{
        maxHeight: '400px',
        overflowY: 'auto',
        p: 2,
        bgcolor: '#1A1A1A',
        borderRadius: '8px',
        border: '1px solid #212121',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        margin: '0 auto',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
        <Typography sx={{ ...professionalStyle, flexGrow: 1, fontSize: '1em' }}>
          {tx.toCbor().toString()}
        </Typography>
      </div>
    </Sheet>
  )
}
