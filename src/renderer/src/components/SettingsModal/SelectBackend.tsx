import * as React from 'react'
import { Sheet, Stack, Input, RadioGroup, FormControl, FormLabel, Radio, Typography, Tooltip } from '@mui/joy'
import { backendHook } from '../../hooks/backendHook'

interface SelectBackendProps {}

export const SelectBackend: React.FC<SelectBackendProps> = ({}) => {
  const [backEnd, setBackEnd]: [string | null, (config: string) => Promise<void>] = backendHook()

  const handleSelectBackend = (value: string, newBackend: string) => {
    let backendTuple
    try {
      backendTuple = JSON.parse(backEnd || '["", "", "", ""]') // Default to an empty tuple if backEnd is null or undefined
    } catch (error) {
      console.error('Failed to parse backend configuration:', error)
      backendTuple = ['', '', '', '']
    }

    switch (newBackend) {
      case 'nodeType':
        backendTuple[0] = value
        break
      case 'host':
        backendTuple[1] = value
        break
      case 'apiHeader':
        backendTuple[2] = value
        break
      case 'apiKey':
        backendTuple[3] = value
        break
      default:
        break
    }

    setBackEnd(JSON.stringify(backendTuple))
    console.log('backendTuple', backendTuple)
  }

  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 500,
        borderRadius: 'md',
        p: 3,
        boxShadow: 'lg'
      }}
    >
      <Typography
        component="h2"
        id="modal-title"
        level="h4"
        textColor="inherit"
        sx={{ fontWeight: 'lg', mb: 1 }}
      >
        Node Configuration
      </Typography>

      <FormControl>
        <FormLabel id="node-label">Selected Node:</FormLabel>
        <RadioGroup
          aria-labelledby="node-label"
          name="node"
          value={JSON.parse(backEnd || '["", "", "", ""]')[0]}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSelectBackend(e.target.value, 'nodeType')
          }
        >
          <Tooltip
            title={
              <>
                <a href="https://github.com/cardanosolutions/ogmios" target="_blank">
                  Ogmios
                </a>
                : used for fetching stake pool, rewards, governance and even Address UTXOs from the
                Cardano Node. <br /> Not needed if using: DBSync, Blockfrost.
                <br /> cloud services like{' '}
                <a href="https://demeter.run" target="_blank">
                  {' '}
                  demeter.run
                </a>{' '}
                are supported.
              </>
            }
            color="primary"
            placement="top"
            variant="outlined"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Radio value="ogmios" />
              <label style={{ marginLeft: '8px' }}>Ogmios</label>
            </div>
          </Tooltip>
          <Tooltip
            title={
              <>
                Kupo is fast, lightweight and configurable chain-index for the Cardano blockchain.
                <br />
                It synchronizes data from the blockchain according to patterns matching addresses
                <br />
                present in transaction outputs and builds a lookup table from matches to their
                <br />
                associated output references, values, datums and scripts.
                <br />
                <br />
                Should be paired with Ogmios if you want to have all Stake, Pool, Rewards,
                Governance data.
              </>
            }
            color="primary"
            placement="top"
            variant="outlined"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Radio value="kupo" disabled />
              <label style={{ marginLeft: '8px' }}>Kupo(pending implementation</label>
            </div>
          </Tooltip>
          <Tooltip
            title={
              <>
                Tap into Cardano's potential with our comprehensive set of API endpoints. Create
                dApps, transact and explore the blockchain.
                <br />
                Using Blockforst you don't need services liie Ogmios or Kupo. Blockfrost is a all in
                one copmprehensive Cardano API provider.
              </>
            }
            color="primary"
            placement="top"
            variant="outlined"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Radio value="blockfrost" disabled />
              <label style={{ marginLeft: '8px' }}>Blockfrost</label>
            </div>
          </Tooltip>
        </RadioGroup>
      </FormControl>

      {backEnd && ( // This check ensures backEnd isn't null or undefined
        <Stack spacing={2} mt={2}>
          {/* Here, we need to parse backEnd before accessing its elements */}
          <Tooltip
            title={
              <>
                location of Ogmios instance whether cloud solution or local: ws://localhost:1337{' '}
                <br />
                or an IP address of another machine on your network: ws://192.168.1.420
                <br />
                or a cloud instance like demeter.run, you can just use the Authenticated Endpoint URL they provide and don't forget to use wss:// vs https://
              </>
            }
            color="primary"
            placement="top"
            variant="outlined"
          >
            <Input
              placeholder="Host Address: wss://hostname:port"
              value={JSON.parse(backEnd)[1]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSelectBackend(e.target.value, 'host')
              }
              fullWidth
            />
          </Tooltip>
          {/* Similarly for other inputs */}
          <Tooltip
            title={
              <>
                If you're using a service cloud hoststed service for your Ogmios instance, you may
                need to provide an API key. <br />
                Differnt services might specify their own naming convention for example:
                dmtr-api-key, or api-key, or x-api-key or project_id. <br />
              </>
            }
            color="primary"
            placement="top"
            variant="outlined"
          >
            <Input
              placeholder="API Header (optional)"
              value={JSON.parse(backEnd)[2]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSelectBackend(e.target.value, 'apiHeader')
              }
              fullWidth
            />
          </Tooltip>
          <Input
            placeholder="API Key (optional)"
            value={JSON.parse(backEnd)[3]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSelectBackend(e.target.value, 'apiKey')
            }
            fullWidth
          />
        </Stack>
      )}

      <Typography id="modal-desc" textColor="text.tertiary" mt={2}>
        Configure your Node settings here.
      </Typography>
    </Sheet>
  )
}
