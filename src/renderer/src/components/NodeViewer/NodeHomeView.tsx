import * as React from 'react'
import { Sheet } from '@mui/joy'
import { NodeSyncView } from './NodeSync'

export const NodeHomeView: React.FC = () => {

  return (
    <>
      <Sheet
      sx={{
        top: 30,
        left: 60,
        width: "80vw",
        height: "90vh",
        overflowY: 'auto',
        p: 4,
        bgcolor: 'background.body',
        color: 'text.primary'
      }}
      >
        <NodeSyncView /> 
      </Sheet>
    </>
  )
}
