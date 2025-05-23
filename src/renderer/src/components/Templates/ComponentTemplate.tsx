import * as React from 'react'
import { Sheet, Typography } from '@mui/joy'

export const TemplateView: React.FC = () => {
  return (
    <>
      <Typography level="h4">Title</Typography>
      <Sheet
        sx={{
          top: 20,
          left: 60,
          width: '100%',
          height: 'auto',
          minWidth: 1600,
          maxHeight: 1000,
          minHeight: 800,
          overflowY: 'scroll',
          p: 4,
          bgcolor: 'background.body',
          color: 'text.primary'
        }}
      >

        
      </Sheet>
    </>
  )
}
