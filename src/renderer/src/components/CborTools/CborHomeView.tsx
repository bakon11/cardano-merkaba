import * as React from 'react'
import { Sheet, Typography } from '@mui/joy'
import { CborHomeTabs } from './CborHomeTabs'

export const CborHomeView: React.FC = () => {
  


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
        <CborHomeTabs /> 
      </Sheet>
    </>
  )
}
