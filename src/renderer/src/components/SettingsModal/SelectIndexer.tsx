import * as React from 'react'
import { Sheet, Button, Stack, Input, RadioGroup, FormControl, FormLabel, Radio, Typography } from '@mui/joy'





interface SelectIndexerProps {
  selectedIndexer: string
  setSelectedIndexer: (setSelectedIndexer: string) => void
  host: string
  setHost: (setHost: string) => void
  apiHeader: string
  setApiHeader: (setApiHeader: string) => void
  apiKey: string
  setApiKey: (setApiKey: string) => void
}

export const SelectIndexer: React.FC<SelectIndexerProps> = ({
  selectedIndexer,
  setSelectedIndexer,
  host,
  setHost,
  apiHeader,
  setApiHeader,
  apiKey,
  setApiKey
}) => {
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
        Indexer Configuration
      </Typography>

      <FormControl>
        <FormLabel id="indexer-label">Selected Indexer:</FormLabel>
        <RadioGroup
          aria-labelledby="indexer-label"
          name="indexer"
          value={selectedIndexer}
          onChange={(e) => setSelectedIndexer(e.target.value)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Radio value="kupo" />
            <label style={{ marginLeft: '8px' }}>Kupo Indexer</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Radio value="dbsync" disabled />
            <label style={{ marginLeft: '8px' }}>DBSync</label>
          </div>          
        </RadioGroup>
      </FormControl>

      <Stack spacing={2} mt={2}>
        <Input
          placeholder="Host Address: https://hostname:port"
          value={host}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHost(e.target.value)}
          fullWidth
        />
        <Input
          placeholder="API Header (optional)"
          value={apiHeader}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiHeader(e.target.value)}
          fullWidth
        />
        <Input
          placeholder="API Key (optional)"
          value={apiKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
          fullWidth
        />
      </Stack>

      <Typography id="modal-desc" textColor="text.tertiary" mt={2}>
        Configure your Indexer settings here.
      </Typography>
    </Sheet>
  )
}

export const IndexerFaqs: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <Sheet>
      <Typography level="h2">Indexers</Typography>

      <Typography level="body-md">
        Indexers in a utxo type of blockchains are like the history clerics. They keep track of all
        the transactions that have ever happened on the blockchain. They index the transactions, the
        addresses, the tokens, and the metadata. They are the ones that allow you to query the
        blockchain for information.
      </Typography>

      {!expanded ? (
        <Button onClick={toggleExpand} sx={{ mt: 2 }}>
          Read More
        </Button>
      ) : (
        <>
          <Typography level="body-md" mt={2}>
            So why a indexer, when we have a node that stores data? In the UTXO world, the node only
            keeps track of UTXOs that have been unspent, hence the name "Unspent Transaction
            Output."
          </Typography>
          <Typography level="body-md" mt={2}>
            When a transaction on a UTXO blockchain is created there is always a UTXO that's spent
            and at least a UTXO
          </Typography>
          <Button onClick={toggleExpand} sx={{ mt: 2 }}>
            Show Less
          </Button>
        </>
      )}
    </Sheet>
  )
}