import * as React from 'react'
import { Sheet, Button, Stack, Input, RadioGroup, FormControl, FormLabel, Radio, Typography } from '@mui/joy'

interface SelectNodeProps {
  selectedNode: string
  setSelectedNode: (setSelectedNode: string) => void
  host: string
  setHost: (setHost: string) => void
  apiHeader: string
  setApiHeader: (setApiHeader: string) => void
  apiKey: string
  setApiKey: (setApiKey: string) => void
}

export const SelectNode: React.FC<SelectNodeProps> = ({
  selectedNode,
  setSelectedNode,
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
        Node Configuration
      </Typography>

      <FormControl>
        <FormLabel id="node-label">Selected Node:</FormLabel>
        <RadioGroup
          aria-labelledby="node-label"
          name="node"
          value={selectedNode}
          onChange={(e) => setSelectedNode(e.target.value)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Radio value="ogmios" />
            <label style={{ marginLeft: '8px' }}>Ogmios - Cardano Node</label>
          </div>
        </RadioGroup>
      </FormControl>

      {selectedNode && (
        <Stack spacing={2} mt={2}>
          <Input
            placeholder="Host Address: https://hostname:port"
            value={host}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHost(e.target.value)}
            fullWidth
          />
          <Input
            placeholder="API Header"
            value={apiHeader}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiHeader(e.target.value)}
            fullWidth
          />
          <Input
            placeholder="API Key"
            value={apiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
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

export const NodeFaqs: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <Sheet>
      <Typography level="h2">Nodes</Typography>

      <Typography level="body-md">
        Nodes are the backbone of the Cardano network and, pretty much, any blockchain for that
        matter. They are responsible for validating transactions, blocks, and participating in the
        consensus protocol. There are different types of nodes, such as Relay Nodes, Core Nodes, and
        Edge Nodes. Each node has a specific role in the network. Running your own node is probably
        the first and most important step you can take in supporting a network and decentralization.
      </Typography>

      {!expanded ? (
        <Button onClick={toggleExpand} sx={{ mt: 2 }}>
          Read More
        </Button>
      ) : (
        <>
          <Typography level="body-md" mt={2}>
            Currently on Cardano, the go-to node is the Haskell Cardano Node. However, there are
            other options being developed, and some are further along than others. But they all have
            extreme potential, and node diversification is one of the more important metrics in
            blockchain decentralization.
          </Typography>
          <Typography level="body-md" mt={2}>
            The only means to connect to a Cardano Node to query it for any information is through
            the IPC (Inter-Process Communication) protocol. The IPC protocol only really supports
            local direct connections. So solutions like Ogmios have been developed to allow for
            remote connections to a Cardano Node.
          </Typography>
          <Typography level="body-md" mt={2}>
            Ogmios connects to a Cardano Node through IPC and then exposes an API and a WebSocket
            connection, through which external applications, for example, like the Cardano Merkaba,
            can connect to the Cardano Node and query it for information.
          </Typography>
          <Typography level="body-md" mt={2}>
            Understandably, not everyone might have access to an internet connection or the hardware
            to always run something like a Cardano Node on it, nor is it feasible to have a node
            always running on your everyday machine.
          </Typography>
          <Typography level="body-md" mt={2}>
            Hence, there are cloud solutions like https://demeter.run which offer Cardano
            infrastructure services in the cloud.
          </Typography>
          <Typography level="body-md" mt={2}>
            Demeter.run offers services like Ogmios, Kupo, and other services to help you connect to
            the Cardano network without having to run a node yourself.
          </Typography>
          <Typography level="body-md" mt={2}>
            However, that's not the only option; there are also services like BlockFrost.io, which
            offer a rich set of APIs for the Cardano Network. In this case, you don't need anything
            else but an API key, and with how vast the BlockFrost API collection is, you can almost
            get anything you need to interact with the Cardano Network.
          </Typography>
          <Button onClick={toggleExpand} sx={{ mt: 2 }}>
            Show Less
          </Button>
        </>
      )}
    </Sheet>
  )
}