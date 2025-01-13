import * as React from 'react'
import { Sheet, Button, Stack, Modal, ModalClose, Typography } from '@mui/joy'
import { SelectNode, NodeFaqs } from './SelectNode' 
import { SelectIndexer, IndexerFaqs } from './SelectIndexer'

interface NodeConfigModalProps {
  // Add any props here if needed
}

export const NodeConfigModal: React.FC<NodeConfigModalProps> = () => {
  const [open, setOpen] = React.useState<boolean>(false)
  const [selectedNode, setSelectedNode] = React.useState<string>('ogmios')
  const [nodeHost, setNodeHost] = React.useState<string>('hostname:port')
  const [nodeApiHeader, setNodeApiHeader] = React.useState<string>('')
  const [nodeApiKey, setNodeApiKey] = React.useState<string>('')

  const [selectedIndexer, setSelectedIndexer] = React.useState<string>('')
  const [indexerHost, setIndexerHost] = React.useState<string>('hostname:port')
  const [indexerApiHeader, setIndexerApiHeader] = React.useState<string>('')
  const [indexerApiKey, setIndexerApiKey] = React.useState<string>('')

  return (
    <>
      <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
        Configure Node
      </Button>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <>
          <Sheet
            sx={{
              top: 60,
              left: 60,
              width: 1400,
              height: 800,
              overflowY: 'auto',
              p: 4,
              bgcolor: 'background.body',
              color: 'text.primary'
            }}
          >
             <ModalClose variant="plain" sx={{ m: 1 }} />
            <Stack direction="row" spacing={2} justifyContent="center">
              {/*Sheet Node configuration*/}
              <SelectNode
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                host={nodeHost}
                setHost={setNodeHost}
                apiHeader={nodeApiHeader}
                setApiHeader={setNodeApiHeader}
                apiKey={nodeApiKey}
                setApiKey={setNodeApiKey}
              />
              {/*Sheet Indexer configuration*/}
              <SelectIndexer
                selectedIndexer={selectedIndexer}
                setSelectedIndexer={setSelectedIndexer}
                host={indexerHost}
                setHost={setIndexerHost}
                apiHeader={indexerApiHeader}
                setApiHeader={setIndexerApiHeader}
                apiKey={indexerApiKey}
                setApiKey={setIndexerApiKey}
              />
            </Stack>
            <br />
            <Sheet
            sx={{
              textAlign: 'center',
              p: 1
            }}>
              <Typography level="body-md">
                At the current stage you need at least and Ogmios instance hooked up to a Cardano Node.
              </Typography>
            </Sheet>
            <Sheet>
              <InfraFAQ />
            </Sheet>
          </Sheet>
        </>
      </Modal>
    </>
  )
}

const InfraFAQ: React.FC = () => {
  return (
    <Sheet
      sx={{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        p: 1,
        bgcolor: 'background.body',
        color: 'text.primary'
      }}
    >
      <br />
      <hr />
      <br />
      <Typography level="h2" mb={3} textAlign="center">
        Infrastructure
      </Typography>
      <InfraFaqs />
      <br />
      <hr />
      <br />
      <NodeFaqs />
      <br />
      <hr />
      <IndexerFaqs />
    </Sheet>
  )
}

const InfraFaqs: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <Sheet>
      <Typography level="body-md">
        Infrastructure for a blockchain network is a crucial part of the network's success. And
        there are many differnt ways you can access the data of a blockchain.
      </Typography>

      {!expanded ? (
        <Button onClick={toggleExpand} sx={{ mt: 2 }}>
          Read More
        </Button>
      ) : (
        <>
          <Typography level="body-md">
            The Merkaba embraces the fact that there are many differnt methods to ingress and egress
            data into a blockchain through many differnt services. Whether self hosted or cloud
            solutions.
          </Typography>
          <Button onClick={toggleExpand} sx={{ mt: 2 }}>
            Show Less
          </Button>
        </>
      )}
    </Sheet>
  )
}

