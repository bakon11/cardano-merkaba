import * as React from 'react'
import { Sheet, Typography } from '@mui/joy'
import { CborHomeTabs } from './CborHomeTabs'

export const CborHomeView: React.FC = () => {
  


  return (
    <>
      <Sheet
        sx={{
          top: 60,
          left: 30,
          width: '100%',
          height: 'auto',
          minWidth: 1600,
          maxHeight: 1200,
          minHeight: 1000,
          // overflowY: 'scroll',
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
