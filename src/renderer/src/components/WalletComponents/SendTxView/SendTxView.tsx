import * as React from 'react'
import { Sheet, Typography, Input, Button, Select, Option, Box, IconButton, List, ListItem } from '@mui/joy'
import CloseIcon from '@mui/icons-material/Close'
import { getProtocolParametersOgmios } from '../../../API/ogmios'
import { backendHook } from '../../../hooks/backendHook'
import { toUtf8, fromHex } from '@harmoniclabs/uint8array-utils'
import { ProcessTxModal } from '../../ProcessTxModal/ProcessTxModal'
import { accentStyle, } from './styles'
import { txBuilder_buildooor } from './txBuilder'

interface Token {
  policyId: string
  assetName: string
  amount: number
}

interface UtxoOutput {
  address: string
  value: {
    coins: number
    assets: { [key: string]: number }
  }
}

interface SendTxViewProps {
  accountInfo: any
}

export const SendTxView: React.FC<SendTxViewProps> = ({ accountInfo }) => {
  const [utxoOutputs, setUtxoOutputs] = React.useState<UtxoOutput[]>([])
  const [receivingAddress, setReceivingAddress] = React.useState('')
  const [currentAmount, setCurrentAmount] = React.useState<number>(0)
  const [currentTokens, setCurrentTokens] = React.useState<Token[]>([])
  const [selectedToken, setSelectedToken] = React.useState<{
    policyId: string
    assetName: string
  } | null>(null)
  const [tokenAmount, setTokenAmount] = React.useState<number>(0)
  const [lovelaces, setLovelaces] = React.useState<number>(0)
  const [backEnd, setBackEnd]: [string | null, (config: string) => Promise<void>] = backendHook()

  const handleAddUtxo = () => {
    const newUtxo: UtxoOutput = {
      address: receivingAddress,
      value: {
        coins: currentAmount * 1000000,
        assets: currentTokens.reduce(
          (acc, token) => {
            acc[`${token.policyId}.${token.assetName}`] = token.amount
            return acc
          },
          {} as { [key: string]: number }
        )
      }
    }
    setUtxoOutputs([...utxoOutputs, newUtxo])

    // Reset form
    setReceivingAddress('')
    setCurrentAmount(0)
    setCurrentTokens([])
  }

  const handleAddToken = () => {
    if (selectedToken && tokenAmount > 0) {
      setCurrentTokens([
        ...currentTokens,
        {
          policyId: selectedToken.policyId,
          assetName: selectedToken.assetName,
          amount: tokenAmount
        }
      ])
      setSelectedToken(null)
      setTokenAmount(0)
    }
  }

  const handleRemoveUtxo = (index: number, output: UtxoOutput) => {
    setUtxoOutputs(utxoOutputs.filter((_, i) => i !== index))
    console.log('lovelaces', lovelaces)
    setLovelaces(Number(lovelaces) + Number(output.value.coins))
  }

  const handleRemoveToken = (index: number) => {
    setCurrentTokens(currentTokens.filter((_, i) => i !== index))
  }

  const availableTokens = Object.entries(accountInfo?.value?.assets || {}).flatMap(
    ([policyId, assets]: any) =>
      Object.entries(assets).map(([assetName, amount]) => ({ policyId, assetName, amount }))
  )

  const handleSetCurrentAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    if (!isNaN(newValue)) {
      // Update currentAmount first
      setCurrentAmount(newValue)
      // Then update lovelaces based on the new currentAmount
      setLovelaces(accountInfo.value.lovelace - newValue * 1000000)
    } else {
      // Reset to 0 if input is not a valid number
      setCurrentAmount(0)
      setLovelaces(accountInfo.value.lovelace)
    }
  }

  const getProtocolParams = async () => {
    const backend = JSON.parse(backEnd as any)
    let params: any
    backend &&
      backend[0] === 'ogmios' &&
      (params = await getProtocolParametersOgmios())
    // console.log('params', params)
    return params
  }

  const genMetadata = () => {
    const metadata = {
      label: 420,
      properties: {
        type: 'Cardano Merkaba',
        message: 'Cardano Merkaba IN THE HOUSE',
        message2: 'TX Crafted With PLU-TS'
      }
    }
    return metadata
  }

  const processTx = async (address_xprv) => {
    const protocolParams = await getProtocolParams()
    console.log('protocolParams', protocolParams)
    const metadata = genMetadata()
    return await txBuilder_buildooor(
      protocolParams,
      accountInfo.utxos,
      utxoOutputs,
      accountInfo.account.baseAddress_bech32,
      address_xprv,
      metadata
    )
  }

  React.useEffect(() => {
    accountInfo && accountInfo.value && setLovelaces(accountInfo.value.lovelace)
  }, [accountInfo])

  return (
    <Sheet
      sx={{
        bgcolor: 'background.level1',
        borderRadius: 'md',
        p: 4,
        width: '100%',
        margin: 'auto',
        mt: 4
      }}
    >
      <Typography level="h4" mb={2}>
        Send Transaction
      </Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography level="body-md" mr={0}>
          Account:
        </Typography>
        <Button variant="outlined" color="primary">
          {accountInfo?.account?.accountName}
        </Button>
        <Typography level="body-md" ml={1}>
          Available ADA:
        </Typography>
        <Button variant="outlined" color="primary">
          ₳{(lovelaces / 1000000).toFixed(6)}
        </Button>
      </Box>
      <hr />
      <br />
      <Input
        placeholder="Address"
        fullWidth
        value={receivingAddress}
        onChange={(e) => setReceivingAddress(e.target.value)}
        endDecorator={
          <IconButton variant="plain" onClick={() => setReceivingAddress('')}>
            <CloseIcon />
          </IconButton>
        }
        sx={{ mb: 2 }}
      />
      <Input
        placeholder="ADA Amount (in lovelace)"
        type="number"
        fullWidth
        value={currentAmount}
        onChange={(e) => handleSetCurrentAmount(e)}
        endDecorator={
          <IconButton
            variant="plain"
            onClick={() => {
              setLovelaces(Number(currentAmount * 1000000) + Number(lovelaces))
              setCurrentAmount(0)
            }}
          >
            <CloseIcon />
          </IconButton>
        }
        sx={{ mb: 2 }}
      />
      <Box display="flex" alignItems="center" mb={2}>
        <Select
          placeholder="Select Token/s to send"
          value={selectedToken ? `${selectedToken.policyId}.${selectedToken.assetName}` : ''}
          onChange={(_, newValue) => {
            if (newValue) {
              const [policyId, assetName] = newValue.split('.')
              setSelectedToken({ policyId, assetName })
            }
          }}
          sx={{ mr: 1, flexGrow: 1 }}
        >
          {availableTokens.map((token, index) => (
            <Option key={index} value={`${token.policyId}.${token.assetName}`}>
              {token.policyId} - {toUtf8(fromHex(token.assetName))} - {`${token.amount}`}
            </Option>
          ))}
        </Select>
        <Input
          placeholder="Token Amount"
          type="number"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(Number(e.target.value))}
          sx={{ width: '150px' }}
        />
        <Button onClick={handleAddToken}>Add Token</Button>
      </Box>

      {/* Displaying added tokens */}
      <Box alignItems="center" p={2}>
        <Typography level="h4" mb={2}>
          Added Tokens
        </Typography>
        <Box display="flex" alignItems="center" p={2} border="1px solid black">
          <List>
            {currentTokens.map((token, index) => (
              <ListItem key={index}>
                <Typography>{`${token.policyId} - ${toUtf8(fromHex(token.assetName))} - ${token.amount}`}</Typography>
                <IconButton variant="plain" onClick={() => handleRemoveToken(index)}>
                  <CloseIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" mb={2}>
      <Button
        sx={{ m: 2, cursor: 'pointer', ...accentStyle, color: '#121212' }}
        onClick={() => handleAddUtxo()}
      >
          Add Output
        </Button>
      </Box>

      {/* Displaying added UTXO outputs */}
      <Typography level="h4" mb={2}>
        UTXO Outputs
      </Typography>
      <Sheet sx={{ background: '#1E1E1E', p: 2, borderRadius: 'sm' }}>
        {utxoOutputs.map((output, index) => (
          <Box
            key={index}
            sx={{
              mb: 1,
              p: 1,
              bgcolor: 'background.level2',
              borderRadius: 'sm',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography level="body-sm">Address: {output.address}</Typography>
              <Typography level="body-sm">
                Amount: ₳{(output.value.coins / 1000000).toFixed(6)}
              </Typography>
              <Typography level="body-sm">Tokens: {JSON.stringify(output.value.assets)}</Typography>
            </Box>
            <IconButton variant="plain" onClick={() => handleRemoveUtxo(index, output)}>
              <CloseIcon />
            </IconButton>
          </Box>
        ))}

      </Sheet>
      <ProcessTxModal processTx={processTx} accountInfo={accountInfo} />
    </Sheet>
  )
}
